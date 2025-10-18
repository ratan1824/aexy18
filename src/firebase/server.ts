'use server';
import { getApps, getApp, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import 'dotenv/config';

function getServiceAccount() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccount) return undefined;
  return JSON.parse(serviceAccount);
}

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export async function initializeFirebase() {
  const serviceAccount = getServiceAccount();

  if (getApps().length === 0) {
    // If service account is available, initialize with it. Otherwise, initialize without args.
    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      initializeApp();
    }
  }

  return {
    firestore: getFirestore(),
  };
}
