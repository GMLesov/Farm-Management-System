import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { launchImageLibrary, launchCamera, MediaType, ImagePickerResponse, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OfflineStorageService from './OfflineStorageService';

export interface MediaItem {
  id: string;
  uri: string;
  fileName: string;
  type: 'photo' | 'video';
  size: number;
  timestamp: string;
  localPath: string;
  cloudPath?: string;
  isUploaded: boolean;
  metadata?: {
    location?: {
      latitude: number;
      longitude: number;
    };
    taskId?: string;
    animalId?: string;
    cropId?: string;
    category?: string;
    description?: string;
  };
}

export interface CaptureOptions {
  mediaType?: MediaType;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  includeBase64?: boolean;
  videoQuality?: 'low' | 'medium' | 'high';
  durationLimit?: number;
}

export class MediaCaptureService {
  private static readonly MEDIA_STORAGE_KEY = '@farm_app_media';
  private static readonly PENDING_UPLOADS_KEY = '@farm_app_pending_uploads';

  private static readonly DEFAULT_OPTIONS: CaptureOptions = {
    mediaType: 'mixed',
    quality: 0.8,
    maxWidth: 1024,
    maxHeight: 1024,
    includeBase64: false,
    videoQuality: 'medium',
    durationLimit: 30,
  };

  // Request camera permissions
  static async requestCameraPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        return (
          granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn('Camera permission error:', err);
        return false;
      }
    }
    return true;
  }

  // Show media selection alert
  static showMediaSelector(
    title: string = 'Add Media',
    options: CaptureOptions = {},
    onSuccess: (media: MediaItem) => void,
    onError?: (error: string) => void
  ): void {
    const alertOptions = [
      { text: 'Camera', onPress: () => this.openCamera(options, onSuccess, onError) },
      { text: 'Gallery', onPress: () => this.openGallery(options, onSuccess, onError) },
      { text: 'Cancel', style: 'cancel' as const },
    ];

    Alert.alert(title, 'Choose how to add media', alertOptions);
  }

  // Open camera for capture
  static async openCamera(
    options: CaptureOptions = {},
    onSuccess: (media: MediaItem) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) {
      onError?.('Camera permissions are required');
      return;
    }

    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    const cameraOptions: CameraOptions = {
      mediaType: mergedOptions.mediaType!,
      quality: (mergedOptions.quality! * 100) as any, // Convert 0-1 to 0-100
      maxWidth: mergedOptions.maxWidth,
      maxHeight: mergedOptions.maxHeight,
      includeBase64: mergedOptions.includeBase64,
      videoQuality: mergedOptions.videoQuality,
      durationLimit: mergedOptions.durationLimit,
    };

    launchCamera(cameraOptions, (response: ImagePickerResponse) => {
      this.handleMediaResponse(response, onSuccess, onError);
    });
  }

  // Open gallery for selection
  static async openGallery(
    options: CaptureOptions = {},
    onSuccess: (media: MediaItem) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    const libraryOptions: ImageLibraryOptions = {
      mediaType: mergedOptions.mediaType!,
      quality: (mergedOptions.quality! * 100) as any, // Convert 0-1 to 0-100
      maxWidth: mergedOptions.maxWidth,
      maxHeight: mergedOptions.maxHeight,
      includeBase64: mergedOptions.includeBase64,
      selectionLimit: 1,
    };

    launchImageLibrary(libraryOptions, (response: ImagePickerResponse) => {
      this.handleMediaResponse(response, onSuccess, onError);
    });
  }

  // Handle media picker response
  private static async handleMediaResponse(
    response: ImagePickerResponse,
    onSuccess: (media: MediaItem) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    if (response.didCancel || response.errorMessage) {
      onError?.(response.errorMessage || 'Selection cancelled');
      return;
    }

    if (response.assets && response.assets.length > 0) {
      const asset = response.assets[0];
      
      try {
        const mediaItem = await this.createMediaItem(asset);
        await this.storeMediaLocally(mediaItem);
        onSuccess(mediaItem);
      } catch (error) {
        console.error('Error processing media:', error);
        onError?.('Failed to process media');
      }
    }
  }

  // Create media item from asset
  private static async createMediaItem(asset: any): Promise<MediaItem> {
    const timestamp = new Date().toISOString();
    const fileExtension = asset.fileName?.split('.').pop() || (asset.type?.includes('video') ? 'mp4' : 'jpg');
    const fileName = `${timestamp.replace(/[:.]/g, '-')}.${fileExtension}`;
    
    return {
      id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      uri: asset.uri,
      fileName,
      type: asset.type?.includes('video') ? 'video' : 'photo',
      size: asset.fileSize || 0,
      timestamp,
      localPath: asset.uri,
      isUploaded: false,
      metadata: {
        category: 'general',
      },
    };
  }

  // Store media locally
  static async storeMediaLocally(mediaItem: MediaItem): Promise<void> {
    try {
      // Get existing media items
      const existingMediaJson = await AsyncStorage.getItem(this.MEDIA_STORAGE_KEY);
      const existingMedia: MediaItem[] = existingMediaJson ? JSON.parse(existingMediaJson) : [];
      
      // Add new media item
      existingMedia.push(mediaItem);
      
      // Store updated media list
      await AsyncStorage.setItem(this.MEDIA_STORAGE_KEY, JSON.stringify(existingMedia));

      // Add to pending uploads
      const pendingUploadsJson = await AsyncStorage.getItem(this.PENDING_UPLOADS_KEY);
      const pendingUploads: string[] = pendingUploadsJson ? JSON.parse(pendingUploadsJson) : [];
      
      if (!pendingUploads.includes(mediaItem.id)) {
        pendingUploads.push(mediaItem.id);
        await AsyncStorage.setItem(this.PENDING_UPLOADS_KEY, JSON.stringify(pendingUploads));
      }

      console.log('Media stored locally:', mediaItem.id);
    } catch (error) {
      console.error('Error storing media locally:', error);
      throw error;
    }
  }

  // Upload media to Firebase Storage
  static async uploadMedia(mediaItem: MediaItem, userId: string): Promise<string> {
    try {
      const isOnline = await OfflineStorageService.isOnline();
      if (!isOnline) {
        throw new Error('No internet connection');
      }

      const storageRef = storage().ref(`farm-media/${userId}/${mediaItem.fileName}`);
      
      // Upload file
      await storageRef.putFile(mediaItem.localPath);
      const downloadURL = await storageRef.getDownloadURL();

      // Update media item with cloud path
      const updatedMediaItem = {
        ...mediaItem,
        cloudPath: downloadURL,
        isUploaded: true,
      };

      // Update local storage
      await this.updateMediaItem(updatedMediaItem);

      // Remove from pending uploads
      await this.removeFromPendingUploads(mediaItem.id);

      console.log('Media uploaded successfully:', mediaItem.id);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  }

  // Update media item in local storage
  static async updateMediaItem(updatedMediaItem: MediaItem): Promise<void> {
    try {
      const existingMediaJson = await AsyncStorage.getItem(this.MEDIA_STORAGE_KEY);
      const existingMedia: MediaItem[] = existingMediaJson ? JSON.parse(existingMediaJson) : [];
      
      const updatedMedia = existingMedia.map(item => 
        item.id === updatedMediaItem.id ? updatedMediaItem : item
      );
      
      await AsyncStorage.setItem(this.MEDIA_STORAGE_KEY, JSON.stringify(updatedMedia));
    } catch (error) {
      console.error('Error updating media item:', error);
      throw error;
    }
  }

  // Remove from pending uploads
  static async removeFromPendingUploads(mediaId: string): Promise<void> {
    try {
      const pendingUploadsJson = await AsyncStorage.getItem(this.PENDING_UPLOADS_KEY);
      const pendingUploads: string[] = pendingUploadsJson ? JSON.parse(pendingUploadsJson) : [];
      
      const updatedPendingUploads = pendingUploads.filter(id => id !== mediaId);
      await AsyncStorage.setItem(this.PENDING_UPLOADS_KEY, JSON.stringify(updatedPendingUploads));
    } catch (error) {
      console.error('Error removing from pending uploads:', error);
    }
  }

  // Get media by ID
  static async getMediaById(mediaId: string): Promise<MediaItem | null> {
    try {
      const existingMediaJson = await AsyncStorage.getItem(this.MEDIA_STORAGE_KEY);
      const existingMedia: MediaItem[] = existingMediaJson ? JSON.parse(existingMediaJson) : [];
      
      return existingMedia.find(item => item.id === mediaId) || null;
    } catch (error) {
      console.error('Error getting media by ID:', error);
      return null;
    }
  }

  // Get all media items
  static async getAllMedia(): Promise<MediaItem[]> {
    try {
      const existingMediaJson = await AsyncStorage.getItem(this.MEDIA_STORAGE_KEY);
      return existingMediaJson ? JSON.parse(existingMediaJson) : [];
    } catch (error) {
      console.error('Error getting all media:', error);
      return [];
    }
  }

  // Get pending uploads
  static async getPendingUploads(): Promise<MediaItem[]> {
    try {
      const pendingUploadsJson = await AsyncStorage.getItem(this.PENDING_UPLOADS_KEY);
      const pendingUploadIds: string[] = pendingUploadsJson ? JSON.parse(pendingUploadsJson) : [];
      
      const allMedia = await this.getAllMedia();
      return allMedia.filter(item => pendingUploadIds.includes(item.id));
    } catch (error) {
      console.error('Error getting pending uploads:', error);
      return [];
    }
  }

  // Sync pending media uploads
  static async syncPendingUploads(userId: string): Promise<void> {
    try {
      const isOnline = await OfflineStorageService.isOnline();
      if (!isOnline) return;

      const pendingUploads = await this.getPendingUploads();
      
      for (const mediaItem of pendingUploads) {
        try {
          if (!mediaItem.isUploaded) {
            await this.uploadMedia(mediaItem, userId);
          }
        } catch (error) {
          console.error('Error syncing media upload:', mediaItem.id, error);
        }
      }
    } catch (error) {
      console.error('Error syncing pending uploads:', error);
    }
  }

  // Delete media
  static async deleteMedia(mediaId: string): Promise<void> {
    try {
      const mediaItem = await this.getMediaById(mediaId);
      if (!mediaItem) return;

      // Delete from cloud storage if uploaded
      if (mediaItem.isUploaded && mediaItem.cloudPath) {
        const isOnline = await OfflineStorageService.isOnline();
        if (isOnline) {
          try {
            const storageRef = storage().refFromURL(mediaItem.cloudPath);
            await storageRef.delete();
          } catch (error) {
            console.error('Error deleting from cloud storage:', error);
          }
        }
      }

      // Delete local file if it exists
      if (mediaItem.localPath && await RNFS.exists(mediaItem.localPath)) {
        await RNFS.unlink(mediaItem.localPath);
      }

      // Remove from local storage
      const existingMediaJson = await AsyncStorage.getItem(this.MEDIA_STORAGE_KEY);
      const existingMedia: MediaItem[] = existingMediaJson ? JSON.parse(existingMediaJson) : [];
      const updatedMedia = existingMedia.filter(item => item.id !== mediaId);
      await AsyncStorage.setItem(this.MEDIA_STORAGE_KEY, JSON.stringify(updatedMedia));

      // Remove from pending uploads
      await this.removeFromPendingUploads(mediaId);

      console.log('Media deleted:', mediaId);
    } catch (error) {
      console.error('Error deleting media:', error);
      throw error;
    }
  }

  // Add metadata to media
  static async addMediaMetadata(
    mediaId: string, 
    metadata: Partial<MediaItem['metadata']>
  ): Promise<void> {
    try {
      const mediaItem = await this.getMediaById(mediaId);
      if (!mediaItem) return;

      const updatedMediaItem = {
        ...mediaItem,
        metadata: {
          ...mediaItem.metadata,
          ...metadata,
        },
      };

      await this.updateMediaItem(updatedMediaItem);
    } catch (error) {
      console.error('Error adding media metadata:', error);
      throw error;
    }
  }
}

export default MediaCaptureService;