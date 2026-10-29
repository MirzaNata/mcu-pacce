import type { MCUDocument, DocumentCategory } from '../types';

const DB_NAME = 'MCU_Clinic_DB';
const DB_VERSION = 1;
const STORE_NAME = 'mcu_documents';

class DocumentStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('patientId', 'patientId', { unique: false });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('patientCategory', ['patientId', 'category'], { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async saveDocument(docData: Omit<MCUDocument, 'id'>): Promise<MCUDocument> {
    const db = await this.getDB();
    const newDoc: MCUDocument = {
      ...docData,
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(newDoc);

      request.onsuccess = () => resolve(newDoc);
      request.onerror = () => reject(request.error);
    });
  }

  async getDocumentsByCategory(category: DocumentCategory): Promise<MCUDocument[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('category');
      const request = index.getAll(category);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getDocumentsByPatientAndCategory(
    patientId: string,
    category: DocumentCategory
  ): Promise<MCUDocument[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('patientCategory');
      const request = index.getAll([patientId, category]);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDocument(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const documentStorageService = new DocumentStorageService();