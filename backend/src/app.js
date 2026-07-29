import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { AppError } from './utils/appError.js';
import authRouter from './modules/auth/auth.routes.js';
import itineraryRouter from './modules/itinerary/itinerary.routes.js';
import aiRouter from './modules/ai/ai.routes.js';
import tripRouter from '../routes/trip.routes.js';
import adminRouter from './modules/admin/admin.routes.js';
import expenseRouter from './modules/expenses/expense.routes.js';
import noteRouter from './modules/notes/note.routes.js';
import goalRouter from './modules/goals/goal.routes.js';
import notificationRouter from './modules/notifications/notification.routes.js';
import communityRouter from './modules/community/community.routes.js';

const app = express();

app.use(helmet());

// CORS configuration supporting cookies
app.use(cors({
  origin: true, // Allow all origins during local dev, supporting credentialed cookies
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again after 15 minutes.',
      code: 'TOO_MANY_REQUESTS',
    },
  },
});

app.use('/api/', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Modular & Legacy Routes
app.use('/api/auth', authRouter);
app.use('/api/itinerary', itineraryRouter);
app.use('/api/ai', aiRouter);
app.use('/api/trips', tripRouter);
app.use('/api/admin', adminRouter);
app.use('/api/expenses', expenseRouter);
app.use('/api/notes', noteRouter);
app.use('/api/goals', goalRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/community', communityRouter);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running healthy.',
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(errorHandler);

export default app;
export { app };
