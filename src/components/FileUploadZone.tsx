/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Download,
  Eye,
  Loader2,
  X,
  FileCheck,
} from 'lucide-react';
import { StoredFileRecord, FileRecordCategory } from '../types/auth';
import {
  uploadFileWithProgress,
  getStoredFilesByRecord,
  deleteStoredFile,
  validateUploadFile,
} from '../services/storageService';
import { useAuth } from '../context/AuthContext';

interface FileUploadZoneProps {
  linkedRecordId: string;
  category: FileRecordCategory;
  expectedType?: 'image' | 'pdf' | 'spreadsheet' | 'image_or_pdf';
  label: string;
  helperText?: string;
  isSensitive?: boolean;
  notes?: string;
  onUploadSuccess?: (record: StoredFileRecord) => void;
  onFileDeleted?: (fileId: string) => void;
  maxFiles?: number;
  compact?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  linkedRecordId,
  category,
  expectedType = 'image_or_pdf',
  label,
  helperText,
  isSensitive = false,
  notes,
  onUploadSuccess,
  onFileDeleted,
  maxFiles = 10,
  compact = false,
}) => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<StoredFileRecord[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewModalFile, setPreviewModalFile] = useState<StoredFileRecord | null>(null);

  // Fetch persisted files on mount or when linkedRecordId changes
  useEffect(() => {
    let isMounted = true;
    const fetchFiles = async () => {
      if (!linkedRecordId) return;
      setLoadingFiles(true);
      try {
        const stored = await getStoredFilesByRecord(linkedRecordId, category);
        if (isMounted) {
          setFiles(stored);
        }
      } catch (err) {
        console.warn('Error fetching stored files:', err);
      } finally {
        if (isMounted) setLoadingFiles(false);
      }
    };

    fetchFiles();
    return () => {
      isMounted = false;
    };
  }, [linkedRecordId, category]);

  const handleFileSelection = async (selectedFile: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedFile) return;

    // Check pre-validation
    const validation = validateUploadFile(selectedFile, expectedType);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'File validation failed.');
      return;
    }

    if (files.length >= maxFiles) {
      setErrorMessage(`Upload limit reached. Maximum ${maxFiles} files allowed.`);
      return;
    }

    const uploader = currentUser
      ? { uid: currentUser.uid, fullName: currentUser.fullName, role: currentUser.role }
      : { uid: 'system_user', fullName: 'Staff User', role: 'teacher' };

    setUploading(true);
    setUploadProgress(0);
    setCurrentFileName(selectedFile.name);

    try {
      const record = await uploadFileWithProgress({
        file: selectedFile,
        category,
        linkedRecordId,
        linkedRecordType: category,
        user: uploader,
        notes,
        isSensitive,
        expectedType,
        onProgress: (p) => setUploadProgress(p),
      });

      setFiles((prev) => [record, ...prev]);
      setSuccessMessage(`'${selectedFile.name}' uploaded and persisted successfully.`);
      if (onUploadSuccess) onUploadSuccess(record);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Clear success message after 4s
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload failed. Please check network and permissions.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (fileRecord: StoredFileRecord) => {
    if (!confirm(`Are you sure you want to delete '${fileRecord.fileName}'? This action is logged.`)) {
      return;
    }

    const deleter = currentUser
      ? { uid: currentUser.uid, fullName: currentUser.fullName, role: currentUser.role }
      : { uid: 'system_user', fullName: 'Staff User', role: 'teacher' };

    try {
      await deleteStoredFile(fileRecord, deleter);
      setFiles((prev) => prev.filter((f) => f.id !== fileRecord.id));
      setSuccessMessage(`File '${fileRecord.fileName}' deleted successfully.`);
      if (onFileDeleted) onFileDeleted(fileRecord.id);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete file.');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-rose-600 shrink-0" />;
    if (fileType.includes('sheet') || fileType.includes('csv') || fileType.includes('excel'))
      return <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />;
    return <FileText className="w-4 h-4 text-slate-500 shrink-0" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full space-y-3">
      {/* Label and Helper */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        {helperText && <span className="text-[11px] text-slate-500">{helperText}</span>}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="flex-1">{successMessage}</div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (uploading) return;
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelection(e.dataTransfer.files[0]);
          }
        }}
        className={`border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center ${
          compact ? 'p-3 text-center' : 'p-5 text-center'
        } ${
          uploading
            ? 'border-emerald-500 bg-emerald-50/50 cursor-wait'
            : 'border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/20 bg-slate-50/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={
            expectedType === 'image'
              ? 'image/jpeg,image/png,image/webp'
              : expectedType === 'pdf'
              ? 'application/pdf'
              : expectedType === 'spreadsheet'
              ? '.csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv'
              : 'image/jpeg,image/png,image/webp,application/pdf'
          }
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelection(e.target.files[0]);
            }
          }}
        />

        {uploading ? (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading & Persisting &apos;{currentFileName}&apos;...</span>
              <span className="font-mono">{uploadProgress}%</span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm">
              <Upload className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-slate-800">
              Click to select or drag and drop file
            </div>
            <p className="text-[11px] text-slate-500">
              {expectedType === 'image' && 'Images up to 5 MB (JPEG, PNG, WebP)'}
              {expectedType === 'pdf' && 'PDF Documents up to 5 MB'}
              {expectedType === 'spreadsheet' && 'Excel (.xlsx, .xls) or CSV up to 10 MB'}
              {expectedType === 'image_or_pdf' && 'Images or PDF up to 5 MB'}
            </p>
          </div>
        )}
      </div>

      {/* Persisted Files List */}
      {files.length > 0 && (
        <div className="mt-2 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
            <span>Persisted Records ({files.length})</span>
            <span className="text-[10px] text-emerald-700 font-normal flex items-center gap-1">
              <FileCheck className="w-3 h-3" /> Saved across reloads
            </span>
          </div>

          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
            {files.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 hover:bg-slate-50 transition-colors text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getFileIcon(item.fileType)}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 truncate" title={item.fileName}>
                      {item.fileName}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{formatFileSize(item.fileSize)}</span>
                      <span>&bull;</span>
                      <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                      <span>&bull;</span>
                      <span className="truncate">by {item.uploadedByName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {/* Preview Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewModalFile(item)}
                    className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                    title="View Document"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {/* Download Button */}
                  <a
                    href={item.downloadUrl}
                    download={item.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded transition-colors"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Delete File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Preview for Images & PDFs */}
      {previewModalFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-emerald-900 text-white">
              <div className="flex items-center gap-2 min-w-0">
                {getFileIcon(previewModalFile.fileType)}
                <span className="font-semibold text-sm truncate">{previewModalFile.fileName}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewModalFile.downloadUrl}
                  download={previewModalFile.fileName}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs rounded font-medium flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Download
                </a>
                <button
                  onClick={() => setPreviewModalFile(null)}
                  className="p-1 text-slate-300 hover:text-white hover:bg-emerald-800 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100 min-h-[300px]">
              {previewModalFile.fileType.includes('image') ? (
                <img
                  src={previewModalFile.downloadUrl}
                  alt={previewModalFile.fileName}
                  className="max-h-[70vh] max-w-full object-contain rounded shadow"
                />
              ) : previewModalFile.fileType.includes('pdf') ? (
                <iframe
                  src={previewModalFile.downloadUrl}
                  className="w-full h-[65vh] rounded border border-slate-300"
                  title="PDF Preview"
                />
              ) : (
                <div className="text-center py-8">
                  <FileSpreadsheet className="w-12 h-12 text-emerald-700 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-800">{previewModalFile.fileName}</p>
                  <p className="text-xs text-slate-500 mt-1">Spreadsheet / Data file</p>
                  <a
                    href={previewModalFile.downloadUrl}
                    download={previewModalFile.fileName}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800"
                  >
                    <Download className="w-4 h-4" /> Download to View
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
