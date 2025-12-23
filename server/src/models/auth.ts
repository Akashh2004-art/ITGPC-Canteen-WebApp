import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
  fullName: string;
  phone?: string;
  email?: string;
  password?: string;
  googleId?: string;
  authProvider: 'phone' | 'google';
  role: 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema = new Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  phone: {
    type: String,
    sparse: true,
    unique: true,
    match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
  },
  email: {
    type: String,
    sparse: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    select: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  authProvider: {
    type: String,
    enum: ['phone', 'google'],
    required: true,
    default: 'phone'
  },
  role: {
    type: String,
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'admin'
});


const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;