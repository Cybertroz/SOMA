/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppUserRole =
  | 'principal'
  | 'admin'
  | 'headteacher'
  | 'deputy'
  | 'accountant'
  | 'bursar'
  | 'nurse'
  | 'class_teacher'
  | 'teacher'
  | 'parent'
  | 'moe_official';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: AppUserRole;
  active: boolean;
  createdAt: string;
  department?: string;
  phone?: string;
  photoUrl?: string;
  assignedGrade?: string;
  assignedStream?: string;
}

export type FileRecordCategory =
  | 'learner_photo'
  | 'birth_certificate'
  | 'admission_document'
  | 'portfolio_evidence'
  | 'vaccination_record'
  | 'medical_document'
  | 'consent_form'
  | 'fee_receipt'
  | 'fee_import_sheet'
  | 'mpesa_statement'
  | 'sms_contacts'
  | 'staff_photo';

export interface StoredFileRecord {
  id: string; // Firestore document ID
  fileName: string;
  fileType: string; // MIME type
  fileSize: number; // in bytes
  storagePath: string; // path in Firebase Storage bucket
  downloadUrl: string; // secure download / preview URL
  linkedRecordId: string; // learner ID, user UID, statement ID, etc.
  linkedRecordType: FileRecordCategory;
  category: string; // human readable category
  uploadedByUid: string;
  uploadedByName: string;
  uploadedByRole: string;
  uploadedAt: string; // ISO 8601 string
  notes?: string;
  isSensitive?: boolean;
}

export interface AuditLogDocument {
  id?: string;
  uid: string;
  role: AppUserRole;
  action: string;
  details: string;
  timestamp: string;
}
