import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'admin' | 'farmer' | 'supervisor';
  isVerified: boolean;
  firebaseUid?: string;
  profileImage?: string;
  lastLogin?: Date;
  invitedAt?: Date;
  invitedBy?: mongoose.Types.ObjectId;
  inviteToken?: string;
  currentFarm?: mongoose.Types.ObjectId;
  farms: mongoose.Types.ObjectId[];
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    units: {
      temperature: 'celsius' | 'fahrenheit';
      measurement: 'metric' | 'imperial';
    };
  };
  subscription: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled';
    expiresAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  // Instance methods
  addFarm(farmId: mongoose.Types.ObjectId): Promise<IUser>;
  removeFarm(farmId: mongoose.Types.ObjectId): Promise<IUser>;
  switchCurrentFarm(farmId: mongoose.Types.ObjectId): Promise<IUser>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    select: false, // Don't include password by default in queries
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'farmer', 'supervisor'],
    default: 'farmer',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
  },
  profileImage: {
    type: String,
  },
  lastLogin: {
    type: Date,
  },
  invitedAt: {
    type: Date,
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  inviteToken: {
    type: String,
    select: false, // do not expose invite tokens by default
  },
  currentFarm: {
    type: Schema.Types.ObjectId,
    ref: 'Farm',
  },
  farms: [{
    type: Schema.Types.ObjectId,
    ref: 'Farm',
  }],
  preferences: {
    language: {
      type: String,
      default: 'en',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
    },
    units: {
      temperature: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius',
      },
      measurement: {
        type: String,
        enum: ['metric', 'imperial'],
        default: 'metric',
      },
    },
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'active',
    },
    expiresAt: {
      type: Date,
    },
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      (ret as any).id = (ret as any)._id;
      delete (ret as any)._id;
      if ((ret as any).__v !== undefined) delete (ret as any).__v;
      if ((ret as any).password) delete (ret as any).password;
      return ret;
    },
  },
});

// Indexes (avoid duplicating indexes created by unique field options)
userSchema.index({ farms: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Methods
userSchema.methods.addFarm = function(this: IUser, farmId: mongoose.Types.ObjectId) {
  if (!this.farms.includes(farmId)) {
    this.farms.push(farmId);
    if (!this.currentFarm) {
      this.currentFarm = farmId;
    }
  }
  return this.save();
};

userSchema.methods.removeFarm = function(this: IUser, farmId: mongoose.Types.ObjectId) {
  this.farms = this.farms.filter((farm: mongoose.Types.ObjectId) => !farm.equals(farmId));
  if (this.currentFarm && this.currentFarm.equals(farmId)) {
    this.currentFarm = this.farms.length > 0 ? this.farms[0] : undefined as any;
  }
  return this.save();
};

userSchema.methods.switchCurrentFarm = function(this: IUser, farmId: mongoose.Types.ObjectId) {
  const isMember = this.farms.some((farm: mongoose.Types.ObjectId) => farm.equals(farmId));
  if (!isMember) {
    throw new Error('User is not associated with this farm');
  }
  this.currentFarm = farmId;
  return this.save();
};

export const User = mongoose.model<IUser>('User', userSchema);