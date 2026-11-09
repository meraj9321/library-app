const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata';

let tokenClient;
let accessToken = null;

function loadGIS() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const existing = document.querySelector('script[data-google-identity]');
    if (existing) { existing.addEventListener('load', resolve, { once:true }); existing.addEventListener('error', reject, { once:true }); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true; script.defer = true; script.dataset.googleIdentity = 'true';
    script.onload = resolve; script.onerror = reject; document.head.appendChild(script);
  });
}

export async function connectGoogleDrive() {
  if (!CLIENT_ID) throw new Error('Add VITE_GOOGLE_CLIENT_ID to client/.env first.');
  await loadGIS();
  return new Promise((resolve, reject) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID, scope: SCOPES,
      callback: response => {
        if (response.error) return reject(new Error(response.error_description || response.error));
        accessToken = response.access_token;
        sessionStorage.setItem('driveConnected', 'true');
        resolve(true);
      }
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export function isDriveConnected() { return Boolean(accessToken); }
async function driveRequest(url, options = {}) {
  if (!accessToken) throw new Error('Connect Google Drive first.');
  const response = await fetch(url, { ...options, headers: { Authorization:`Bearer ${accessToken}`, ...(options.headers || {}) } });
  if (!response.ok) throw new Error(`Google Drive request failed (${response.status}).`);
  return response;
}
async function findAppDataFile(name) {
  const q = encodeURIComponent(`name='${name}' and trashed=false`);
  const response = await driveRequest(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,name)`);
  const data = await response.json(); return data.files?.[0] || null;
}
async function uploadJson(name, json, existingId) {
  const metadata = { name, mimeType:'application/json', ...(existingId ? {} : { parents:['appDataFolder'] }) };
  const boundary = 'library_boundary_' + Date.now();
  const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(json)}\r\n--${boundary}--`;
  const url = existingId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=multipart`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  await driveRequest(url, { method: existingId ? 'PATCH':'POST', headers:{'Content-Type':`multipart/related; boundary=${boundary}`}, body });
}
async function ensureLibraryFolder() {
  const q = encodeURIComponent("name='My Library' and mimeType='application/vnd.google-apps.folder' and trashed=false");
  const found = await (await driveRequest(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`)).json();
  if (found.files?.[0]) return found.files[0].id;
  const created = await (await driveRequest('https://www.googleapis.com/drive/v3/files?fields=id', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ name:'My Library', mimeType:'application/vnd.google-apps.folder' })
  })).json();
  return created.id;
}
async function uploadBlob(file, name, folderId, existingId) {
  const metadata = { name, ...(existingId ? {} : { parents:[folderId] }) };
  const boundary = 'library_file_' + Date.now();
  const blob = new Blob([
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`,
    file, `\r\n--${boundary}--`
  ], { type:`multipart/related; boundary=${boundary}` });
  const url = existingId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=multipart&fields=id`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id';
  return (await (await driveRequest(url, { method:existingId?'PATCH':'POST', body:blob })).json()).id;
}
export async function backupLibrary(books, notes, collections, progress, bookmarks) {
  const folderId = await ensureLibraryFolder();
  const records = [];
  for (const book of books) {
    const driveId = await uploadBlob(book.file, book.fileName || `${book.title}.${book.format.toLowerCase()}`, folderId, book.driveId);
    records.push({ ...book, driveId });
  }
  const manifestBooks = records.map(({ file, ...book }) => book);
  const manifest = { version:1, savedAt:new Date().toISOString(), books:manifestBooks, notes, collections, progress, bookmarks };
  const existing = await findAppDataFile('my-library-manifest.json');
  await uploadJson('my-library-manifest.json', manifest, existing?.id);
  return { count:records.length, updatedBooks:records };
}
export async function restoreLibrary() {
  const manifestFile = await findAppDataFile('my-library-manifest.json');
  if (!manifestFile) throw new Error('No My Library backup was found in this Google account.');
  const meta = await (await driveRequest(`https://www.googleapis.com/drive/v3/files/${manifestFile.id}?alt=media`)).json();
  const books = [];
  for (const book of (meta.books || [])) {
    const response = await driveRequest(`https://www.googleapis.com/drive/v3/files/${book.driveId}?alt=media`);
    const blob = await response.blob();
    books.push({ ...book, file:blob });
  }
  return { books, notes:meta.notes || [], collections:meta.collections || [], progress:meta.progress || [], bookmarks:meta.bookmarks || [] };
}
export function disconnectGoogleDrive() {
  if (accessToken) window.google?.accounts?.oauth2?.revoke(accessToken, () => {});
  accessToken = null; sessionStorage.removeItem('driveConnected');
}
