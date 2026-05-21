import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

import type { MasterData, QueuedRequest, WeighingRecordPayload } from '../types';

const DB_NAME = 'weighing-app-db';
const DB_VERSION = 2; // Incremented version for schema change
const MASTER_DATA_STORE = 'masterData';
const QUEUE_STORE = 'offlineQueue';
const HISTORY_STORE = 'history';

interface AppDB extends DBSchema {
  [MASTER_DATA_STORE]: {
    key: 'master';
    value: {
      locations: MasterData['locations'];
      items: MasterData['items'];
      timestamp: Date;
    };
  };
  [QUEUE_STORE]: {
    key: string;
    value: QueuedRequest;
  };
  [HISTORY_STORE]: {
    key: string; // recordId
    value: WeighingRecordPayload;
    indexes: { 'by-date': string };
  };
}

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

const getDb = (): Promise<IDBPDatabase<AppDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(MASTER_DATA_STORE)) {
          db.createObjectStore(MASTER_DATA_STORE);
        }
        if (!db.objectStoreNames.contains(QUEUE_STORE)) {
          db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
        }
        if (oldVersion < 2) {
            if (db.objectStoreNames.contains(HISTORY_STORE)) {
                db.deleteObjectStore(HISTORY_STORE);
            }
            const store = db.createObjectStore(HISTORY_STORE, { keyPath: 'recordId' });
            store.createIndex('by-date', 'weighedAt');
        }
      },
    });
  }
  return dbPromise;
};

// Master Data functions
export const saveMasterData = async (data: MasterData, timestamp: Date): Promise<void> => {
  const db = await getDb();
  await db.put(MASTER_DATA_STORE, { ...data, timestamp }, 'master');
};

export const getMasterData = async (): Promise<{ locations: MasterData['locations'], items: MasterData['items'], timestamp: Date } | undefined> => {
  const db = await getDb();
  return db.get(MASTER_DATA_STORE, 'master');
};

// Offline Queue functions
export const addRequestToQueue = async (payload: WeighingRecordPayload): Promise<void> => {
  const db = await getDb();
  const request: QueuedRequest = {
    id: payload.recordId,
    payload,
    timestamp: Date.now(),
  };
  await db.add(QUEUE_STORE, request);
};

export const getQueuedRequests = async (): Promise<QueuedRequest[]> => {
  const db = await getDb();
  return db.getAll(QUEUE_STORE);
};

export const removeRequestFromQueue = async (id: string): Promise<void> => {
  const db = await getDb();
  await db.delete(QUEUE_STORE, id);
};

// History functions
export const saveHistory = async (records: WeighingRecordPayload[]): Promise<void> => {
  const db = await getDb();
  const tx = db.transaction(HISTORY_STORE, 'readwrite');
  await tx.store.clear();
  await Promise.all(records.map(record => tx.store.put(record)));
  await tx.done;
};

export const getHistory = async (): Promise<WeighingRecordPayload[]> => {
  const db = await getDb();
  // Sort by date descending
  return db.getAllFromIndex(HISTORY_STORE, 'by-date').then(records => records.reverse());
};

export const updateHistoryRecord = async (record: WeighingRecordPayload): Promise<void> => {
  const db = await getDb();
  await db.put(HISTORY_STORE, record);
};