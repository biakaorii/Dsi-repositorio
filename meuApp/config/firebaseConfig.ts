import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
export const auth = getAuth(app);
export const db = getFirestore(app);