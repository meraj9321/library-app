import { openDB } from 'idb';

let database;
let activeUser = 'guest';
let databaseName = '';
export function setStorageUser(userId) {
  const nextName = `my-library-db-${userId || 'guest'}`;
  if (nextName === databaseName) return;
  if (database) database.then(db => db.close()).catch(() => {});
  database = null;
  databaseName = nextName;
  activeUser = userId || 'guest';
}
export function getDB() {
  if (!database) database = openDB(databaseName || `my-library-db-${activeUser}`, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('books')) {
        const store = db.createObjectStore('books', { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      }
      if (!db.objectStoreNames.contains('collections')) db.createObjectStore('collections', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('notes')) db.createObjectStore('notes', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('bookmarks')) db.createObjectStore('bookmarks', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('highlights')) db.createObjectStore('highlights', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('progress')) db.createObjectStore('progress', { keyPath: 'bookId' });
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
    }
  });
  return database;
}

export const all = async store => (await getDB()).getAll(store);
export const get = async (store, key) => (await getDB()).get(store, key);
export const put = async (store, value) => (await getDB()).put(store, value);
export const remove = async (store, key) => (await getDB()).delete(store, key);
