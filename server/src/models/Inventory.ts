import mongoose, { Document, Schema } from 'mongoose';

export interface IInventory extends Document {
  farm: mongoose.Types.ObjectId;
  itemName: string;
  category: 'feed' | 'seed' | 'fertilizer' | 'pesticide' | 'medicine' | 'equipment' | 'supplies' | 'other';
  quantity: number;
  unit: string;
  minimumStock?: number;
  reorderPoint?: number;
  supplier?: string;
  costPerUnit?: number;
  totalValue?: number;
  location?: string;
  batchNumber?: string;
  expiryDate?: Date;
  lastRestocked?: Date;
  notes?: string;
  transactions: Array<{
    date: Date;
    type: 'purchase' | 'usage' | 'adjustment' | 'waste';
    quantity: number;
    reason?: string;
    performedBy?: mongoose.Types.ObjectId;
    cost?: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema: Schema = new Schema({
  farm: {
    type: Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  itemName: {
    type: String,
    required: [true, 'Please provide item name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please specify category'],
    enum: ['feed', 'seed', 'fertilizer', 'pesticide', 'medicine', 'equipment', 'supplies', 'other']
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: 0
  },
  unit: {
    type: String,
    required: [true, 'Please specify unit'],
    trim: true
  },
  minimumStock: {
    type: Number,
    min: 0
  },
  reorderPoint: {
    type: Number,
    min: 0
  },
  supplier: {
    type: String,
    trim: true
  },
  costPerUnit: {
    type: Number,
    min: 0
  },
  totalValue: {
    type: Number,
    min: 0
  },
  location: {
    type: String,
    trim: true
  },
  batchNumber: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  lastRestocked: {
    type: Date
  },
  notes: {
    type: String
  },
  transactions: [{
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    type: {
      type: String,
      required: true,
      enum: ['purchase', 'usage', 'adjustment', 'waste']
    },
    quantity: {
      type: Number,
      required: true
    },
    reason: {
      type: String
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    cost: {
      type: Number,
      min: 0
    }
  }]
}, {
  timestamps: true
});

// Indexes
InventorySchema.index({ farm: 1 });
InventorySchema.index({ category: 1 });
InventorySchema.index({ quantity: 1 });
InventorySchema.index({ expiryDate: 1 });

// Calculate total value before saving
InventorySchema.pre<IInventory>('save', function(next) {
  if (this.costPerUnit && this.quantity) {
    this.totalValue = this.costPerUnit * this.quantity;
  }
  next();
});

export const Inventory = mongoose.model<IInventory>('Inventory', InventorySchema);
