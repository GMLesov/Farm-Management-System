import admin from 'firebase-admin';
import { logger } from '@/utils/logger';

let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = async (): Promise<void> => {
  try {
    if (firebaseApp) {
      logger.info('Firebase already initialized');
      return;
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (!serviceAccountKey || !projectId) {
      logger.warn('Firebase configuration missing - skipping Firebase initialization');
      return;
    }

    const databaseURL = process.env.FIREBASE_DATABASE_URL;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    let serviceAccount;
    try {
      // Parse service account key from environment variable
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (error) {
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Must be valid JSON.');
    }

    const firebaseConfig: admin.AppOptions = {
      credential: admin.credential.cert(serviceAccount),
      projectId,
    };

    if (databaseURL) {
      firebaseConfig.databaseURL = databaseURL;
    }

    if (storageBucket) {
      firebaseConfig.storageBucket = storageBucket;
    }

    firebaseApp = admin.initializeApp(firebaseConfig);
    logger.info('Firebase initialized successfully');

  } catch (error) {
    logger.error('Failed to initialize Firebase:', error);
    throw error;
  }
};

export const getFirebaseApp = (): admin.app.App => {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return firebaseApp;
};

// Firebase services
export const firebaseAuth = () => {
  return getFirebaseApp().auth();
};

export const firebaseFirestore = () => {
  return getFirebaseApp().firestore();
};

export const firebaseStorage = () => {
  return getFirebaseApp().storage();
};

export const firebaseMessaging = () => {
  return getFirebaseApp().messaging();
};

// Utility functions for Firebase operations
export const firebaseService = {
  // Send push notification
  async sendNotification(token: string, title: string, body: string, data?: Record<string, string>) {
    try {
      const message: any = {
        notification: { title, body },
        token,
      };

      if (data) {
        message.data = data;
      }

      const response = await firebaseMessaging().send(message);
      logger.info(`Notification sent successfully: ${response}`);
      return response;
    } catch (error) {
      logger.error('Error sending notification:', error);
      throw error;
    }
  },

  // Send notification to multiple devices
  async sendMulticastNotification(tokens: string[], title: string, body: string, data?: Record<string, string>) {
    try {
      const message: any = {
        notification: { title, body },
        tokens,
      };

      if (data) {
        message.data = data;
      }

      const response = await firebaseMessaging().sendMulticast(message);
      logger.info(`Multicast notification sent. Success: ${response.successCount}, Failure: ${response.failureCount}`);
      return response;
    } catch (error) {
      logger.error('Error sending multicast notification:', error);
      throw error;
    }
  },

  // Verify Firebase ID token
  async verifyIdToken(idToken: string) {
    try {
      const decodedToken = await firebaseAuth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      logger.error('Error verifying ID token:', error);
      throw error;
    }
  },

  // Create custom token
  async createCustomToken(uid: string, additionalClaims?: object) {
    try {
      const customToken = await firebaseAuth().createCustomToken(uid, additionalClaims);
      return customToken;
    } catch (error) {
      logger.error('Error creating custom token:', error);
      throw error;
    }
  },

  // Upload file to Firebase Storage
  async uploadFile(buffer: Buffer, fileName: string, folder: string = 'uploads') {
    try {
      const bucket = firebaseStorage().bucket();
      const file = bucket.file(`${folder}/${fileName}`);
      
      await file.save(buffer, {
        metadata: {
          contentType: 'auto',
        },
      });

      // Make file publicly accessible
      await file.makePublic();

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      return publicUrl;
    } catch (error) {
      logger.error('Error uploading file to Firebase Storage:', error);
      throw error;
    }
  },

  // Delete file from Firebase Storage
  async deleteFile(filePath: string) {
    try {
      const bucket = firebaseStorage().bucket();
      await bucket.file(filePath).delete();
      logger.info(`File deleted successfully: ${filePath}`);
    } catch (error) {
      logger.error('Error deleting file from Firebase Storage:', error);
      throw error;
    }
  }
};