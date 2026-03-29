
import { User, Document, Note, Quiz, ChatMessage, FlashcardSet } from '../types';

// Keys for LocalStorage (User auth remains in LocalStorage for simplicity/speed)
const KEYS = {
  USER: 'studley_user',
};

// --- User / Auth (LocalStorage) ---
export const loginUser = async (email: string, name: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const user: User = { id: 'user-1', email, name };
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(KEYS.USER);
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(KEYS.USER);
  return stored ? JSON.parse(stored) : null;
};

// --- IndexedDB Helper ---
const DB_NAME = 'LumiDB';
const DB_VERSION = 2; // Incremented version for flashcards

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('documents')) {
        db.createObjectStore('documents', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('notes')) {
        const store = db.createObjectStore('notes', { keyPath: 'id' });
        store.createIndex('documentId', 'documentId', { unique: false });
      }
      if (!db.objectStoreNames.contains('quizzes')) {
        const store = db.createObjectStore('quizzes', { keyPath: 'id' });
        store.createIndex('documentId', 'documentId', { unique: false });
      }
      if (!db.objectStoreNames.contains('flashcards')) {
        const store = db.createObjectStore('flashcards', { keyPath: 'id' });
        store.createIndex('documentId', 'documentId', { unique: false });
      }
      if (!db.objectStoreNames.contains('chats')) {
        const store = db.createObjectStore('chats', { keyPath: 'id' });
        store.createIndex('documentId', 'documentId', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

const dbOp = async <T>(
  storeName: string, 
  mode: 'readonly' | 'readwrite', 
  callback: (store: IDBObjectStore) => IDBRequest | void
): Promise<T> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = callback(store);

    if (request) {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } else {
      transaction.oncomplete = () => resolve(undefined as unknown as T);
      transaction.onerror = () => reject(transaction.error);
    }
  });
};

const getAllFromIndex = async <T>(storeName: string, indexName: string, value: string): Promise<T[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getAll = async <T>(storeName: string): Promise<T[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// --- Documents ---
export const saveDocument = async (file: File): Promise<Document> => {
  // Directly store the File object (Blob) in IndexedDB.
  // This avoids reading the file into memory/base64 string during upload, making it instant.
  const newDoc: Document = {
    id: crypto.randomUUID(),
    title: file.name,
    uploadDate: new Date().toISOString(),
    file: file, 
    mimeType: file.type,
    size: file.size
  };

  await dbOp('documents', 'readwrite', (store) => store.add(newDoc));
  return newDoc;
};

export const getDocuments = async (): Promise<Document[]> => {
  return getAll<Document>('documents');
};

export const getDocumentById = async (id: string): Promise<Document | undefined> => {
  return dbOp<Document>('documents', 'readonly', (store) => store.get(id));
};

export const deleteDocument = async (id: string): Promise<void> => {
  await dbOp('documents', 'readwrite', (store) => store.delete(id));
};

// --- Notes ---
export const saveNote = async (note: Note): Promise<void> => {
  await dbOp('notes', 'readwrite', (store) => store.put(note));
};

export const getNotes = async (): Promise<Note[]> => {
  return getAll<Note>('notes');
};

export const getNotesByDocumentId = async (docId: string): Promise<Note[]> => {
  return getAllFromIndex<Note>('notes', 'documentId', docId);
};

// --- Quizzes ---
export const saveQuiz = async (quiz: Quiz): Promise<void> => {
  await dbOp('quizzes', 'readwrite', (store) => store.add(quiz));
};

export const getQuizzes = async (): Promise<Quiz[]> => {
  return getAll<Quiz>('quizzes');
};

export const getQuizzesByDocumentId = async (docId: string): Promise<Quiz[]> => {
  return getAllFromIndex<Quiz>('quizzes', 'documentId', docId);
};

// --- Flashcards ---
export const saveFlashcardSet = async (set: FlashcardSet): Promise<void> => {
  await dbOp('flashcards', 'readwrite', (store) => store.add(set));
};

export const getFlashcardSetsByDocumentId = async (docId: string): Promise<FlashcardSet[]> => {
  return getAllFromIndex<FlashcardSet>('flashcards', 'documentId', docId);
};

// --- Chats ---
export const saveChatMessage = async (docId: string, message: ChatMessage): Promise<void> => {
  const msgToStore = { ...message, documentId: docId };
  await dbOp('chats', 'readwrite', (store) => store.add(msgToStore));
};

export const getChatHistory = async (docId: string): Promise<ChatMessage[]> => {
  const msgs = await getAllFromIndex<ChatMessage & { timestamp: number }>('chats', 'documentId', docId);
  return msgs.sort((a, b) => a.timestamp - b.timestamp);
};
