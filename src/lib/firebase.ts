
 import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBC4vXCyGgp6JKEA_AYhyu3SBhDbf1A4Yk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "deadlinezero-d4077.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "deadlinezero-d4077",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "deadlinezero-d4077.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "9197800550",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:9197800550:web:981e4a033c76b0d762f1a7",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();

export default app;