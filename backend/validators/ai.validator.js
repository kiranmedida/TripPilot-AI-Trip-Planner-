import { z } from 'zod';
import mongoose from 'mongoose';

export const generateSchema = z.object({
  body: z.object({
    destination: z.string().min(2, 'Destination must be at least 2 characters long').max(100),
    budget: z.string().min(2, 'Budget is required').max(50),
    days: z.number().int().min(1, 'Trip must be at least 1 day').max(30, 'Trip cannot exceed 30 days'),
    travelStyle: z.string().min(2, 'Travel Style is required').max(50),
    tripTemplate: z.enum(['Beach Vacation', 'Adventure Trip', 'Family Vacation', 'Food Exploration', 'Business Travel', 'Backpacking'], {
      errorMap: () => ({ message: 'Invalid Trip Template selected.' }),
    }),
  }),
});

export const regenerateSchema = z.object({
  body: z.object({
    tripId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'Invalid tripId format',
    }),
    instruction: z.string().min(3, 'Instruction must be at least 3 characters long').max(500),
  }),
});
