import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
} from "firebase/firestore";

import { db } from "../../lib/firebase";
import { Task } from "../../types";

export class TaskService {
  private static COLLECTION = "tasks";

  static async getUserTasks(userId: string): Promise<Task[]> {
    if (!userId) return [];

    const q = query(
      collection(db, this.COLLECTION),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Task[];
  }

  static async createTask(task: Task): Promise<void> {
    await setDoc(
      doc(db, this.COLLECTION, task.id),
      task
    );
  }

  static async updateTask(
    taskId: string,
    updates: Partial<Task>
  ): Promise<void> {
    await updateDoc(
      doc(db, this.COLLECTION, taskId),
      updates
    );
  }

  static async deleteTask(taskId: string): Promise<void> {
    await deleteDoc(
      doc(db, this.COLLECTION, taskId)
    );
  }
}