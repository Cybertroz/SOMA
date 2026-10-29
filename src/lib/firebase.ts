/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ============================================================================
 * FIREBASE CONFIGURATION & FIRST ADMIN SETUP GUIDE
 * ============================================================================
 * 
 * FIRST ADMIN SETUP INSTRUCTIONS:
 * 1. Go to Firebase Console (https://console.firebase.google.com) and create or select your project.
 * 2. In "Authentication" -> "Sign-in method", enable "Email/Password".
 * 3. In "Authentication" -> "Users", click "Add user", enter:
 *      Email: admin@limuru.ac.ke
 *      Password: (your secure password, e.g. Admin@2026)
 *    Copy the generated User UID (e.g. "aBcDeF123456...").
 * 4. In "Firestore Database", create database in production mode.
 * 5. In Firestore, create a collection named "users" and add a document with ID = [User UID from step 3]:
 *      fullName: "Dr. Anthony K. Macharia"
 *      email: "admin@limuru.ac.ke"
 *      role: "headteacher"
 *      active: true
 *      createdAt: "2026-01-05T08:00:00.000Z"
 * 6. Paste your Firebase project configuration credentials in the firebaseConfig object below
 *    or provide them via environment variables:
 *      VITE_FIREBASE_API_KEY
 *      VITE_FIREBASE_AUTH_DOMAIN
 *      VITE_FIREBASE_PROJECT_ID
 *      VITE_FIREBASE_STORAGE_BUCKET
 *      VITE_FIREBASE_MESSAGING_SENDER_ID
 *      VITE_FIREBASE_APP_ID
 * 
 * NOTE: If firebaseConfig uses default placeholders, this module automatically provides
 * an offline mock state with demo credentials (admin@limuru.ac.ke, bursar@limuru.ac.ke,
 * teacher@limuru.ac.ke) so you can immediately preview and test all features!
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword as fbSignIn,
  signOut as fbSignOut,
  sendPasswordResetEmail as fbResetPassword,
  onAuthStateChanged as fbOnAuthStateChanged,
  createUserWithEmailAndPassword as fbCreateUser,
  Auth,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Firestore,
} from 'firebase/firestore';
import { UserProfile, AuditLogDocument } from '../types/auth';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_PLACEHOLDER_API_KEY_REPLACE_ME",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "limuru-model-cbs.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "limuru-model-cbs",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "limuru-model-cbs.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475610",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:102938475610:web:9a8b7c6d5e4f3a2b1c0d",
};

// Check if using placeholder credentials
export const isConfiguredWithRealFirebase = (): boolean => {
  return (
    !!firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes('PLACEHOLDER') &&
    firebaseConfig.apiKey.startsWith('AIza')
  );
};

import { getStorage, FirebaseStorage } from 'firebase/storage';

// Primary Firebase App instance
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (err) {
  console.warn('Firebase initialization notice: Running in resilient demo/mock fallback mode until custom API keys are populated.', err);
}

// Secondary Firebase App instance for Head Teacher to create new users without signing out
let secondaryApp: FirebaseApp | null = null;
let secondaryAuth: Auth | null = null;

export const getSecondaryAuthInstance = (): Auth | null => {
  if (!isConfiguredWithRealFirebase()) return null;
  try {
    const existingApps = getApps();
    const existingSecondary = existingApps.find((a) => a.name === 'SecondaryUserCreator');
    if (existingSecondary) {
      secondaryApp = existingSecondary;
    } else {
      secondaryApp = initializeApp(firebaseConfig, 'SecondaryUserCreator');
    }
    secondaryAuth = getAuth(secondaryApp);
    return secondaryAuth;
  } catch (e) {
    console.error('Error initializing secondary Firebase Auth:', e);
    return null;
  }
};

export { app, auth, db, storage };

// Friendly error code translation
export const mapAuthErrorCodeToMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email address or password. Please verify and try again.';
    case 'auth/too-many-requests':
      return 'Account temporarily locked due to multiple consecutive failed attempts. Please wait 30 seconds.';
    case 'auth/user-disabled':
      return 'Your account has not been activated. Contact the school administrator.';
    case 'auth/network-request-failed':
      return 'Network error: Unable to reach the authentication server. Please check your connection.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid institutional email address.';
    default:
      return 'Authentication could not be completed. Please check your credentials or network.';
  }
};

// Initial built-in accounts for offline demo / testing when keys are placeholders
export const DEFAULT_DEMO_USERS: Record<string, { profile: UserProfile; password: string }> = {
  'admin@limuru.ac.ke': {
    profile: {
      uid: 'demo_admin_headteacher',
      fullName: 'Dr. Anthony K. Macharia',
      email: 'admin@limuru.ac.ke',
      role: 'headteacher',
      active: true,
      createdAt: '2026-01-05T08:00:00.000Z',
      department: 'Executive Administration',
      phone: '+254 722 100 200',
    },
    password: 'Admin@2026',
  },
  'deputy@limuru.ac.ke': {
    profile: {
      uid: 'demo_deputy',
      fullName: 'Mdm. Grace Nduta Kimani',
      email: 'deputy@limuru.ac.ke',
      role: 'deputy',
      active: true,
      createdAt: '2026-01-06T08:00:00.000Z',
      department: 'Academics & Curricular Affairs',
      phone: '+254 723 300 400',
    },
    password: 'Deputy@2026',
  },
  'bursar@limuru.ac.ke': {
    profile: {
      uid: 'demo_bursar',
      fullName: 'Mr. David Mwangi Waweru',
      email: 'bursar@limuru.ac.ke',
      role: 'bursar',
      active: true,
      createdAt: '2026-01-07T08:00:00.000Z',
      department: 'Finance & Accounts Office',
      phone: '+254 721 555 777',
    },
    password: 'Bursar@2026',
  },
  'teacher@limuru.ac.ke': {
    profile: {
      uid: 'demo_teacher',
      fullName: 'Mr. Patrick Wanjala',
      email: 'teacher@limuru.ac.ke',
      role: 'teacher',
      active: true,
      createdAt: '2026-01-08T08:00:00.000Z',
      department: 'Mathematics & Science Faculty',
      phone: '+254 724 666 888',
      assignedGrade: 'Grade 7',
      assignedStream: '7 Amboseli',
    },
    password: 'Teacher@2026',
  },
  'parent@limuru.ac.ke': {
    profile: {
      uid: 'demo_parent',
      fullName: 'Mrs. Jane Wanjiku Kamau',
      email: 'parent@limuru.ac.ke',
      role: 'parent',
      active: true,
      createdAt: '2026-01-10T08:00:00.000Z',
      department: 'Parents Teachers Association (PTA)',
      phone: '+254 722 888 999',
    },
    password: 'Parent@2026',
  },
  'moe.inspector@education.go.ke': {
    profile: {
      uid: 'demo_moe_official',
      fullName: 'Dr. Joseph K. Ngetich',
      email: 'moe.inspector@education.go.ke',
      role: 'moe_official',
      active: true,
      createdAt: '2026-01-02T08:00:00.000Z',
      department: 'Ministry of Education · Directorate of Quality Assurance & Standards (QASO)',
      phone: '+254 722 990 011',
    },
    password: 'Moe@2026',
  },
};
