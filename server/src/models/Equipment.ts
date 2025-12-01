import mongoose, { Document, Schema } from 'mongoose';

export interface IEquipment extends Document {
  farm: mongoose.Types.ObjectId;
  name: string;
  type: 'tractor' | 'harvester' | 'planter' | 'sprayer' | 'vehicle' | 'tool' | 'other';
  brand?: string;
  modelName?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  currentValue?: number;
  status: 'operational' | 'maintenance' | 'repair' | 'retired';
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  maintenanceInterval?: number; // days
  hoursUsed?: number;
  fuelType?: string;
  location?: string;
  assignedTo?: mongoose.Types.ObjectId;
  notes?: string;
  maintenanceHistory: Array<{
    date: Date;
    type: string;
    description: string;
    cost?: number;
    performedBy?: string;
    nextDue?: Date;
  }>;
  photos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentSchema: Schema = new Schema({
  farm: {
    type: Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide equipment name'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please specify equipment type'],
    enum: ['tractor', 'harvester', 'planter', 'sprayer', 'vehicle', 'tool', 'other']
  },
  brand: {
    type: String,
    trim: true
  },
  modelName: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  purchaseDate: {
    type: Date
  },
  purchasePrice: {
    type: Number,
    min: 0
  },
  currentValue: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['operational', 'maintenance', 'repair', 'retired'],
    default: 'operational'
  },
  lastMaintenanceDate: {
    type: Date
  },
  nextMaintenanceDate: {
    type: Date
  },
  maintenanceInterval: {
    type: Number,
    min: 1
  },
  hoursUsed: {
    type: Number,
    min: 0,
    default: 0
  },
  fuelType: {
    type: String
  },
  location: {
    type: String
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  },
  maintenanceHistory: [{
    date: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    cost: {
      type: Number,
      min: 0
    },
    performedBy: {
      type: String
    },
    nextDue: {
      type: Date
    }
  }],
  photos: [{
    type: String
  }]
}, {
  timestamps: true
});

// Indexes
EquipmentSchema.index({ farm: 1 });
EquipmentSchema.index({ status: 1 });
EquipmentSchema.index({ type: 1 });
EquipmentSchema.index({ nextMaintenanceDate: 1 });

export const Equipment = mongoose.model<IEquipment>('Equipment', EquipmentSchema);
