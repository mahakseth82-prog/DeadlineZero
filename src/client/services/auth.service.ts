import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "../../lib/firebase";

export const AuthService = {
  async signup(fullName: string, email: string, password: string) {
    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(result.user, {
      displayName: fullName,
    });

    return result.user;
  },

  async login(email: string, password: string) {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return result.user;
  },

  async googleLogin() {
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(
      auth,
      provider
    );

    return result.user;
  },

  async logout() {
    await signOut(auth);
  },
};