import {initializeApp} from 'firebase/app';
import {initializeAuth, getReactNativePersistence} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBJxWC5jWc3_LpAi8M8EWNNlYUyVEfDvKY',
  authDomain: 'pprn-c7335.firebaseapp.com',
  projectId: 'pprn-c7335',
  storageBucket: 'pprn-c7335.appspot.com',
  messagingSenderId: '204317415777',
  appId: '1:204317415777:web:f0dfc82ed385f55d030d20',
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export {firebaseApp, auth};
