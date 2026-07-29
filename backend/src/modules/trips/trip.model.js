import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a trip title'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Please provide a destination'],
      trim: true,
    },
    budget: {
      type: Number,
      default: 0,
    },
    days: {
      type: Number,
      required: true,
      min: 1,
    },
    travelStyle: {
      type: String,
      required: true,
      default: 'Casual',
    },
    tripTemplate: {
      type: String,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed'],
      default: 'upcoming',
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    coverImage: {
      type: String,
    },
    packingList: [
      {
        item: { type: String, required: true },
        packed: { type: Boolean, default: false },
        isCustom: { type: Boolean, default: false },
      }
    ],
    travelTips: [
      {
        type: String,
      }
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    bookmarksCount: {
      type: Number,
      default: 0,
    },
    clonesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
