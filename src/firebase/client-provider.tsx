'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // useMemo ensures that Firebase is initialized only once on the client-side.
  const services = useMemo(() => {
    let firebaseApp: FirebaseApp;
    if (!getApps().length) {
       try {
        firebaseApp = initializeApp(firebaseConfig);
      } catch (e) {
        // This can happen with HMR.
        console.warn('Firebase initialization failed, trying to get existing app.', e);
        firebaseApp = getApp();
      }
    } else {
      firebaseApp = getApp();
    }
    
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);

    return { firebaseApp, auth, firestore };
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
