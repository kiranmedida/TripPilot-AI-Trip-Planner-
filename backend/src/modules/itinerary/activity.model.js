import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    dayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TripDay',
      required: true,
      index: true,
    },
    timeOfDay: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening'],
      required: true,
    },
    activity: {
      type: String,
      required: true,
    },
    foodRecommendation: {
      type: String,
    },
    transportation: {
      type: String,
    },
    budgetEstimate: {
      type: String,
      default: '$0',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
