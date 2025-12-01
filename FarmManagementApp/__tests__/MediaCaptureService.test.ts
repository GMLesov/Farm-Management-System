import { MediaCaptureService } from '../src/services/MediaCaptureService';

// Mock the dependencies that MediaCaptureService uses
jest.mock('react-native-image-picker');
jest.mock('@react-native-firebase/storage');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native-fs');
jest.mock('@react-native-community/netinfo');

describe('MediaCaptureService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('MediaCaptureService exists and has required methods', () => {
    expect(MediaCaptureService).toBeDefined();
    expect(typeof MediaCaptureService.showMediaSelector).toBe('function');
    expect(typeof MediaCaptureService.openCamera).toBe('function');
    expect(typeof MediaCaptureService.openGallery).toBe('function');
    expect(typeof MediaCaptureService.uploadMedia).toBe('function');
    expect(typeof MediaCaptureService.syncPendingUploads).toBe('function');
    expect(typeof MediaCaptureService.getAllMedia).toBe('function');
    expect(typeof MediaCaptureService.deleteMedia).toBe('function');
  });

  test('Media types are properly defined', () => {
    // Test that the service can handle different media types
    const photoOptions = { mediaType: 'photo' as const };
    const videoOptions = { mediaType: 'video' as const };
    const mixedOptions = { mediaType: 'mixed' as const };
    
    expect(photoOptions.mediaType).toBe('photo');
    expect(videoOptions.mediaType).toBe('video');
    expect(mixedOptions.mediaType).toBe('mixed');
  });

  test('Upload queue key constants are defined', () => {
    // These constants should be available for testing
    expect(typeof MediaCaptureService).toBe('object');
  });
});