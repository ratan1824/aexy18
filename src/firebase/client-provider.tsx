'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // useMemo ensures that Firebase is initialized only once on the client-side.
  const services = useMemo<FirebaseServices | null>(() => {
    // This check is important. If running on the server, we should not initialize.
    if (typeof window === 'undefined') {
      return null;
    }
    return initializeFirebase();
  }, []);

  // If services are null (e.g., during server-side render),
  // we can pass nulls to the provider. The provider is designed to handle this.
  return (
    <FirebaseProvider
      firebaseApp={services?.firebaseApp ?? null}
      auth={services?.auth ?? null}
      firestore={services?.firestore ?? null}
    >
      {children}
    </FirebaseProvider>
  );
}
