import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { User } from '../types/auth';

export class FirebaseAuthService {
  // Authentication state listener
  static onAuthStateChanged(callback: (user: User | null) => void) {
    return auth().onAuthStateChanged(async (firebaseUser: FirebaseAuthTypes.User | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await firestore()
            .collection('users')
            .doc(firebaseUser.uid)
            .get();

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const user: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              name: userData?.name || '',
              role: userData?.role || 'worker',
              farmId: userData?.farmId || '',
              profileImage: userData?.profileImage || '',
              phoneNumber: userData?.phoneNumber || '',
              isEmailVerified: firebaseUser.emailVerified,
            };
            callback(user);
          } else {
            callback(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Sign in with email and password
  static async signInWithEmailAndPassword(email: string, password: string): Promise<User> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      
      const userDoc = await firestore()
        .collection('users')
        .doc(userCredential.user.uid)
        .get();

      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data();
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        name: userData?.name || '',
        role: userData?.role || 'worker',
        farmId: userData?.farmId || '',
        profileImage: userData?.profileImage || '',
        phoneNumber: userData?.phoneNumber || '',
        isEmailVerified: userCredential.user.emailVerified,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  // Create user account
  static async createUserWithEmailAndPassword(
    email: string, 
    password: string, 
    additionalData: {
      name: string;
      role: 'admin' | 'manager' | 'worker';
      farmId: string;
      phoneNumber?: string;
    }
  ): Promise<User> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);

      // Create user profile in Firestore
      const userProfile = {
        name: additionalData.name,
        email: email,
        role: additionalData.role,
        farmId: additionalData.farmId,
        phoneNumber: additionalData.phoneNumber || '',
        profileImage: '',
        isEmailVerified: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore()
        .collection('users')
        .doc(userCredential.user.uid)
        .set(userProfile);

      // Send email verification
      await userCredential.user.sendEmailVerification();

      return {
        uid: userCredential.user.uid,
        email: email,
        name: additionalData.name,
        role: additionalData.role,
        farmId: additionalData.farmId,
        profileImage: '',
        phoneNumber: additionalData.phoneNumber || '',
        isEmailVerified: false,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  }

  // Reset password
  static async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  // Get current user
  static getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  // Update user profile
  static async updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(uid)
        .update({
          ...updates,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  }

  // Send email verification
  static async sendEmailVerification(): Promise<void> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      await currentUser.sendEmailVerification();
    } catch (error: any) {
      throw new Error(error.message || 'Email verification failed');
    }
  }

  // Check if email is verified
  static async reloadUserAndCheckVerification(): Promise<boolean> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return false;
      }
      await currentUser.reload();
      return currentUser.emailVerified;
    } catch (error) {
      return false;
    }
  }

  // Get user data from Firestore
  static async getUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(uid)
        .get();

      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      const currentUser = auth().currentUser;

      return {
        uid: uid,
        email: userData?.email || currentUser?.email || '',
        name: userData?.name || '',
        role: userData?.role || 'worker',
        farmId: userData?.farmId || '',
        profileImage: userData?.profileImage || '',
        phoneNumber: userData?.phoneNumber || '',
        isEmailVerified: currentUser?.emailVerified || false,
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  // Create farm worker account (admin function)
  static async createWorkerAccount(workerData: {
    email: string;
    name: string;
    farmId: string;
    phoneNumber?: string;
    temporaryPassword: string;
  }): Promise<{ user: User; temporaryPassword: string }> {
    try {
      // Create user account
      const userCredential = await auth().createUserWithEmailAndPassword(
        workerData.email,
        workerData.temporaryPassword
      );

      // Create user profile
      const userProfile = {
        name: workerData.name,
        email: workerData.email,
        role: 'worker' as const,
        farmId: workerData.farmId,
        phoneNumber: workerData.phoneNumber || '',
        profileImage: '',
        isEmailVerified: false,
        isTemporaryPassword: true, // Flag to force password change on first login
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore()
        .collection('users')
        .doc(userCredential.user.uid)
        .set(userProfile);

      const user: User = {
        uid: userCredential.user.uid,
        email: workerData.email,
        name: workerData.name,
        role: 'worker',
        farmId: workerData.farmId,
        profileImage: '',
        phoneNumber: workerData.phoneNumber || '',
        isEmailVerified: false,
      };

      return {
        user,
        temporaryPassword: workerData.temporaryPassword,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Worker account creation failed');
    }
  }
}

export default FirebaseAuthService;