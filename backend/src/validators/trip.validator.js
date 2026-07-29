import { z } from 'zod';

const activitySchema = z.object({
  activity: z.string().min(1, 'Activity description is required'),
  foodRecommendation: z.string().optional(),
  transportation: z.string().optional(),
  budgetEstimate: z.string().optional()
});

export const createTripSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Trip title must be at least 2 characters long').max(100),
    destination: z.string().min(2, 'Destination must be at least 2 characters long').max(100),
    budget: z.string().min(1, 'Budget is required'),
    days: z.number().int().min(1),
    travelStyle: z.string().min(1, 'Travel Style is required'),
    tripTemplate: z.string().min(1, 'Trip Template is required'),
    itinerary: z.array(z.object({
      day: z.number().int().min(1),
      morning: activitySchema.optional(),
      afternoon: activitySchema.optional(),
      evening: activitySchema.optional()
    })).min(1, 'Itinerary must contain at least one day'),
    packingList: z.array(z.union([z.string(), z.object({ item: z.string(), packed: z.boolean() })])).optional(),
    travelTips: z.array(z.string()).optional()
  })
});

export const updateTripSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Trip title must be at least 2 characters long').max(100).optional(),
    isPublic: z.boolean().optional(),
    packingList: z.array(z.object({
      _id: z.string().optional(),
      item: z.string(),
      packed: z.boolean()
    })).optional()
  })
});
