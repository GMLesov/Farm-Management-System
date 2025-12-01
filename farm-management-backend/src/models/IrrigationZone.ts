import mongoose, { Schema, Document } from 'mongoose';

export interface IIrrigationZone extends Document {
  farmId: mongoose.Types.ObjectId;
  name: string;
  area: number;
  cropType: string;
  status: 'active' | 'inactive' | 'scheduled' | 'maintenance' | 'error';
  soilMoisture: number;
  temperature: number;
  humidity: number;
  lastWatered: Date;
  nextScheduled: Date;
  waterUsage: number;
  flowRate: number;
  pressure: number;
  valveStatus: 'open' | 'closed' | 'partial';
  sensorBattery: number;
  schedule: Array<{
    id: string;
    name: string;
    startTime: string;
    duration: number;
    frequency: 'daily' | 'weekly' | 'bi-weekly' | 'custom';
    daysOfWeek: number[];
    enabled: boolean;
    conditions: {
      minMoisture?: number;
      maxMoisture?: number;
      minTemperature?: number;
      maxTemperature?: number;
      weatherCondition?: string;
    };
  }>;
  recommendations: string[];
  efficiency: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const IrrigationZoneSchema = new Schema<IIrrigationZone>(
  {
    farmId: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Farm ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Zone name is required'],
      trim: true,
      maxlength: [100, 'Zone name cannot exceed 100 characters'],
    },
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [0.01, 'Area must be greater than 0'],
    },
    cropType: {
      type: String,
      required: [true, 'Crop type is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'scheduled', 'maintenance', 'error'],
        message: '{VALUE} is not a valid status',
      },
      default: 'inactive',
    },
    soilMoisture: {
      type: Number,
      required: [true, 'Soil moisture is required'],
      min: [0, 'Soil moisture cannot be negative'],
      max: [100, 'Soil moisture cannot exceed 100%'],
    },
    temperature: {
      type: Number,
      default: 20,
    },
    humidity: {
      type: Number,
      default: 50,
      min: [0, 'Humidity cannot be negative'],
      max: [100, 'Humidity cannot exceed 100%'],
    },
    lastWatered: {
      type: Date,
      default: Date.now,
    },
    nextScheduled: {
      type: Date,
      required: [true, 'Next scheduled time is required'],
    },
    waterUsage: {
      type: Number,
      default: 0,
      min: [0, 'Water usage cannot be negative'],
    },
    flowRate: {
      type: Number,
      required: [true, 'Flow rate is required'],
      min: [0.1, 'Flow rate must be greater than 0'],
    },
    pressure: {
      type: Number,
      default: 40,
      min: [0, 'Pressure cannot be negative'],
    },
    valveStatus: {
      type: String,
      enum: {
        values: ['open', 'closed', 'partial'],
        message: '{VALUE} is not a valid valve status',
      },
      default: 'closed',
    },
    sensorBattery: {
      type: Number,
      default: 100,
      min: [0, 'Battery level cannot be negative'],
      max: [100, 'Battery level cannot exceed 100%'],
    },
    schedule: [Schema.Types.Mixed],
    recommendations: {
      type: [String],
      default: [],
    },
    efficiency: {
      type: Number,
      default: 85,
      min: [0, 'Efficiency cannot be negative'],
      max: [100, 'Efficiency cannot exceed 100%'],
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
IrrigationZoneSchema.index({ farmId: 1, status: 1 });
IrrigationZoneSchema.index({ farmId: 1, soilMoisture: 1 });
IrrigationZoneSchema.index({ nextScheduled: 1 });
IrrigationZoneSchema.index({ createdAt: -1 });

// Virtual for moisture status
IrrigationZoneSchema.virtual('moistureStatus').get(function(this: IIrrigationZone) {
  if (this.soilMoisture < 30) return 'low';
  if (this.soilMoisture < 60) return 'medium';
  return 'high';
});

// Virtual for battery status
IrrigationZoneSchema.virtual('batteryStatus').get(function(this: IIrrigationZone) {
  if (this.sensorBattery < 20) return 'critical';
  if (this.sensorBattery < 50) return 'low';
  return 'good';
});

export const IrrigationZone = mongoose.model<IIrrigationZone>('IrrigationZone', IrrigationZoneSchema);
export default IrrigationZone;
