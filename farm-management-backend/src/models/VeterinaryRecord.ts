import mongoose, { Document, Schema } from 'mongoose';

export interface IVeterinaryRecord extends Document {
  farm: mongoose.Types.ObjectId;
  animal: mongoose.Types.ObjectId;
  veterinarian: {
    name: string;
    clinic: string;
    phone: string;
    email?: string;
    licenseNumber?: string;
  };
  appointment: {
    scheduledDate: Date;
    actualDate?: Date;
    duration?: number; // in minutes
    type: 'routine_checkup' | 'emergency' | 'vaccination' | 'surgery' | 'dental' | 'reproduction' | 'other';
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  };
  examination: {
    weight?: number;
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
    bodyConditionScore?: number; // 1-5 scale
    generalCondition: string;
    findings: string[];
  };
  treatment: {
    diagnosis: string[];
    prescriptions: [{
      medication: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }];
    procedures: [{
      name: string;
      description: string;
      duration?: number;
    }];
    followUpRequired: boolean;
    followUpDate?: Date;
    restrictions?: string[];
  };
  costs: {
    consultationFee: number;
    medicationCost: number;
    procedureCost: number;
    additionalCharges: number;
    totalCost: number;
    paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'overdue';
    paymentDate?: Date;
  };
  documents: [{
    type: 'prescription' | 'lab_report' | 'xray' | 'certificate' | 'other';
    name: string;
    url: string;
    uploadDate: Date;
  }];
  notes: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const veterinaryRecordSchema = new Schema<IVeterinaryRecord>({
  farm: {
    type: Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  animal: {
    type: Schema.Types.ObjectId,
    ref: 'Animal',
    required: true,
  },
  veterinarian: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    clinic: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
  },
  appointment: {
    scheduledDate: {
      type: Date,
      required: true,
    },
    actualDate: {
      type: Date,
    },
    duration: {
      type: Number,
      min: 0,
    },
    type: {
      type: String,
      enum: ['routine_checkup', 'emergency', 'vaccination', 'surgery', 'dental', 'reproduction', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled',
    },
  },
  examination: {
    weight: {
      type: Number,
      min: 0,
    },
    temperature: {
      type: Number,
      min: 0,
    },
    heartRate: {
      type: Number,
      min: 0,
    },
    respiratoryRate: {
      type: Number,
      min: 0,
    },
    bodyConditionScore: {
      type: Number,
      min: 1,
      max: 5,
    },
    generalCondition: {
      type: String,
      default: '',
    },
    findings: [{
      type: String,
    }],
  },
  treatment: {
    diagnosis: [{
      type: String,
    }],
    prescriptions: [{
      medication: {
        type: String,
        required: true,
      },
      dosage: {
        type: String,
        required: true,
      },
      frequency: {
        type: String,
        required: true,
      },
      duration: {
        type: String,
        required: true,
      },
      instructions: {
        type: String,
      },
    }],
    procedures: [{
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      duration: {
        type: Number,
        min: 0,
      },
    }],
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
    },
    restrictions: [{
      type: String,
    }],
  },
  costs: {
    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    medicationCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    procedureCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    additionalCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partially_paid', 'overdue'],
      default: 'pending',
    },
    paymentDate: {
      type: Date,
    },
  },
  documents: [{
    type: {
      type: String,
      enum: ['prescription', 'lab_report', 'xray', 'certificate', 'other'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  }],
  notes: {
    type: String,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes
veterinaryRecordSchema.index({ farm: 1 });
veterinaryRecordSchema.index({ animal: 1 });
veterinaryRecordSchema.index({ 'appointment.scheduledDate': 1 });
veterinaryRecordSchema.index({ 'appointment.status': 1 });
veterinaryRecordSchema.index({ 'treatment.followUpDate': 1 });
veterinaryRecordSchema.index({ 'costs.paymentStatus': 1 });

// Pre-save middleware to calculate total cost
veterinaryRecordSchema.pre('save', function(this: IVeterinaryRecord) {
  this.costs.totalCost = 
    this.costs.consultationFee + 
    this.costs.medicationCost + 
    this.costs.procedureCost + 
    this.costs.additionalCharges;
});

// Methods
veterinaryRecordSchema.methods.markAsCompleted = function(this: IVeterinaryRecord, actualDate?: Date) {
  this.appointment.status = 'completed';
  this.appointment.actualDate = actualDate || new Date();
  return this.save();
};

veterinaryRecordSchema.methods.markAsPaid = function(this: IVeterinaryRecord, paymentDate?: Date) {
  this.costs.paymentStatus = 'paid';
  this.costs.paymentDate = paymentDate || new Date();
  return this.save();
};

veterinaryRecordSchema.methods.addDocument = function(this: IVeterinaryRecord, document: any) {
  this.documents.push(document);
  return this.save();
};

export const VeterinaryRecord = mongoose.model<IVeterinaryRecord>('VeterinaryRecord', veterinaryRecordSchema);