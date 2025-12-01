// Media Capture Manager
// Handles camera and microphone access for photo/voice capture

interface MediaCaptureConfig {
  video?: MediaTrackConstraints;
  audio?: MediaTrackConstraints;
}

interface CapturedPhoto {
  blob: Blob;
  dataUrl: string;
  timestamp: string;
}

interface CapturedAudio {
  blob: Blob;
  duration: number;
  timestamp: string;
}

class MediaCaptureManager {
  private videoStream: MediaStream | null = null;
  private audioStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  // Camera methods
  async requestCameraPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('[Media Manager] Camera permission denied:', error);
      return false;
    }
  }

  async startCamera(videoElement?: HTMLVideoElement, config?: MediaCaptureConfig): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: config?.video || {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoElement) {
        videoElement.srcObject = this.videoStream;
        videoElement.play();
      }

      console.log('[Media Manager] Camera started');
      return this.videoStream;
    } catch (error) {
      console.error('[Media Manager] Failed to start camera:', error);
      throw error;
    }
  }

  stopCamera(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
      console.log('[Media Manager] Camera stopped');
    }
  }

  async capturePhoto(videoElement?: HTMLVideoElement): Promise<CapturedPhoto> {
    return new Promise((resolve, reject) => {
      try {
        const video = videoElement || document.createElement('video');
        if (!video.srcObject && this.videoStream) {
          video.srcObject = this.videoStream;
        }

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1920;
        canvas.height = video.videoHeight || 1080;

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          resolve({
            blob,
            dataUrl,
            timestamp: new Date().toISOString()
          });
        }, 'image/jpeg', 0.9);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Alternative: Use file input for camera
  async capturePhotoFromInput(): Promise<CapturedPhoto> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use camera directly

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            blob: file,
            dataUrl: reader.result as string,
            timestamp: new Date().toISOString()
          });
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      };

      input.click();
    });
  }

  // Microphone methods
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('[Media Manager] Microphone permission denied:', error);
      return false;
    }
  }

  async startRecording(config?: MediaCaptureConfig): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: config?.audio || {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      };

      this.audioStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.recordedChunks = [];

      // Create MediaRecorder
      const options = {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      };
      this.mediaRecorder = new MediaRecorder(this.audioStream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      console.log('[Media Manager] Recording started');
    } catch (error) {
      console.error('[Media Manager] Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<CapturedAudio> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      const startTime = Date.now();

      this.mediaRecorder.onstop = () => {
        const duration = Date.now() - startTime;
        const blob = new Blob(this.recordedChunks, { 
          type: this.mediaRecorder?.mimeType || 'audio/webm' 
        });

        // Stop audio stream
        if (this.audioStream) {
          this.audioStream.getTracks().forEach(track => track.stop());
          this.audioStream = null;
        }

        resolve({
          blob,
          duration,
          timestamp: new Date().toISOString()
        });

        console.log('[Media Manager] Recording stopped');
      };

      this.mediaRecorder.stop();
    });
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      console.log('[Media Manager] Recording paused');
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      console.log('[Media Manager] Recording resumed');
    }
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  // Utility methods
  async getAvailableDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices;
    } catch (error) {
      console.error('[Media Manager] Failed to enumerate devices:', error);
      return [];
    }
  }

  async getCameras(): Promise<MediaDeviceInfo[]> {
    const devices = await this.getAvailableDevices();
    return devices.filter(device => device.kind === 'videoinput');
  }

  async getMicrophones(): Promise<MediaDeviceInfo[]> {
    const devices = await this.getAvailableDevices();
    return devices.filter(device => device.kind === 'audioinput');
  }

  async switchCamera(deviceId: string, videoElement?: HTMLVideoElement): Promise<void> {
    this.stopCamera();
    await this.startCamera(videoElement, {
      video: { deviceId: { exact: deviceId } }
    });
  }

  // Cleanup
  cleanup(): void {
    this.stopCamera();
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
    if (this.mediaRecorder) {
      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
      this.mediaRecorder = null;
    }
    this.recordedChunks = [];
    console.log('[Media Manager] Cleanup completed');
  }

  // Check support
  static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  static isCameraSupported(): boolean {
    return MediaCaptureManager.isSupported();
  }

  static isMicrophoneSupported(): boolean {
    return MediaCaptureManager.isSupported();
  }

  static isMediaRecorderSupported(): boolean {
    return typeof MediaRecorder !== 'undefined';
  }
}

export const mediaManager = new MediaCaptureManager();
export default mediaManager;
