/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppUserRole = 'headteacher' | 'deputy' | 'bursar' | 'teacher' | 'parent' | 'moe_official';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: AppUserRole;
  active: boolean;
  createdAt: string;
  department?: string;
  phone?: string;
  assignedGrade?: string;
  assignedStream?: string;
}

export interface AuditLogDocument {
  id?: string;
  uid: string;
  role: AppUserRole;
  action: string;
  details: string;
  timestamp: string;
}
