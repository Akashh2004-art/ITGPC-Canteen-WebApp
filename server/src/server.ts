import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import menuRoutes from './routes/menu.routes';
import orderRoutes from './routes/order.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:8080',
    'http://localhost:5173' // Frontend user app
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/upload', express.static(path.join(__dirname, '../upload')));

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);  // Admin routes
app.use('/api/auth', userRoutes);  // User (Faculty) routes
app.use('/api/menu', menuRoutes);  // Menu management routes
app.use('/api/orders', orderRoutes);  // Order management routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Admin Panel: http://localhost:8080`);
  console.log(`🔗 User App: http://localhost:5173`);
  console.log(`📁 Static files: http://localhost:${PORT}/upload`);
});