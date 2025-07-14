import {initializeApp} from 'firebase/app';
import {getStorage} from 'firebase/storage';
import {getFirestore} from 'firebase/firestore';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from '@env';

// Firebase configuration object using .env variables (환경 변수 기반 Firebase 설정 객체)
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

// Initialize Firebase App instance (Firebase 앱 인스턴스 초기화)
const app = initializeApp(firebaseConfig);
// Export initialized app (초기화된 앱 객체 내보내기)
export {app};
// Export Firebase Cloud Storage instance (스토리지 인스턴스 내보내기)
export const storage = getStorage(app);
// Export Firestore database instance (Firestore 인스턴스 내보내기)
export const db = getFirestore(app);
