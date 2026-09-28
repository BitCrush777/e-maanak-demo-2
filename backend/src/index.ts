import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

// Routes
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import instrumentRoutes from './routes/instruments';
import applicationRoutes from './routes/applications';
import verificationRoutes from './routes/verifications';
import certificateRoutes from './routes/certificates';
import publicRoutes from './routes/public';

// Middleware
import { apiLimiter, errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting
app.use('/api', apiLimiter);

// Health check (public)
app.use('/api/v1/health', healthRoutes);

// Public routes
app.use('/api/v1/public', publicRoutes);

// Auth routes
app.use('/api/v1/auth', authRoutes);

// Protected routes
app.use('/api/v1/instruments', instrumentRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/verifications', verificationRoutes);
app.use('/api/v1/certificates', certificateRoutes);

// OpenAPI documentation
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'e-Maanak API',
    version: '1.0.0',
    description: 'SIH 2026 Prototype - Legal Metrology Verification Platform',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Development server',
    },
  ],
  paths: {},
};

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get('/api/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 e-Maanak API running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/v1/health`);
});

export default app;
