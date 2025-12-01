import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  username?: string;
  role: 'admin' | 'worker';
  name: string;
  phone?: string;
  avatar?: string;
  farmId?: mongoose.Types.ObjectId;
  currentFarm?: mongoose.Types.ObjectId;
  farms: mongoose.Types.ObjectId[];
  isActive: boolean;
  lastLogin?: Date;
  lastLocation?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: function(this: IUser) { return this.role === 'admin'; },
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: function(this: IUser) { return this.role === 'worker'; },
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'worker'],
    required: true,
    default: 'worker'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  farmId: {
    type: Schema.Types.ObjectId,
    ref: 'Farm'
  },
  currentFarm: {
    type: Schema.Types.ObjectId,
    ref: 'Farm'
  },
  farms: [{
    type: Schema.Types.ObjectId,
    ref: 'Farm'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  lastLocation: {
    latitude: Number,
    longitude: Number,
    timestamp: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password as string);
};

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;
