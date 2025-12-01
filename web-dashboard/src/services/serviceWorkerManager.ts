// Service Worker Registration and Management
// Handles PWA installation, updates, and offline functionality

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;

  async register(config?: ServiceWorkerConfig): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        // Register service worker
        this.registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });

        console.log('[SW Manager] Service Worker registered:', this.registration.scope);

        // Check for updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration?.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('[SW Manager] New version available!');
              if (config?.onUpdate) {
                config.onUpdate(this.registration!);
              } else {
                // Default: prompt user to reload
                if (window.confirm('New version available! Reload to update?')) {
                  window.location.reload();
                }
              }
            }
          });
        });

        // Success callback
        if (config?.onSuccess) {
          config.onSuccess(this.registration);
        }

        // Check for updates periodically (every hour)
        setInterval(() => {
          this.registration?.update();
        }, 60 * 60 * 1000);

      } catch (error) {
        console.error('[SW Manager] Registration failed:', error);
        if (config?.onError) {
          config.onError(error as Error);
        }
      }
    } else {
      console.warn('[SW Manager] Service Workers not supported');
    }
  }

  async unregister(): Promise<boolean> {
    if (this.registration) {
      return await this.registration.unregister();
    }
    return false;
  }

  async skipWaiting(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  async cacheUrls(urls: string[], cacheName?: string): Promise<void> {
    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'CACHE_URLS',
        urls,
        cacheName
      });
    }
  }

  async clearCache(): Promise<void> {
    if (this.registration?.active) {
      this.registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

export const swManager = new ServiceWorkerManager();
export default swManager;
