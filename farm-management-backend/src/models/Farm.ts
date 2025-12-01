import mongoose, { Document, Schema } from 'mongoose';

export interface IFarm extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  managers: mongoose.Types.ObjectId[];
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  };
  size: number; // in hectares
  soilType: string;
  climateZone: string;
  crops: mongoose.Types.ObjectId[];
  irrigationSystems: mongoose.Types.ObjectId[];
  equipment: {
    name: string;
    type: string;
    model: string;
    purchaseDate: Date;
    status: 'active' | 'maintenance' | 'inactive';
    lastMaintenance?: Date;
    nextMaintenance?: Date;
  }[];
  subscription: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    features: string[];
    maxCrops: number;
    maxUsers: number;
  };
  settings: {
    weatherAlerts: boolean;
    autoIrrigation: boolean;
    pestMonitoring: boolean;
    financialTracking: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const farmSchema = new Schema<IFarm>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  managers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  location: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  size: {
    type: Number,
    required: true,
    min: 0,
  },
  soilType: {
    type: String,
    required: true,
  },
  climateZone: {
    type: String,
    required: true,
  },
  crops: [{
    type: Schema.Types.ObjectId,
    ref: 'Crop',
  }],
  irrigationSystems: [{
    type: Schema.Types.ObjectId,
    ref: 'IrrigationSystem',
  }],
  equipment: [{
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    model: {
      type: String,
    },
    purchaseDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'inactive'],
      default: 'active',
    },
    lastMaintenance: {
      type: Date,
    },
    nextMaintenance: {
      type: Date,
    },
  }],
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free',
    },
    features: [{
      type: String,
    }],
    maxCrops: {
      type: Number,
      default: 5,
    },
    maxUsers: {
      type: Number,
      default: 1,
    },
  },
  settings: {
    weatherAlerts: {
      type: Boolean,
      default: true,
    },
    autoIrrigation: {
      type: Boolean,
      default: false,
    },
    pestMonitoring: {
      type: Boolean,
      default: true,
    },
    financialTracking: {
      type: Boolean,
      default: true,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      (ret as any).id = (ret as any)._id;
      delete (ret as any)._id;
      if ((ret as any).__v !== undefined) delete (ret as any).__v;
      return ret;
    },
  },
});

// Indexes
farmSchema.index({ owner: 1 });
farmSchema.index({ managers: 1 });
farmSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
farmSchema.index({ createdAt: -1 });

// Methods
farmSchema.methods.addManager = function(this: IFarm, userId: mongoose.Types.ObjectId) {
  if (!this.managers.includes(userId)) {
    this.managers.push(userId);
  }
  return this.save();
};

farmSchema.methods.removeManager = function(this: IFarm, userId: mongoose.Types.ObjectId) {
  this.managers = this.managers.filter((manager: mongoose.Types.ObjectId) => !manager.equals(userId));
  return this.save();
};

farmSchema.methods.addCrop = function(this: IFarm, cropId: mongoose.Types.ObjectId) {
  if (!this.crops.includes(cropId)) {
    this.crops.push(cropId);
  }
  return this.save();
};

farmSchema.methods.removeCrop = function(this: IFarm, cropId: mongoose.Types.ObjectId) {
  this.crops = this.crops.filter((crop: mongoose.Types.ObjectId) => !crop.equals(cropId));
  return this.save();
};

export const Farm = mongoose.model<IFarm>('Farm', farmSchema);