import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { firebaseConfig } from '../config';

const app = firebaseConfig.projectId ? initializeApp(firebaseConfig) : null;

export const initAnalytics = async () => {
  if (app && (await isSupported())) {
    return getAnalytics(app);
  }
  return null;
};
