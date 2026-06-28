import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuthStore } from "../store/auth.store";
import { useTaskStore } from "../store/task.store";
import { FirestoreService } from "../services/firestore.service";

export default function AuthInitializer() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;

      const profile = await FirestoreService.getUserProfile(firebaseUser.uid);

      useAuthStore.setState((state) => ({
        accessToken: state.accessToken,
        isAuthenticated: true,
        isOnboarded: state.isOnboarded,
        user: {
          ...state.user!,
          id: firebaseUser.uid,
          userId: firebaseUser.uid,
          fullName:
            profile?.name ??
            firebaseUser.displayName ??
            "",
          email:
            profile?.email ??
            firebaseUser.email ??
            "",
          occupation:
            profile?.occupation ??
            state.user?.occupation ??
            "",
          bio:
            profile?.bio ??
            state.user?.bio ??
            "",
          avatar:
            profile?.avatar ??
            state.user?.avatar ??
            "",
        },
      }));

      await useTaskStore.getState().loadTasks(firebaseUser.uid);
    });

    return () => unsubscribe();
  }, []);

  return null;
}