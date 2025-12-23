import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  description: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages';
  price: number;
  image: string;
  available: boolean;
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
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
MenuItemSchema.index({ category: 1, available: 1 });
MenuItemSchema.index({ name: 'text', description: 'text' }); // Text search

const MenuItem = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

export default MenuItem;