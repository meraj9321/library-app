import { all, get, put, remove } from './db';
export { all } from './db';

const id = () => crypto.randomUUID();

export async function listBooks() { return (await all('books')).sort((a,b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')); }
export async function getBook(bookId) { return get('books', bookId); }

export async function addBook(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const formats = { pdf:'PDF', epub:'EPUB', docx:'DOCX', txt:'TXT' };
  if (!formats[ext]) throw new Error('Supported formats are PDF, EPUB, DOCX and TXT.');
  const book = {
    id: id(), title: file.name.replace(/\.[^.]+$/, ''), author: '', description: '',
    format: formats[ext], file, fileName: file.name, fileSize: file.size,
    collectionId: null, favorite: false, createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await put('books', book);
  return book;
}
export async function updateBook(book) { book.updatedAt = new Date().toISOString(); await put('books', book); return book; }
export async function deleteBook(bookId) {
  await remove('books', bookId);
  for (const store of ['notes','bookmarks','highlights','progress']) {
    const items = await all(store);
    for (const item of items) if (item.bookId === bookId) await remove(store, item.id || item.bookId);
  }
}
export async function saveProgress(bookId, position, extra = {}) {
  await put('progress', { bookId, position, ...extra, updatedAt: new Date().toISOString() });
}
export async function getProgress(bookId) { return get('progress', bookId); }
export async function addNote(bookId, content, anchor = '') {
  const note = { id:id(), bookId, content, anchor, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() };
  await put('notes', note); return note;
}
export async function deleteNote(noteId) { return remove('notes', noteId); }
export async function addBookmark(bookId, position, label) {
  const item = { id:id(), bookId, position, label:label || `Saved position`, createdAt:new Date().toISOString() };
  await put('bookmarks', item); return item;
}
export async function addCollection(name) {
  const item = { id:id(), name:name.trim(), createdAt:new Date().toISOString() };
  await put('collections', item); return item;
}
export async function storageUsage() {
  const books = await listBooks();
  return { count: books.length, bytes: books.reduce((sum, b) => sum + (b.fileSize || 0), 0) };
}

export async function addHighlight(bookId, quote, anchor = '') {
  const item = { id:id(), bookId, quote, anchor, createdAt:new Date().toISOString() };
  await put('highlights', item); return item;
}
export async function deleteHighlight(highlightId) { return remove('highlights', highlightId); }
