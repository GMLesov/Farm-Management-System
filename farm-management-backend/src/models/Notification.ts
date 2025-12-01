import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 
  | 'alert'           // Critical alerts requiring immediate attention
  | 'reminder'        // Task and event reminders
  | 'warning'         // Important warnings
  | 'info'            // General information
  | 'success'         // Success confirmations
  | 'weather'         // Weather-related notifications
  | 'livestock'       // Animal health/breeding alerts
  | 'crop'            // Crop health/harvest alerts
  | 'equipment'       // Equipment maintenance alerts
  | 'financial'       // Financial alerts
  | 'irrigation';     // Irrigation system alerts

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export type NotificationChannel = 'email' | 'push' | 'sms' | 'in-app';

export type NotificationStatus = 'pending' | 'sent' | 'read' | 'archived' | 'failed';

export interface INotificationAction {
  label: string;
  type: 'link' | 'action';
  url?: string;
  actionId?: string;
  params?: Record<string, any>;
}

export interface INotificationData {
  entityType?: string;        // e.g., 'animal', 'crop', 'equipment'
  entityId?: mongoose.Types.ObjectId;
  entityName?: string;
  value?: number;
  threshold?: number;
  location?: string;
  customData?: Record<string, any>;
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  farmId?: mongoose.Types.ObjectId;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  status: NotificationStatus;
  readAt?: Date;
  archivedAt?: Date;
  channels: NotificationChannel[];
  deliveryStatus: {
    email?: 'pending' | 'sent' | 'failed';
    push?: 'pending' | 'sent' | 'failed';
    sms?: 'pending' | 'sent' | 'failed';
    inApp?: 'pending' | 'sent' | 'failed';
  };
  scheduledFor?: Date;
  expiresAt?: Date;
  actions?: INotificationAction[];
  data?: INotificationData;
  metadata?: {
    triggeredBy?: string;
    triggerCondition?: string;
    relatedNotifications?: mongoose.Types.ObjectId[];
    tags?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    farmId: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      index: true,
    },
    type: {
      type: String,
      enum: [
        'alert',
        'reminder',
        'warning',
        'info',
        'success',
        'weather',
        'livestock',
        'crop',
        'equipment',
        'financial',
        'irrigation',
      ],
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'read', 'archived', 'failed'],
      default: 'pending',
      index: true,
    },
    readAt: {
      type: Date,
    },
    archivedAt: {
      type: Date,
    },
    channels: [
      {
        type: String,
        enum: ['email', 'push', 'sms', 'in-app'],
      },
    ],
    deliveryStatus: {
      email: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
      },
      push: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
      },
      sms: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
      },
      inApp: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
      },
    },
    scheduledFor: {
      type: Date,
      index: true,
    },
    expiresAt: {
      type: Date,
    },
    actions: [
      {
        label: String,
        type: {
          type: String,
          enum: ['link', 'action'],
        },
        url: String,
        actionId: String,
        params: Schema.Types.Mixed,
      },
    ],
    data: {
      entityType: String,
      entityId: Schema.Types.ObjectId,
      entityName: String,
      value: Number,
      threshold: Number,
      location: String,
      customData: Schema.Types.Mixed,
    },
    metadata: {
      triggeredBy: String,
      triggerCondition: String,
      relatedNotifications: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Notification',
        },
      ],
      tags: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
notificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, readAt: 1 });
notificationSchema.index({ farmId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, status: 1 });
notificationSchema.index({ expiresAt: 1 });

// Auto-archive expired notifications
notificationSchema.pre('save', function (next) {
  if (this.expiresAt && this.expiresAt < new Date() && this.status !== 'archived') {
    this.status = 'archived';
    this.archivedAt = new Date();
  }
  next();
});

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
