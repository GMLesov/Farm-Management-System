import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryItem extends Document {
  name: string;
  category: 'feed' | 'seed' | 'fertilizer' | 'pesticide' | 'tools' | 'equipment' | 'supplies' | 'other';
  quantity: number;
  unit: string;
  minimumStock: number;
  location?: string;
  supplier?: string;
  unitPrice?: number;
  totalValue?: number;
  purchaseDate?: Date;
  expiryDate?: Date;
  notes?: string;
  transactions: Array<{
    date: Date;
    type: 'purchase' | 'usage' | 'adjustment' | 'waste';
    quantity: number;
    reason?: string;
    performedBy?: mongoose.Types.ObjectId;
  }>;
}

const InventoryItemSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide item name']
  },
  category: {
    type: String,
    required: [true, 'Please specify category'],
    enum: ['feed', 'seed', 'fertilizer', 'pesticide', 'tools', 'equipment', 'supplies', 'other']
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Please specify unit']
  },
  minimumStock: {
    type: Number,
    required: true,
    default: 0
  },
  location: {
    type: String
  },
  supplier: {
    type: String
  },
  unitPrice: {
    type: Number
  },
  totalValue: {
    type: Number
  },
  purchaseDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  notes: {
    type: String
  },
  transactions: [{
    date: { type: Date, required: true, default: Date.now },
    type: {
      type: String,
      required: true,
      enum: ['purchase', 'usage', 'adjustment', 'waste']
    },
    quantity: { type: Number, required: true },
    reason: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }]
}, {
  timestamps: true
});

// Update totalValue whenever unitPrice or quantity changes
InventoryItemSchema.pre('save', function(next) {
  if (this.unitPrice && this.quantity) {
    this.totalValue = (this.unitPrice as number) * (this.quantity as number);
  }
  next();
});

export default mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);
