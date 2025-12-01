import mongoose, { Document, Schema } from 'mongoose';
import { NotificationType, NotificationChannel } from './Notification';

export interface IChannelPreference {
  enabled: boolean;
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string;   // HH:MM format
  maxPerDay?: number;
}

export interface ITypePreference {
  enabled: boolean;
  channels: NotificationChannel[];
  minPriority?: 'critical' | 'high' | 'medium' | 'low';
}

export interface INotificationPreference extends Document {
  userId: mongoose.Types.ObjectId;
  farmId?: mongoose.Types.ObjectId;
  globalEnabled: boolean;
  channels: {
    email: IChannelPreference;
    push: IChannelPreference;
    sms: IChannelPreference;
    inApp: IChannelPreference;
  };
  types: {
    [K in NotificationType]: ITypePreference;
  };
  digestSettings: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
    preferredTime?: string; // HH:MM format
    includeTypes: NotificationType[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const channelPreferenceSchema = new Schema<IChannelPreference>(
  {
    enabled: {
      type: Boolean,
      default: true,
    },
    quietHoursStart: String,
    quietHoursEnd: String,
    maxPerDay: Number,
  },
  { _id: false }
);

const typePreferenceSchema = new Schema<ITypePreference>(
  {
    enabled: {
      type: Boolean,
      default: true,
    },
    channels: [
      {
        type: String,
        enum: ['email', 'push', 'sms', 'in-app'],
      },
    ],
    minPriority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
    },
  },
  { _id: false }
);

const notificationPreferenceSchema = new Schema<INotificationPreference>(
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
    globalEnabled: {
      type: Boolean,
      default: true,
    },
    channels: {
      email: {
        type: channelPreferenceSchema,
        default: () => ({ enabled: true }),
      },
      push: {
        type: channelPreferenceSchema,
        default: () => ({ enabled: true }),
      },
      sms: {
        type: channelPreferenceSchema,
        default: () => ({ enabled: false }),
      },
      inApp: {
        type: channelPreferenceSchema,
        default: () => ({ enabled: true }),
      },
    },
    types: {
      alert: {
        type: typePreferenceSchema,
        default: () => ({
          enabled: true,
          channels: ['email', 'push', 'in-app'],
          minPriority: 'high',
        }),
      },
      reminder: {
        type: typePreferenceSchema,
        default: () => ({
          enabled: true,
          channels: ['push', 'in-app'],
        }),
      },
      warning: {
        type: typePreferenceSchema,
        default: () => ({
          enabled: true,
          channels: ['email', 'push', 'in-app'],
          minPriority: 'medium',
        }),
      },
      info: {
        type: typePreferenceSchema,
        default: () => ({
          enabled: true,
          channels: ['in-app'],
        }),
      },
      success: {
        type: typePreferenceSchema,
        default: () => ({
          enabled: true,
          channels: ['in-app'],
        }),
      },
      weather: {
        type: typePreferenceSchema,
        default: () => ({
          enabled: true,
          channels: ['push', 'in-app'],
          minPriority: 'medium',
        }),
      },
      livestock: {
        type: typePreferenceSchema,
        default: () => ({
          enabled: true,
          channels: ['email', 'push', 'in-app'],
          minPriority: 'high',
        }),
      },
      crop: {
        type: typePreferenceSchema,
        default: () => ({
          enabled: true,
          channels: ['push', 'in-app'],
        }),
      },
      equipment: {
        type: typePreferenceSchema,
        default: () => ({
          enabled: true,
          channels: ['push', 'in-app'],
        }),
      },
      financial: {
        type: typePreferenceSchema,
        default: () => ({
          enabled: true,
          channels: ['email', 'in-app'],
        }),
      },
      irrigation: {
        type: typePreferenceSchema,
        default: () => ({
          enabled: true,
          channels: ['push', 'in-app'],
          minPriority: 'medium',
        }),
      },
    },
    digestSettings: {
      enabled: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly'],
        default: 'daily',
      },
      preferredTime: String,
      includeTypes: [
        {
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
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick lookups
notificationPreferenceSchema.index({ userId: 1, farmId: 1 }, { unique: true });

export const NotificationPreference = mongoose.model<INotificationPreference>(
  'NotificationPreference',
  notificationPreferenceSchema
);
