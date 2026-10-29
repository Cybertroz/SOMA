/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { storage, db, isConfiguredWithRealFirebase } from '../lib/firebase';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
} from 'firebase/storage';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { StoredFileRecord, FileRecordCategory } from '../types/auth';

// File size limits in bytes
export const MAX_IMAGE_PDF_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_SPREADSHEET_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// Allowed MIME types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
export const ALLOWED_PDF_TYPES = ['application/pdf'];
export const ALLOWED_SPREADSHEET_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/csv',
];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  category?: 'image' | 'pdf' | 'spreadsheet' | 'other';
}

/**
 * Validates file type and size according to strict institutional rules
 */
export const validateUploadFile = (
  file: File,
  expectedType?: 'image' | 'pdf' | 'spreadsheet' | 'image_or_pdf'
): FileValidationResult => {
  if (!file) {
    return { valid: false, error: 'No file selected for upload.' };
  }

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  const isImage =
    ALLOWED_IMAGE_TYPES.includes(fileType) ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.webp');

  const isPdf =
    ALLOWED_PDF_TYPES.includes(fileType) || fileName.endsWith('.pdf');

  const isSpreadsheet =
    ALLOWED_SPREADSHEET_TYPES.includes(fileType) ||
    fileName.endsWith('.csv') ||
    fileName.endsWith('.xlsx') ||
    fileName.endsWith('.xls');

  // Enforce expected type restriction if provided
  if (expectedType === 'image' && !isImage) {
    return { valid: false, error: 'Invalid file format. Please upload an image file (JPEG, PNG, WebP).' };
  }
  if (expectedType === 'pdf' && !isPdf) {
    return { valid: false, error: 'Invalid file format. Please upload a PDF document.' };
  }
  if (expectedType === 'spreadsheet' && !isSpreadsheet) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV file.',
    };
  }
  if (expectedType === 'image_or_pdf' && !isImage && !isPdf) {
    return {
      valid: false,
      error: 'Invalid format. Allowed formats: PDF document or image file (JPEG, PNG).',
    };
  }

  // Size validation
  if (isSpreadsheet) {
    if (file.size > MAX_SPREADSHEET_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `File is too large (${sizeMB} MB). Maximum size for Excel/CSV spreadsheets is 10 MB.`,
      };
    }
    return { valid: true, category: 'spreadsheet' };
  }

  if (isImage || isPdf) {
    if (file.size > MAX_IMAGE_PDF_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `File is too large (${sizeMB} MB). Maximum size for images and PDF documents is 5 MB.`,
      };
    }
    return { valid: true, category: isImage ? 'image' : 'pdf' };
  }

  return {
    valid: false,
    error: 'Unsupported file format. Please upload PDF, Excel (.xlsx, .xls), CSV, or standard image files.',
  };
};

// ============================================================================
// INDEXED-DB PERSISTENT STORE (Resilient local storage when Firebase API keys are placeholders)
// ============================================================================
const DB_NAME = 'LimuruSchoolStorageDB';
const DB_VERSION = 1;
const STORE_FILES = 'stored_blobs';
const LOCAL_STORAGE_METADATA_KEY = 'limuru_cbc_file_records_v1';

const openIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveBlobToIndexedDB = async (id: string, blob: Blob): Promise<void> => {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      store.put({ id, blob });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Could not store blob in IndexedDB, fallback to memory URL:', err);
  }
};

const getBlobFromIndexedDB = async (id: string): Promise<Blob | null> => {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_FILES, 'readonly');
      const store = tx.objectStore(STORE_FILES);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

const deleteBlobFromIndexedDB = async (id: string): Promise<void> => {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
};

const getLocalMetadataRecords = (): StoredFileRecord[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_METADATA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalMetadataRecord = (record: StoredFileRecord) => {
  try {
    const existing = getLocalMetadataRecords().filter((r) => r.id !== record.id);
    existing.unshift(record);
    localStorage.setItem(LOCAL_STORAGE_METADATA_KEY, JSON.stringify(existing));
  } catch (e) {
    console.warn('Failed to update localStorage metadata:', e);
  }
};

const deleteLocalMetadataRecord = (id: string) => {
  try {
    const existing = getLocalMetadataRecords().filter((r) => r.id !== id);
    localStorage.setItem(LOCAL_STORAGE_METADATA_KEY, JSON.stringify(existing));
  } catch {
    // ignore
  }
};

// ============================================================================
// CORE STORAGE SERVICE API
// ============================================================================

export interface UploadFileOptions {
  file: File;
  category: FileRecordCategory;
  linkedRecordId: string;
  linkedRecordType: FileRecordCategory;
  user: {
    uid: string;
    fullName: string;
    role: string;
  };
  notes?: string;
  isSensitive?: boolean;
  expectedType?: 'image' | 'pdf' | 'spreadsheet' | 'image_or_pdf';
  onProgress?: (progressPercent: number) => void;
}

/**
 * Uploads a file with progress tracking, file validation,
 * and records metadata to Firestore (with local persistent fallback).
 */
export const uploadFileWithProgress = async (
  options: UploadFileOptions
): Promise<StoredFileRecord> => {
  const {
    file,
    category,
    linkedRecordId,
    linkedRecordType,
    user,
    notes = '',
    isSensitive = false,
    expectedType,
    onProgress,
  } = options;

  // 1. Strict Validation
  const validation = validateUploadFile(file, expectedType);
  if (!validation.valid) {
    throw new Error(validation.error || 'File validation failed.');
  }

  const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const fileExt = file.name.split('.').pop() || '';
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `school_uploads/${category}/${linkedRecordId}/${fileId}_${sanitizedName}`;

  // Check if real Firebase Storage is active
  if (isConfiguredWithRealFirebase() && storage && db) {
    try {
      const storageReference = ref(storage, storagePath);
      const uploadTask: UploadTask = uploadBytesResumable(storageReference, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(Math.round(progress));
            }
          },
          (error) => {
            reject(new Error(`Firebase Storage upload failed: ${error.message}`));
          },
          () => {
            resolve();
          }
        );
      });

      const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

      const record: StoredFileRecord = {
        id: fileId,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        storagePath,
        downloadUrl,
        linkedRecordId,
        linkedRecordType,
        category: category.replace(/_/g, ' ').toUpperCase(),
        uploadedByUid: user.uid,
        uploadedByName: user.fullName,
        uploadedByRole: user.role,
        uploadedAt: new Date().toISOString(),
        notes,
        isSensitive,
      };

      // Write metadata to Firestore collection "fileUploads"
      await setDoc(doc(db, 'fileUploads', fileId), record);

      // Log into Firestore audit collection
      try {
        await addDoc(collection(db, 'auditLogs'), {
          uid: user.uid,
          userName: user.fullName,
          role: user.role,
          action: 'FILE_UPLOAD',
          details: `Uploaded file '${file.name}' (${(file.size / 1024).toFixed(1)} KB) for record ${linkedRecordId} [${category}]`,
          timestamp: new Date().toISOString(),
          recordId: linkedRecordId,
        });
      } catch (auditErr) {
        console.warn('Audit log write error:', auditErr);
      }

      // Also cache in local metadata for seamless offline viewing
      saveLocalMetadataRecord(record);

      return record;
    } catch (err: any) {
      console.warn('Firebase Storage upload failed or offline; activating persistent local storage fallback:', err);
      // Fall through to resilient persistent local storage
    }
  }

  // ==========================================================================
  // RESILIENT PERSISTENT LOCAL STORAGE (IndexedDB + LocalStorage)
  // Ensures files never disappear across refreshes in preview
  // ==========================================================================
  if (onProgress) {
    onProgress(15);
    await new Promise((r) => setTimeout(r, 60));
    onProgress(50);
    await new Promise((r) => setTimeout(r, 60));
    onProgress(85);
    await new Promise((r) => setTimeout(r, 60));
  }

  // Save blob to IndexedDB
  await saveBlobToIndexedDB(fileId, file);

  // Generate an Object URL or Data URL for preview
  let downloadUrl = '';
  try {
    downloadUrl = URL.createObjectURL(file);
  } catch {
    // If createObjectURL fails, use DataURL
    downloadUrl = await new Promise<string>((res) => {
      const reader = new FileReader();
      reader.onloadend = () => res(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  const record: StoredFileRecord = {
    id: fileId,
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    fileSize: file.size,
    storagePath: `local_persistent/${storagePath}`,
    downloadUrl,
    linkedRecordId,
    linkedRecordType,
    category: category.replace(/_/g, ' ').toUpperCase(),
    uploadedByUid: user.uid,
    uploadedByName: user.fullName,
    uploadedByRole: user.role,
    uploadedAt: new Date().toISOString(),
    notes,
    isSensitive,
  };

  saveLocalMetadataRecord(record);

  if (onProgress) {
    onProgress(100);
  }

  return record;
};

/**
 * Retrieves all stored files for a specific record (e.g. learner, user, fee)
 */
export const getStoredFilesByRecord = async (
  linkedRecordId: string,
  category?: FileRecordCategory
): Promise<StoredFileRecord[]> => {
  const results: StoredFileRecord[] = [];

  // 1. Try Firestore if configured
  if (isConfiguredWithRealFirebase() && db) {
    try {
      const q = category
        ? query(
            collection(db, 'fileUploads'),
            where('linkedRecordId', '==', linkedRecordId),
            where('linkedRecordType', '==', category)
          )
        : query(collection(db, 'fileUploads'), where('linkedRecordId', '==', linkedRecordId));

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((d) => {
        results.push(d.data() as StoredFileRecord);
      });
    } catch (err) {
      console.warn('Error reading fileUploads from Firestore:', err);
    }
  }

  // 2. Read from persistent local metadata (fallback / merge)
  const localRecords = getLocalMetadataRecords().filter((r) => {
    if (r.linkedRecordId !== linkedRecordId) return false;
    if (category && r.linkedRecordType !== category) return false;
    return true;
  });

  // Re-hydrate blob URLs from IndexedDB for local records if needed
  for (const item of localRecords) {
    if (!results.some((r) => r.id === item.id)) {
      if (item.storagePath.startsWith('local_persistent/')) {
        const blob = await getBlobFromIndexedDB(item.id);
        if (blob) {
          item.downloadUrl = URL.createObjectURL(blob);
        }
      }
      results.push(item);
    }
  }

  // Sort newest first
  return results.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
};

/**
 * Retrieves all stored files matching an optional category
 */
export const getAllStoredFiles = async (
  category?: FileRecordCategory
): Promise<StoredFileRecord[]> => {
  const results: StoredFileRecord[] = [];

  if (isConfiguredWithRealFirebase() && db) {
    try {
      const q = category
        ? query(collection(db, 'fileUploads'), where('linkedRecordType', '==', category))
        : collection(db, 'fileUploads');
      const snap = await getDocs(q);
      snap.forEach((d) => results.push(d.data() as StoredFileRecord));
    } catch (err) {
      console.warn('Error fetching all fileUploads from Firestore:', err);
    }
  }

  const localRecords = getLocalMetadataRecords().filter((r) => {
    return category ? r.linkedRecordType === category : true;
  });

  for (const item of localRecords) {
    if (!results.some((r) => r.id === item.id)) {
      if (item.storagePath.startsWith('local_persistent/')) {
        const blob = await getBlobFromIndexedDB(item.id);
        if (blob) {
          item.downloadUrl = URL.createObjectURL(blob);
        }
      }
      results.push(item);
    }
  }

  return results.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
};

/**
 * Deletes a stored file and its metadata record
 */
export const deleteStoredFile = async (
  fileRecord: StoredFileRecord,
  user: { uid: string; fullName: string; role: string }
): Promise<void> => {
  // 1. Delete from Firebase if applicable
  if (isConfiguredWithRealFirebase() && storage && db && !fileRecord.storagePath.startsWith('local_persistent/')) {
    try {
      const storageRef = ref(storage, fileRecord.storagePath);
      await deleteObject(storageRef);
    } catch (err) {
      console.warn('Storage file deletion note:', err);
    }

    try {
      await deleteDoc(doc(db, 'fileUploads', fileRecord.id));
    } catch (err) {
      console.warn('Firestore file metadata deletion error:', err);
    }

    try {
      await addDoc(collection(db, 'auditLogs'), {
        uid: user.uid,
        userName: user.fullName,
        role: user.role,
        action: 'FILE_DELETE',
        details: `Deleted file '${fileRecord.fileName}' for record ${fileRecord.linkedRecordId} [${fileRecord.linkedRecordType}]`,
        timestamp: new Date().toISOString(),
        recordId: fileRecord.linkedRecordId,
      });
    } catch (auditErr) {
      console.warn('Audit log write error:', auditErr);
    }
  }

  // 2. Always clean up local storage & IndexedDB
  deleteLocalMetadataRecord(fileRecord.id);
  await deleteBlobFromIndexedDB(fileRecord.id);
};
