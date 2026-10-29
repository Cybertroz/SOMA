/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ============================================================================
 * FIRST ADMIN SETUP INSTRUCTIONS:
 * ============================================================================
 * 1. Open Firebase Console -> Authentication -> Users.
 * 2. Click "Add user", enter:
 *      Email: admin@limuru.ac.ke
 *      Password: (your password)
 * 3. Copy the UID assigned to this user.
 * 4. Open Firestore Database -> Start collection "users".
 * 5. Add document with Document ID = [UID]:
 *      fullName: "Dr. Anthony K. Macharia"
 *      email: "admin@limuru.ac.ke"
 *      role: "headteacher"
 *      active: true
 *      createdAt: "2026-01-05T08:00:00.000Z"
 * 6. You are now the master Head Teacher with administrative privileges!
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  KeyRound,
  RotateCw,
  Printer,
  FileSpreadsheet,
  Mail,
  Lock,
  UserCheck,
  Building,
  AlertCircle,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePrintPreview } from '../context/PrintPreviewContext';
import { AppUserRole, UserProfile } from '../types/auth';
import {
  db,
  getSecondaryAuthInstance,
  isConfiguredWithRealFirebase,
  DEFAULT_DEMO_USERS,
} from '../lib/firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { exportToExcel } from '../utils/excelExport';
import { FileUploadZone } from './FileUploadZone';

export const UserManagementModule: React.FC = () => {
  const { currentUser, resetPassword, logAuditAction } = useAuth();
  const { openPrintPreview } = usePrintPreview();

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | AppUserRole>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Create User Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AppUserRole>('teacher');
  const [newPassword, setNewPassword] = useState('');
  const [newDepartment, setNewDepartment] = useState('Instructional Faculty');
  const [newPhone, setNewPhone] = useState('+254 7');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit Role Modal
  const [selectedUserForRole, setSelectedUserForRole] = useState<UserProfile | null>(null);
  const [roleToAssign, setRoleToAssign] = useState<AppUserRole>('teacher');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load users from Firestore or fallback
  const fetchUsers = async () => {
    setLoading(true);
    if (db && isConfiguredWithRealFirebase()) {
      try {
        const querySnap = await getDocs(collection(db, 'users'));
        const users: UserProfile[] = [];
        querySnap.forEach((d) => {
          const data = d.data();
          users.push({
            uid: d.id,
            fullName: data.fullName || 'Staff Member',
            email: data.email || '',
            role: (data.role as AppUserRole) || 'teacher',
            active: data.active !== false,
            createdAt: data.createdAt || new Date().toISOString(),
            department: data.department || '',
            phone: data.phone || '',
            photoUrl: data.photoUrl || undefined,
          });
        });
        setUsersList(users);
      } catch (err) {
        console.error('Error fetching users from Firestore:', err);
        // Fallback
        const demoArray = Object.values(DEFAULT_DEMO_USERS).map((u) => u.profile);
        setUsersList(demoArray);
      }
    } else {
      // Local/demo fallback
      const saved = localStorage.getItem('limuru_managed_users');
      if (saved) {
        try {
          setUsersList(JSON.parse(saved));
        } catch {
          setUsersList(Object.values(DEFAULT_DEMO_USERS).map((u) => u.profile));
        }
      } else {
        const demoArray = Object.values(DEFAULT_DEMO_USERS).map((u) => u.profile);
        setUsersList(demoArray);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Save changes to storage if offline
  const persistOfflineUsers = (updated: UserProfile[]) => {
    setUsersList(updated);
    localStorage.setItem('limuru_managed_users', JSON.stringify(updated));
  };

  // Toggle User Active Status
  const handleToggleActive = async (user: UserProfile) => {
    const updatedStatus = !user.active;
    if (db && isConfiguredWithRealFirebase()) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { active: updatedStatus });
        showToast(`User ${user.fullName} is now ${updatedStatus ? 'Active' : 'Deactivated'}.`);
        fetchUsers();
      } catch (e) {
        showToast('Error updating user status in Firestore.');
      }
    } else {
      const updated = usersList.map((u) => (u.uid === user.uid ? { ...u, active: updatedStatus } : u));
      persistOfflineUsers(updated);
      showToast(`User ${user.fullName} is now ${updatedStatus ? 'Active' : 'Deactivated'}.`);
    }

    logAuditAction(
      'user_status_change',
      `Head Teacher ${currentUser?.fullName} ${updatedStatus ? 'activated' : 'deactivated'} account for ${user.email} (${user.role}).`
    );
  };

  // Change Role
  const handleChangeRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForRole) return;

    if (db && isConfiguredWithRealFirebase()) {
      try {
        const userDocRef = doc(db, 'users', selectedUserForRole.uid);
        await updateDoc(userDocRef, { role: roleToAssign });
        showToast(`Role updated to ${roleToAssign.toUpperCase()} for ${selectedUserForRole.fullName}.`);
        setSelectedUserForRole(null);
        fetchUsers();
      } catch (err) {
        showToast('Error saving updated role.');
      }
    } else {
      const updated = usersList.map((u) =>
        u.uid === selectedUserForRole.uid ? { ...u, role: roleToAssign } : u
      );
      persistOfflineUsers(updated);
      showToast(`Role updated to ${roleToAssign.toUpperCase()} for ${selectedUserForRole.fullName}.`);
      setSelectedUserForRole(null);
    }

    logAuditAction(
      'user_role_change',
      `Head Teacher changed role for ${selectedUserForRole.email} to ${roleToAssign}.`
    );
  };

  // Dispatch Password Reset Email
  const handleSendResetEmail = async (user: UserProfile) => {
    const res = await resetPassword(user.email);
    showToast(res.message);
    logAuditAction('admin_password_reset', `Head Teacher sent password reset email to ${user.email}.`);
  };

  // Create User with Secondary Firebase App Instance
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!newEmail.trim() || !newFullName.trim() || !newPassword.trim()) {
      setCreateError('Please complete all required fields.');
      return;
    }

    if (newPassword.length < 6) {
      setCreateError('Temporary password must be at least 6 characters.');
      return;
    }

    setCreateSubmitting(true);

    if (isConfiguredWithRealFirebase()) {
      try {
        const secAuth = getSecondaryAuthInstance();
        if (!secAuth) {
          throw new Error('Unable to initialize secondary Firebase Auth instance.');
        }

        // Create user on secondary app without logging out the primary user
        const userCredential = await createUserWithEmailAndPassword(secAuth, newEmail.trim().toLowerCase(), newPassword);
        const newUid = userCredential.user.uid;

        // Save profile in Firestore
        if (db) {
          await setDoc(doc(db, 'users', newUid), {
            fullName: newFullName.trim(),
            email: newEmail.trim().toLowerCase(),
            role: newRole,
            active: true,
            createdAt: new Date().toISOString(),
            department: newDepartment.trim(),
            phone: newPhone.trim(),
            photoUrl: newPhotoUrl.trim() || undefined,
          });
        }

        showToast(`Successfully created user ${newFullName} (${newRole.toUpperCase()})!`);
        setIsCreateModalOpen(false);
        resetCreateForm();
        fetchUsers();
      } catch (err: any) {
        console.error('Error creating user with secondary auth:', err);
        setCreateError(err.message || 'Failed to create user in Firebase.');
      } finally {
        setCreateSubmitting(false);
      }
    } else {
      // Demo simulated user creation
      const createdProfile: UserProfile = {
        uid: 'user_' + Date.now(),
        fullName: newFullName.trim(),
        email: newEmail.trim().toLowerCase(),
        role: newRole,
        active: true,
        createdAt: new Date().toISOString(),
        department: newDepartment.trim(),
        phone: newPhone.trim(),
        photoUrl: newPhotoUrl.trim() || undefined,
      };

      const updated = [createdProfile, ...usersList];
      persistOfflineUsers(updated);
      showToast(`[Demo Mode] Created user ${newFullName} (${newRole.toUpperCase()})!`);
      setIsCreateModalOpen(false);
      resetCreateForm();
      setCreateSubmitting(false);
    }

    logAuditAction(
      'create_user',
      `Head Teacher created account for ${newFullName} (${newEmail}) with role ${newRole}.`
    );
  };

  const resetCreateForm = () => {
    setNewFullName('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('teacher');
    setNewDepartment('Instructional Faculty');
    setNewPhone('+254 7');
    setNewPhotoUrl('');
    setCreateError(null);
  };

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (statusFilter === 'Active' && !u.active) return false;
    if (statusFilter === 'Inactive' && u.active) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Export to Excel
  const handleExportUsersExcel = () => {
    exportToExcel(
      'Limuru_Model_Comprehensive_Institutional_Users_Register',
      filteredUsers,
      [
        { header: 'Full Name', key: 'fullName' },
        { header: 'Email Address', key: 'email' },
        { header: 'Institutional Role', key: (u) => u.role.toUpperCase() },
        { header: 'Account Status', key: (u) => (u.active ? 'ACTIVE' : 'DEACTIVATED') },
        { header: 'Department', key: 'department' },
        { header: 'Phone Number', key: 'phone' },
        { header: 'Created Date', key: 'createdAt' },
        { header: 'User UID', key: 'uid' },
      ]
    );
    showToast('Exported users register to Excel (.csv)');
  };

  // Trigger Print Preview Modal
  const handlePrintUsersRegister = () => {
    openPrintPreview({
      title: 'Institutional User & Access Management Register',
      subtitle: 'Official record of authenticated administrative and instructional staff credentials',
      documentNumber: `USR-REG-${Date.now().toString().slice(-6)}`,
      category: 'Governance & Security',
      orientation: 'landscape',
      content: (
        <div className="space-y-4">
          <table className="w-full text-left text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                <th className="p-2 border-r border-slate-300">#</th>
                <th className="p-2 border-r border-slate-300">Staff Full Name</th>
                <th className="p-2 border-r border-slate-300">Email Address</th>
                <th className="p-2 border-r border-slate-300">Role</th>
                <th className="p-2 border-r border-slate-300">Department</th>
                <th className="p-2 border-r border-slate-300">Status</th>
                <th className="p-2">Account Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((u, idx) => (
                <tr key={u.uid} className="hover:bg-slate-50">
                  <td className="p-2 border-r border-slate-200 font-mono text-center">{idx + 1}</td>
                  <td className="p-2 border-r border-slate-200 font-bold text-slate-900">{u.fullName}</td>
                  <td className="p-2 border-r border-slate-200 font-mono text-[11px]">{u.email}</td>
                  <td className="p-2 border-r border-slate-200 uppercase font-semibold text-emerald-800">
                    {u.role}
                  </td>
                  <td className="p-2 border-r border-slate-200">{u.department || 'General'}</td>
                  <td className="p-2 border-r border-slate-200">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {u.active ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                  </td>
                  <td className="p-2 font-mono text-[11px]">{new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    });
  };

  const isAuthorized =
    currentUser?.role === 'principal' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'headteacher';

  if (!isAuthorized) {
    return (
      <div className="p-8 bg-white rounded-xl border border-rose-200 shadow-sm text-center max-w-lg mx-auto space-y-3 my-12">
        <Lock className="w-12 h-12 text-rose-600 mx-auto" />
        <h3 className="font-bold text-slate-900 text-base">Restricted Administrative Access</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Under institutional security guidelines and Kenya Data Protection Act 2019,
          User Management and staff credential administration is strictly restricted to
          the <strong>Principal and System Administrator</strong> accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-300 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  User Accounts, Roles & Access Management
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  Head Teacher Exclusive
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage staff credentials, assign institutional roles, deactivate accounts, and trigger secure password resets
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print Preview Button */}
          <button
            onClick={handlePrintUsersRegister}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 border border-slate-300"
            title="Open Print Preview"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Register</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={handleExportUsersExcel}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 border border-emerald-300"
            title="Export to Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export Excel</span>
          </button>

          {/* Create User Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Total Registered Accounts</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {usersList.length}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-semibold">Firestore users collection</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Active Accounts</div>
          <div className="text-2xl font-bold text-emerald-800 tabular-nums">
            {usersList.filter((u) => u.active).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Authorized for Login</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Instructional Faculty (Teachers)</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {usersList.filter((u) => u.role === 'teacher').length}
          </div>
          <div className="text-[11px] text-sky-700 mt-1 font-semibold">CBC Curriculum Appraised</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Finance & Accounts (Bursar)</div>
          <div className="text-2xl font-bold text-emerald-800 tabular-nums">
            {usersList.filter((u) => u.role === 'bursar').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Fee & Votehead Authority</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by staff name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="All">All Roles</option>
              <option value="headteacher">Head Teacher</option>
              <option value="deputy">Deputy Principal</option>
              <option value="bursar">Bursar</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Deactivated Only</option>
            </select>
          </div>

          <button
            onClick={fetchUsers}
            className="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1"
            title="Refresh Users List"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Department / Notes</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading user directory from Firestore...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                    No user accounts match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleBadgeColor =
                    user.role === 'headteacher'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : user.role === 'bursar'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : user.role === 'deputy'
                      ? 'bg-purple-100 text-purple-900 border-purple-300'
                      : user.role === 'teacher'
                      ? 'bg-sky-100 text-sky-900 border-sky-300'
                      : 'bg-slate-100 text-slate-800 border-slate-300';

                  return (
                    <tr key={user.uid} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-slate-300">
                            {user.photoUrl ? (
                              <img src={user.photoUrl} alt={user.fullName} className="w-full h-full object-cover" />
                            ) : (
                              user.fullName
                                .replace('Dr. ', '')
                                .replace('Mr. ', '')
                                .replace('Mrs. ', '')
                                .replace('Mdm. ', '')
                                .split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')
                            )}
                          </div>
                          <div>
                            <span className="block">{user.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">UID: {user.uid.slice(0, 10)}...</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700">
                        {user.email}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${roleBadgeColor}`}>
                          {user.role}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {user.department || 'School Faculty'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            user.active
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          {user.active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Deactivated</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Role Change Button */}
                          <button
                            onClick={() => {
                              setSelectedUserForRole(user);
                              setRoleToAssign(user.role);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] border border-slate-300"
                            title="Change Role"
                          >
                            Change Role
                          </button>

                          {/* Send Reset Email Button */}
                          <button
                            onClick={() => handleSendResetEmail(user)}
                            className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded font-semibold text-[11px] border border-sky-300"
                            title="Send Password Reset Email"
                          >
                            Reset Password
                          </button>

                          {/* Deactivate / Reactivate Button */}
                          {user.email !== currentUser?.email && (
                            <button
                              onClick={() => handleToggleActive(user)}
                              className={`px-2 py-1 rounded font-bold text-[11px] ${
                                user.active
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}
                            >
                              {user.active ? 'Deactivate' : 'Reactivate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Create New Institutional User</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Creates the authenticated account via secondary Firebase instance and initializes their Firestore document at <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">users/{'{uid}'}</code>.
            </p>

            {createError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name & Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. James Mwangi"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address:</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jmwangi@limuru.ac.ke"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              {/* Staff Profile Photo Upload */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <FileUploadZone
                  linkedRecordId="new_staff_photo"
                  category="staff_photo"
                  expectedType="image"
                  label="Staff Profile Photo (Optional)"
                  helperText="JPEG or PNG up to 5MB"
                  compact
                  maxFiles={1}
                  onUploadSuccess={(rec) => setNewPhotoUrl(rec.downloadUrl)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Role:</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as AppUserRole)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 font-semibold"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="class_teacher">Class Teacher</option>
                    <option value="nurse">School Nurse</option>
                    <option value="bursar">Bursar</option>
                    <option value="accountant">Accountant</option>
                    <option value="deputy">Deputy Principal</option>
                    <option value="headteacher">Head Teacher</option>
                    <option value="principal">Principal</option>
                    <option value="admin">Administrator</option>
                    <option value="parent">Parent</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Temporary Password:</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department:</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Phone:</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                  {createSubmitting ? 'Creating User...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE ROLE MODAL */}
      {selectedUserForRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Modify Role Permissions</h3>
              <button onClick={() => setSelectedUserForRole(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select new role for <strong>{selectedUserForRole.fullName}</strong> ({selectedUserForRole.email}):
            </p>

            <form onSubmit={handleChangeRoleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Role:</label>
                <select
                  value={roleToAssign}
                  onChange={(e) => setRoleToAssign(e.target.value as AppUserRole)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold"
                >
                  <option value="headteacher">Head Teacher (Full Access)</option>
                  <option value="deputy">Deputy Principal (Academics & Curricular)</option>
                  <option value="bursar">Bursar (Finances & Payroll)</option>
                  <option value="teacher">Teacher (Curriculum & Assessments)</option>
                  <option value="parent">Parent (Learner Progress Only)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedUserForRole(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold"
                >
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
