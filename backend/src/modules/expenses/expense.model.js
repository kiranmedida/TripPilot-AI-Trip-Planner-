import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['Hotel', 'Food', 'Transportation', 'Shopping', 'Entertainment', 'Others'],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an expense amount'],
    },
    currency: {
      type: String,
      default: 'USD',
    },
    description: {
      type: String,
      trim: true,
    },
    splitType: {
      type: String,
      enum: ['equal', 'unequal', 'percentage'],
      default: 'equal',
    },
    splitDetails: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        share: {
          type: Number, // Amount or percentage depending on splitType
        }
      }
    ],
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
