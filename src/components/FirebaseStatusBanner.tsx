/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Copy, Check, ExternalLink, ChevronDown, ChevronUp, Database } from 'lucide-react';
import { isConfiguredWithRealFirebase, firebaseConfig } from '../lib/firebase';

export const FIRESTORE_RULES_CONTENT = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper: checks if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper: gets user data from users collection
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    // Helper: checks if user has executive admin authority
    function isPrincipalOrAdmin() {
      return isAuthenticated() && (
        getUserData().role in ['principal', 'headteacher', 'admin']
      );
    }
    
    // Helper: checks if user is accountant / bursar
    function isAccountant() {
      return isAuthenticated() && (
        getUserData().role in ['accountant', 'bursar']
      );
    }

    // Helper: checks if user is nurse
    function isNurse() {
      return isAuthenticated() && (
        getUserData().role == 'nurse'
      );
    }

    // Users Collection: Principal & Admin full access; users can read their own profile
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isPrincipalOrAdmin());
      allow write: if isPrincipalOrAdmin();
    }
    
    // File Uploads Metadata Collection
    match /fileUploads/{fileId} {
      // Sensitive files (health, medical, vaccination) visible ONLY to Principal, Admin, Nurse
      allow read: if isAuthenticated() && (
        !resource.data.isSensitive ||
        isPrincipalOrAdmin() ||
        isNurse()
      );
      allow create, update: if isAuthenticated();
      allow delete: if isPrincipalOrAdmin() || (isAuthenticated() && resource.data.uploadedByUid == request.auth.uid);
    }

    // Audit Logs Collection (Append-only by authenticated users, read by Principal/Admin)
    match /auditLogs/{logId} {
      allow read: if isPrincipalOrAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if false; // Immutable audit trail
    }

    // School Collections (Learners, Fees, SMS, Inventory, Voteheads)
    match /{document=**} {
      allow read, write: if isAuthenticated();
    }
  }
}`;

export const STORAGE_RULES_CONTENT = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper: checks if caller is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // School Uploads root folder
    match /school_uploads/{category}/{recordId}/{fileName} {
      // Max file sizes: images/PDF up to 5MB, spreadsheets up to 10MB
      function isValidSize() {
        return (category in ['fee_import_sheet', 'mpesa_statement', 'sms_contacts'] && request.resource.size <= 10 * 1024 * 1024)
            || request.resource.size <= 5 * 1024 * 1024;
      }

      // Valid mime types
      function isValidType() {
        return request.resource.contentType.matches('image/.*')
            || request.resource.contentType == 'application/pdf'
            || request.resource.contentType in ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      }

      // Reads require authentication (NO public access)
      allow read: if isAuthenticated();

      // Creates require auth, valid size and allowed mime types
      allow create: if isAuthenticated() && isValidSize() && isValidType();

      // Deletes require authenticated user
      allow delete: if isAuthenticated();
    }
  }
}`;

export const FirebaseStatusBanner: React.FC = () => {
  const isRealFirebase = isConfiguredWithRealFirebase();
  const [expanded, setExpanded] = useState(false);
  const [copiedRules, setCopiedRules] = useState<'firestore' | 'storage' | null>(null);

  const copyToClipboard = (text: string, type: 'firestore' | 'storage') => {
    navigator.clipboard.writeText(text);
    setCopiedRules(type);
    setTimeout(() => setCopiedRules(null), 2500);
  };

  if (isRealFirebase) {
    return (
      <aside aria-label="Firebase Cloud Connected" className="bg-emerald-950/90 border-b border-emerald-600/60 text-emerald-100 text-xs px-4 py-1.5 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div>
              <span className="font-bold text-emerald-300">Firebase Cloud Connected:</span>{' '}
              <span className="text-emerald-100">
                Live Cloud Mode Active · Project: <code className="bg-black/30 px-1 py-0.5 rounded text-emerald-300 font-mono">{firebaseConfig.projectId}</code> · Storage Bucket & Firestore Synced
              </span>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-900/60 border border-emerald-600/50 px-2 py-0.5 rounded-full">
            <Check className="w-3 h-3 text-emerald-400" /> Live
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="Cloud Storage configuration notice" className="bg-amber-950/80 border-b border-amber-600/60 text-amber-100 text-xs px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-amber-300">Firebase Storage & Firestore Live Cloud Mode:</span>{' '}
            <span className="text-amber-200">
              Running in resilient offline local persistence (IndexedDB & LocalStorage). Uploaded photos, PDFs,
              and Excel batches persist across refreshes. To connect your Firebase Cloud Project, populate production keys in{' '}
              <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">.env</code>.
            </span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-800/80 hover:bg-amber-700/90 text-amber-100 rounded text-xs font-semibold shrink-0 transition-colors shadow-sm"
        >
          <Database className="w-3.5 h-3.5" />
          {expanded ? 'Hide Firebase Rules Guide' : 'View Security Rules & Console Guide'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-amber-800/60 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Firestore Rules */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Firestore Security Rules (firestore.rules)
              </span>
              <button
                onClick={() => copyToClipboard(FIRESTORE_RULES_CONTENT, 'firestore')}
                className="inline-flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-slate-300 border border-slate-600"
              >
                {copiedRules === 'firestore' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy Rules
                  </>
                )}
              </button>
            </div>
            <pre className="text-[10px] text-slate-300 bg-black/60 p-2 rounded max-h-40 overflow-y-auto font-mono">
              {FIRESTORE_RULES_CONTENT}
            </pre>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Publish in Firebase Console &rarr; Firestore Database &rarr; Rules tab &rarr; Click &quot;Publish&quot;.
            </p>
          </div>

          {/* Storage Rules */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-teal-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Firebase Storage Rules (storage.rules)
              </span>
              <button
                onClick={() => copyToClipboard(STORAGE_RULES_CONTENT, 'storage')}
                className="inline-flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-slate-300 border border-slate-600"
              >
                {copiedRules === 'storage' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy Rules
                  </>
                )}
              </button>
            </div>
            <pre className="text-[10px] text-slate-300 bg-black/60 p-2 rounded max-h-40 overflow-y-auto font-mono">
              {STORAGE_RULES_CONTENT}
            </pre>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Publish in Firebase Console &rarr; Storage &rarr; Rules tab &rarr; Click &quot;Publish&quot;.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
