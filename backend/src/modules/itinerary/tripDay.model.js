import mongoose from 'mongoose';

const tripDaySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    dayNumber: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
    },
    weatherSummary: {
      temperature: { type: String },
      rainChance: { type: String },
      humidity: { type: String },
      wind: { type: String },
      sunrise: { type: String },
      sunset: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure index on tripId + dayNumber for fast unique queries
tripDaySchema.index({ tripId: 1, dayNumber: 1 }, { unique: true });

export const TripDay = mongoose.model('TripDay', tripDaySchema);
export default TripDay;
