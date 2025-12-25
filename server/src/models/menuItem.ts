import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  description: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages';
  price: number;
  image: string;
  available: boolean;
  isSpecial: boolean;
  originalPrice?: number;
  discountPercentage?: number;
  specialBadge?: 'hot' | 'limited' | 'new' | 'bestseller' | 'combo';
  specialDescription?: string;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['breakfast', 'lunch', 'dinner', 'snacks', 'beverages'],
        message: '{VALUE} is not a valid category',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    available: {
      type: Boolean,
      default: true,
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
    },
    discountPercentage: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    specialBadge: {
      type: String,
      enum: {
        values: ['hot', 'limited', 'new', 'bestseller', 'combo'],
        message: '{VALUE} is not a valid special badge',
      },
    },
    specialDescription: {
      type: String,
      trim: true,
      maxlength: [200, 'Special description cannot exceed 200 characters'],
    },
    validUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

MenuItemSchema.index({ category: 1, available: 1 });
MenuItemSchema.index({ isSpecial: 1, validUntil: 1 });
MenuItemSchema.index({ name: 'text', description: 'text' });

const MenuItem = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

export default MenuItem;