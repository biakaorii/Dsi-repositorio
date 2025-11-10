import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGW2HBZ8hyNTbp0cj9M0hPsahxD8NmQ84",
  authDomain: "projeto-dsi-f7140.firebaseapp.com",
  projectId: "projeto-dsi-f7140",
  storageBucket: "projeto-dsi-f7140.firebasestorage.app",
  messagingSenderId: "506496266895",
  appId: "1:506496266895:web:35e16e5dad887a8a5276fa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native persistence using AsyncStorage when possible.
// Some SDK builds export 'firebase/auth/react-native'; if not available we fall back to web getAuth.
let authInstance: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rnAuth = require('firebase/auth/react-native');
  const { initializeAuth, getReactNativePersistence } = rnAuth;
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Fallback to standard getAuth (memory or default persistence)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getAuth } = require('firebase/auth');
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = getFirestore(app);