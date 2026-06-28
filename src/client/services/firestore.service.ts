import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../lib/firebase";

export const FirestoreService = {
  async createUserProfile(user: {
    uid: string;
    name: string;
    email: string;
  }) {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: user.name,
      email: user.email,

      productivityScore: 0,
      focusScore: 0,
      currentStreak: 0,
      longestStreak: 0,

      createdAt: serverTimestamp(),
    });
  },

  async getUserProfile(uid: string) {
    const snapshot = await getDoc(doc(db, "users", uid));

    if (!snapshot.exists()) return null;

    return snapshot.data();
  },

 async updateUserProfile(
  uid: string,
  data: Record<string, any>
) {
  await setDoc(
    doc(db, "users", uid),
    data,
    { merge: true }
  );
}
}