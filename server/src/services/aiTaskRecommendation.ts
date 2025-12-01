// AI Task Recommendation Engine
// Uses machine learning patterns to suggest optimal task assignments

interface TaskPattern {
  workerId: string;
  taskType: string;
  completionTime: number;
  quality: number;
  weather: string;
  season: string;
}

interface WorkerProfile {
  id: string;
  name: string;
  skills: string[];
  averageCompletionTime: { [taskType: string]: number };
  qualityScore: number;
  preferredTasks: string[];
  availability: { [day: string]: boolean };
}

interface TaskRecommendation {
  taskId: string;
  workerId: string;
  workerName: string;
  confidence: number;
  reasons: string[];
  estimatedCompletionTime: number;
  optimalStartTime: string;
}

class AITaskRecommendationEngine {
  private taskHistory: TaskPattern[] = [];
  private workerProfiles: Map<string, WorkerProfile> = new Map();

  // Analyze historical task data
  async analyzeTaskHistory(tasks: any[]): Promise<void> {
    for (const task of tasks) {
      if (task.status === 'completed' && task.assignedTo && task.completedAt) {
        const pattern: TaskPattern = {
          workerId: task.assignedTo,
          taskType: task.type || 'general',
          completionTime: this.calculateCompletionTime(task.createdAt, task.completedAt),
          quality: task.qualityRating || 3,
          weather: task.weather || 'sunny',
          season: this.getSeason(task.createdAt)
        };
        this.taskHistory.push(pattern);
      }
    }
  }

  // Build worker profiles from historical data
  async buildWorkerProfiles(workers: any[], tasks: any[]): Promise<void> {
    for (const worker of workers) {
      const workerTasks = tasks.filter(t => t.assignedTo === worker._id);
      const completionTimes: { [key: string]: number[] } = {};
      const taskTypes = new Set<string>();

      workerTasks.forEach(task => {
        const type = task.type || 'general';
        taskTypes.add(type);
        
        if (task.completedAt && task.createdAt) {
          if (!completionTimes[type]) completionTimes[type] = [];
          completionTimes[type].push(this.calculateCompletionTime(task.createdAt, task.completedAt));
        }
      });

      const avgTimes: { [key: string]: number } = {};
      Object.keys(completionTimes).forEach(type => {
        avgTimes[type] = completionTimes[type].reduce((a, b) => a + b, 0) / completionTimes[type].length;
      });

      const profile: WorkerProfile = {
        id: worker._id,
        name: worker.name,
        skills: Array.from(taskTypes),
        averageCompletionTime: avgTimes,
        qualityScore: this.calculateQualityScore(workerTasks),
        preferredTasks: this.identifyPreferredTasks(workerTasks),
        availability: this.getWorkerAvailability(worker)
      };

      this.workerProfiles.set(worker._id, profile);
    }
  }

  // Recommend best worker for a task
  async recommendWorkerForTask(task: any, workers: any[]): Promise<TaskRecommendation[]> {
    const recommendations: TaskRecommendation[] = [];
    const taskType = task.type || 'general';

    for (const worker of workers) {
      const profile = this.workerProfiles.get(worker._id);
      if (!profile) continue;

      const score = this.calculateMatchScore(task, profile);
      const reasons = this.generateReasons(task, profile, score);

      recommendations.push({
        taskId: task._id,
        workerId: worker._id,
        workerName: worker.name,
        confidence: score.confidence,
        reasons,
        estimatedCompletionTime: profile.averageCompletionTime[taskType] || 60,
        optimalStartTime: this.calculateOptimalStartTime(task, profile)
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  // Calculate match score between task and worker
  private calculateMatchScore(task: any, profile: WorkerProfile): { confidence: number; details: any } {
    let score = 0;
    const weights = {
      skillMatch: 0.3,
      experience: 0.25,
      quality: 0.2,
      availability: 0.15,
      efficiency: 0.1
    };

    // Skill match
    const taskType = task.type || 'general';
    const hasSkill = profile.skills.includes(taskType);
    score += hasSkill ? weights.skillMatch : 0;

    // Experience (has done this task before)
    const hasExperience = profile.averageCompletionTime[taskType] !== undefined;
    score += hasExperience ? weights.experience : 0;

    // Quality score
    score += (profile.qualityScore / 5) * weights.quality;

    // Availability
    const taskDay = new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'long' });
    const isAvailable = profile.availability[taskDay] !== false;
    score += isAvailable ? weights.availability : 0;

    // Efficiency (faster completion)
    if (hasExperience) {
      const avgTime = profile.averageCompletionTime[taskType];
      const maxTime = 240; // 4 hours
      score += ((maxTime - Math.min(avgTime, maxTime)) / maxTime) * weights.efficiency;
    }

    return {
      confidence: Math.round(score * 100),
      details: { hasSkill, hasExperience, qualityScore: profile.qualityScore, isAvailable }
    };
  }

  // Generate human-readable reasons
  private generateReasons(task: any, profile: WorkerProfile, score: any): string[] {
    const reasons: string[] = [];

    if (score.details.hasSkill) {
      reasons.push(`Experienced in ${task.type || 'general'} tasks`);
    }

    if (score.details.qualityScore >= 4) {
      reasons.push('High quality work history');
    }

    if (score.details.hasExperience) {
      const taskType = task.type || 'general';
      const avgTime = profile.averageCompletionTime[taskType];
      if (avgTime < 120) {
        reasons.push('Fast completion time');
      }
    }

    if (score.details.isAvailable) {
      reasons.push('Available on scheduled day');
    }

    if (profile.preferredTasks.includes(task.type)) {
      reasons.push('Task matches worker preferences');
    }

    return reasons.length > 0 ? reasons : ['General capability match'];
  }

  // Calculate optimal start time based on weather, worker schedule, etc.
  private calculateOptimalStartTime(task: any, profile: WorkerProfile): string {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(7, 0, 0, 0); // 7 AM start

    // For weather-sensitive tasks, recommend early morning
    if (task.type === 'crop' || task.type === 'planting') {
      return tomorrow.toISOString();
    }

    // For animal tasks, recommend based on feeding schedule
    if (task.type === 'animal') {
      tomorrow.setHours(6, 0, 0, 0); // 6 AM
      return tomorrow.toISOString();
    }

    return tomorrow.toISOString();
  }

  // Helper methods
  private calculateCompletionTime(start: Date, end: Date): number {
    return Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60)); // minutes
  }

  private getSeason(date: Date): string {
    const month = new Date(date).getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private calculateQualityScore(tasks: any[]): number {
    const ratings = tasks.filter(t => t.qualityRating).map(t => t.qualityRating);
    if (ratings.length === 0) return 3;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }

  private identifyPreferredTasks(tasks: any[]): string[] {
    const typeCounts: { [key: string]: number } = {};
    tasks.forEach(task => {
      const type = task.type || 'general';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    return Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type);
  }

  private getWorkerAvailability(worker: any): { [day: string]: boolean } {
    // Default: available all weekdays
    return {
      Monday: true,
      Tuesday: true,
      Wednesday: true,
      Thursday: true,
      Friday: true,
      Saturday: worker.worksWeekends || false,
      Sunday: worker.worksWeekends || false
    };
  }
}

export const aiEngine = new AITaskRecommendationEngine();
export default aiEngine;
