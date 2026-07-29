import { Expense } from './expense.model.js';
import { Trip } from '../trips/trip.model.js';
import { AppError } from '../../utils/appError.js';

export const createExpense = async (tripId, expenseData, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found.', 404);
  }

  // Check if collaborator or creator
  const isCollaborator = trip.collaborators.some(id => id.toString() === userId.toString());
  if (trip.userId.toString() !== userId.toString() && !isCollaborator) {
    throw new AppError('You do not have permission to add expenses to this trip.', 403);
  }

  const expense = await Expense.create({
    tripId,
    userId,
    category: expenseData.category,
    amount: expenseData.amount,
    currency: expenseData.currency || 'USD',
    description: expenseData.description || '',
    splitType: expenseData.splitType || 'equal',
    splitDetails: expenseData.splitDetails || [],
    date: expenseData.date || new Date(),
  });

  return expense;
};

export const getTripExpenses = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found.', 404);
  }

  const isCollaborator = trip.collaborators.some(id => id.toString() === userId.toString());
  if (trip.userId.toString() !== userId.toString() && !isCollaborator) {
    throw new AppError('You do not have permission to view expenses for this trip.', 403);
  }

  const expenses = await Expense.find({ tripId })
    .populate('userId', 'name email profilePic')
    .populate('splitDetails.userId', 'name email profilePic')
    .sort({ date: -1 });

  return expenses;
};

export const deleteExpense = async (expenseId, userId) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) {
    throw new AppError('Expense not found.', 404);
  }

  const trip = await Trip.findById(expense.tripId);
  if (!trip) {
    throw new AppError('Trip associated with this expense not found.', 404);
  }

  // Check permission: payer, trip owner or collaborator
  const isCollaborator = trip.collaborators.some(id => id.toString() === userId.toString());
  if (
    expense.userId.toString() !== userId.toString() &&
    trip.userId.toString() !== userId.toString() &&
    !isCollaborator
  ) {
    throw new AppError('You do not have permission to delete this expense.', 403);
  }

  await Expense.findByIdAndDelete(expenseId);
  return { id: expenseId };
};
