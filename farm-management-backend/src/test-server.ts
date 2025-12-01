import express from 'express';
import cors from 'cors';
import notificationRoutes from './routes/notifications';

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📚 Health check available at http://localhost:${PORT}/health`);
});

export default app;