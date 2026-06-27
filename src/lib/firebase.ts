
 import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBC4vXCyGgp6JKEA_AYhyu3SBhDbf1A4Yk",
  authDomain: "deadlinezero-d4077.firebaseapp.com",
  projectId: "deadlinezero-d4077",
  storageBucket: "deadlinezero-d4077.firebasestorage.app",
  messagingSenderId: "9197800550",
  appId: "1:9197800550:web:981e4a033c76b0d762f1a7",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();

export default app;