const isDev = import.meta.env.DEV;

export const config = {
  // In dev mode, use empty string so Vite proxy handles requests to local backend
  // In production, use the Cloud Run URL
  apiUrl: isDev ? '' : 'https://cs-scout-api-857778773897.europe-west2.run.app',
  apiKey: import.meta.env.VITE_API_KEY || '',
};

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};
