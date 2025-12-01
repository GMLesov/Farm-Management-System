import { InteractionManager, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PerformanceMetric {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: { [key: string]: any };
  timestamp: Date;
}

export interface ScreenMetrics {
  screenName: string;
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage?: number;
  timestamp: Date;
}

export interface AppMetrics {
  appStartTime: number;
  totalScreens: number;
  averageScreenLoadTime: number;
  crashCount: number;
  lastCrashTime?: Date;
  totalSessions: number;
  averageSessionDuration: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private screenMetrics: ScreenMetrics[] = [];
  private appMetrics: AppMetrics = {
    appStartTime: Date.now(),
    totalScreens: 0,
    averageScreenLoadTime: 0,
    crashCount: 0,
    totalSessions: 0,
    averageSessionDuration: 0,
  };
  private activeMetrics: Map<string, PerformanceMetric> = new Map();
  private sessionStartTime: number = Date.now();

  async initialize(): Promise<void> {
    // Load existing metrics
    await this.loadMetrics();
    
    // Track app start
    this.trackAppStart();
    
    // Set up automatic cleanup
    this.setupCleanup();
    
    console.log('Performance Monitor initialized');
  }

  private async loadMetrics(): Promise<void> {
    try {
      const [metricsData, screenData, appData] = await Promise.all([
        AsyncStorage.getItem('performance_metrics'),
        AsyncStorage.getItem('screen_metrics'),
        AsyncStorage.getItem('app_metrics'),
      ]);

      if (metricsData) {
        this.metrics = JSON.parse(metricsData);
      }

      if (screenData) {
        this.screenMetrics = JSON.parse(screenData);
      }

      if (appData) {
        this.appMetrics = { ...this.appMetrics, ...JSON.parse(appData) };
      }
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    }
  }

  private async saveMetrics(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem('performance_metrics', JSON.stringify(this.metrics.slice(-100))), // Keep last 100
        AsyncStorage.setItem('screen_metrics', JSON.stringify(this.screenMetrics.slice(-50))), // Keep last 50
        AsyncStorage.setItem('app_metrics', JSON.stringify(this.appMetrics)),
      ]);
    } catch (error) {
      console.error('Failed to save performance metrics:', error);
    }
  }

  private trackAppStart(): void {
    this.appMetrics.totalSessions++;
    this.startMetric('app_start', 'Application startup time');
    
    // Mark app start complete when interactions are ready
    InteractionManager.runAfterInteractions(() => {
      this.endMetric('app_start');
    });
  }

  private setupCleanup(): void {
    // Clean up old metrics periodically
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 60 * 60 * 1000); // Every hour
  }

  private cleanupOldMetrics(): void {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    this.metrics = this.metrics.filter(metric => 
      metric.timestamp.getTime() > oneWeekAgo
    );
    
    this.screenMetrics = this.screenMetrics.filter(metric => 
      metric.timestamp.getTime() > oneWeekAgo
    );
    
    this.saveMetrics();
  }

  // Public API
  startMetric(id: string, name: string, metadata?: { [key: string]: any }): void {
    const metric: PerformanceMetric = {
      id,
      name,
      startTime: Date.now(),
      metadata,
      timestamp: new Date(),
    };

    this.activeMetrics.set(id, metric);
  }

  endMetric(id: string): PerformanceMetric | null {
    const metric = this.activeMetrics.get(id);
    
    if (!metric) {
      console.warn(`No active metric found with id: ${id}`);
      return null;
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;

    this.metrics.push(metric);
    this.activeMetrics.delete(id);

    // Auto-save every 10 metrics
    if (this.metrics.length % 10 === 0) {
      this.saveMetrics();
    }

    return metric;
  }

  trackScreenLoad(screenName: string): {
    markRenderComplete: () => void;
    markInteractionComplete: () => void;
  } {
    const startTime = Date.now();
    let renderTime = 0;
    let interactionTime = 0;

    this.appMetrics.totalScreens++;

    const markRenderComplete = () => {
      renderTime = Date.now() - startTime;
    };

    const markInteractionComplete = () => {
      interactionTime = Date.now() - startTime;
      
      const screenMetric: ScreenMetrics = {
        screenName,
        loadTime: interactionTime,
        renderTime,
        interactionTime,
        timestamp: new Date(),
      };

      this.screenMetrics.push(screenMetric);
      
      // Update average load time
      this.updateAverageScreenLoadTime();
      
      this.saveMetrics();
    };

    return {
      markRenderComplete,
      markInteractionComplete,
    };
  }

  private updateAverageScreenLoadTime(): void {
    if (this.screenMetrics.length === 0) return;
    
    const totalLoadTime = this.screenMetrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    this.appMetrics.averageScreenLoadTime = totalLoadTime / this.screenMetrics.length;
  }

  trackError(error: Error, context?: string): void {
    this.appMetrics.crashCount++;
    this.appMetrics.lastCrashTime = new Date();

    const errorMetric: PerformanceMetric = {
      id: `error_${Date.now()}`,
      name: 'Application Error',
      startTime: Date.now(),
      endTime: Date.now(),
      duration: 0,
      metadata: {
        error: error.message,
        stack: error.stack,
        context,
      },
      timestamp: new Date(),
    };

    this.metrics.push(errorMetric);
    this.saveMetrics();
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getScreenMetrics(): ScreenMetrics[] {
    return [...this.screenMetrics];
  }

  getAppMetrics(): AppMetrics {
    // Update session duration
    const sessionDuration = Date.now() - this.sessionStartTime;
    const updatedMetrics = {
      ...this.appMetrics,
      averageSessionDuration: sessionDuration,
    };

    return updatedMetrics;
  }

  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  getAverageMetric(name: string): number {
    const filteredMetrics = this.getMetricsByName(name);
    if (filteredMetrics.length === 0) return 0;

    const totalDuration = filteredMetrics.reduce((sum, metric) => sum + (metric.duration || 0), 0);
    return totalDuration / filteredMetrics.length;
  }

  getSlowestScreens(limit: number = 5): ScreenMetrics[] {
    return [...this.screenMetrics]
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, limit);
  }

  getPerformanceReport(): {
    summary: AppMetrics;
    slowestScreens: ScreenMetrics[];
    commonErrors: { error: string; count: number }[];
    averageMetrics: { [key: string]: number };
  } {
    const errorMetrics = this.metrics.filter(m => m.name === 'Application Error');
    const errorCounts = errorMetrics.reduce((acc, metric) => {
      const error = metric.metadata?.error || 'Unknown Error';
      acc[error] = (acc[error] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const commonErrors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const uniqueMetricNames = [...new Set(this.metrics.map(m => m.name))];
    const averageMetrics = uniqueMetricNames.reduce((acc, name) => {
      acc[name] = this.getAverageMetric(name);
      return acc;
    }, {} as { [key: string]: number });

    return {
      summary: this.getAppMetrics(),
      slowestScreens: this.getSlowestScreens(),
      commonErrors,
      averageMetrics,
    };
  }

  async exportMetrics(): Promise<string> {
    const report = this.getPerformanceReport();
    return JSON.stringify(report, null, 2);
  }

  async clearMetrics(): Promise<void> {
    this.metrics = [];
    this.screenMetrics = [];
    this.activeMetrics.clear();
    await this.saveMetrics();
  }

  // React Native specific monitoring
  trackMemoryUsage(): number {
    // This would require a native module for accurate memory tracking
    // For now, return screen dimensions as a simple metric
    const { width, height } = Dimensions.get('window');
    return width * height; // Approximate memory usage indicator
  }

  trackBundleSize(): void {
    // This would be implemented with a native module
    // or estimated based on app features
    this.startMetric('bundle_analysis', 'Bundle size analysis');
    // Simulate bundle analysis
    setTimeout(() => {
      this.endMetric('bundle_analysis');
    }, 100);
  }
}

export const performanceMonitor = new PerformanceMonitor();