import { initializeApp, getApps } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';
import { Animal, Crop, Task } from '../types';

// Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore with offline persistence
firestore().settings({
  persistence: true,
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
});

// Enable offline persistence
firestore().enableNetwork();

// Firebase Service with CRUD operations
class FirebaseService {
  // Animal CRUD operations
  async getAnimals(): Promise<Animal[]> {
    try {
      const snapshot = await firestore().collection('animals').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Animal));
    } catch (error) {
      console.error('Error fetching animals:', error);
      return [];
    }
  }

  async createAnimal(animal: Animal): Promise<void> {
    await firestore().collection('animals').doc(animal.id).set(animal);
  }

  async updateAnimal(animalId: string, updates: Partial<Animal>): Promise<void> {
    await firestore().collection('animals').doc(animalId).update(updates);
  }

  async deleteAnimal(animalId: string): Promise<void> {
    await firestore().collection('animals').doc(animalId).delete();
  }

  // Crop CRUD operations
  async getCrops(): Promise<Crop[]> {
    try {
      const snapshot = await firestore().collection('crops').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Crop));
    } catch (error) {
      console.error('Error fetching crops:', error);
      return [];
    }
  }

  async createCrop(crop: Crop): Promise<void> {
    await firestore().collection('crops').doc(crop.id).set(crop);
  }

  async updateCrop(cropId: string, updates: Partial<Crop>): Promise<void> {
    await firestore().collection('crops').doc(cropId).update(updates);
  }

  async deleteCrop(cropId: string): Promise<void> {
    await firestore().collection('crops').doc(cropId).delete();
  }

  // Task CRUD operations
  async getTasks(): Promise<Task[]> {
    try {
      const snapshot = await firestore().collection('tasks').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  async createTask(task: Task): Promise<void> {
    await firestore().collection('tasks').doc(task.id).set(task);
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    await firestore().collection('tasks').doc(taskId).update(updates);
  }

  async deleteTask(taskId: string): Promise<void> {
    await firestore().collection('tasks').doc(taskId).delete();
  }
}

const firebaseService = new FirebaseService();

export { auth, firestore, storage, messaging, firebaseService };
export default app;