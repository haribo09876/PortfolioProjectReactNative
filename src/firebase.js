import {initializeApp} from 'firebase/app';
import {getStorage} from 'firebase/storage';
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBJxWC5jWc3_LpAi8M8EWNNlYUyVEfDvKY',
  authDomain: 'pprn-c7335.firebaseapp.com',
  projectId: 'pprn-c7335',
  storageBucket: 'pprn-c7335.appspot.com',
  messagingSenderId: '204317415777',
  appId: '1:204317415777:web:f0dfc82ed385f55d030d20',
};

const app = initializeApp(firebaseConfig);

export {app};
export const storage = getStorage(app);
export const db = getFirestore(app);
