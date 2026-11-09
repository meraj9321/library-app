# My Library — Local-first digital library

A full-stack, multi-user digital library built with React + Vite, Express, MongoDB, IndexedDB and optional Google Drive.

## Features
- User registration, login and logout (server-side sessions)
- Local-first document library using IndexedDB (PDF, EPUB, DOCX, TXT)
- Upload, search, sort, favourite, edit metadata and delete books
- Collections with book assignment and collection-specific browsing
- PDF reader (PDF.js), EPUB reader (epub.js), DOCX reader (Mammoth), TXT reader
- Reading progress and page bookmarks
- Personal notes linked to books
- Saved text passages for DOCX, TXT and EPUB (PDF canvas text selection is not implemented)
- PWA installability and offline app shell
- Optional Google Drive backup/restore using the user's own Google account
- No paid file storage service required

## Requirements
- Node.js 20+
- MongoDB connection string (local MongoDB or MongoDB Atlas)
- A Google OAuth Web Client ID only if you want Google Drive integration

## Setup

### 1. Backend
```bash
cd server
cp .env.example .env
npm install
```
Edit `.env`:
- `MONGODB_URI` — your MongoDB connection string
- `SESSION_SECRET` — long random secret
- `CLIENT_ORIGIN` — usually `http://localhost:5173`

Start:
```bash
npm run dev
```
API runs on `http://localhost:5000`.

### 2. Frontend
Open another terminal:
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
Open `http://localhost:5173`.

### 3. Optional Google Drive
1. Create a project in Google Cloud Console.
2. Enable Google Drive API.
3. Configure an OAuth 2.0 **Web application** client.
4. Add `http://localhost:5173` to Authorized JavaScript origins.
5. Put the client ID in `client/.env` as `VITE_GOOGLE_CLIENT_ID`.
6. In the OAuth consent screen, configure the app and add your test users while in testing mode.
7. Restart Vite.

The app requests `drive.file` and `drive.appdata`. It creates/updates files it manages and stores a small library manifest in the app's private Drive application-data area. Google Drive is optional; local library features work without it.

## Storage and privacy notes
- Original books are stored in a separate browser IndexedDB database for each signed-in account on the device where they are uploaded.
- Browser local storage is used only for small preferences, never for book files.
- Browser storage can be cleared by the user/browser. Export important files or use Drive backup.
- Google Drive backup uploads selected library content to the user's own Drive.
- A browser's IndexedDB is not automatically shared between devices or browsers.
- The backend stores account credentials (hashed) and session data; it does not store book binaries.
- This is a complete runnable starter application, but before public production launch you should add HTTPS, email verification/password reset, stronger operational monitoring, automated backups for MongoDB, privacy/terms pages and a reviewed Google OAuth consent configuration.

## Scripts
Backend:
- `npm run dev` — development server
- `npm start` — production server

Frontend:
- `npm run dev` — Vite development server
- `npm run build` — production build
- `npm run preview` — preview production build

## Production deployment
Build the frontend with `npm run build` in `client`, then configure Express to serve `client/dist` (the server includes optional static serving when `SERVE_CLIENT=true`). Set:
- `NODE_ENV=production`
- `SERVE_CLIENT=true`
- `CLIENT_ORIGIN` to your production origin
- `MONGODB_URI` and a strong `SESSION_SECRET`
- HTTPS at your host/reverse proxy
Use a persistent MongoDB service for accounts/sessions. No paid object storage is required for local-first usage.
