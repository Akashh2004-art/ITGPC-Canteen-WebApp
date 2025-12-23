import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  phone?: string;
  email?: string;
  password?: string;
  googleId?: string;
  authProvider: 'phone' | 'google';
  role: 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    phone: {
      type: String,
      sparse: true,
      unique: true,
      validate: {
        validator: function(v: string) {
          return !v || /^\d{10}$/.test(v);
        },
        message: 'Please provide a valid 10-digit phone number'
      }
    },
    email: {
      type: String,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: 'Please provide a valid email address'
      }
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters long']
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true
    },
    authProvider: {
      type: String,
      enum: ['phone', 'google'],
      required: true
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

const User = mongoose.model<IUser>('User', userSchema);

export default User;