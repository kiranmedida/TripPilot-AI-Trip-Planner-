import * as expenseService from './expense.service.js';
import { successResponse } from '../../utils/response.js';

export const create = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const expense = await expenseService.createExpense(tripId, req.body, req.user.id);
    return successResponse(res, 'Expense created successfully.', expense, 201);
  } catch (error) {
    next(error);
  }
};

export const getExpenses = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const expenses = await expenseService.getTripExpenses(tripId, req.user.id);
    return successResponse(res, 'Trip expenses fetched successfully.', { expenses }, 200);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await expenseService.deleteExpense(id, req.user.id);
    return successResponse(res, 'Expense deleted successfully.', result, 200);
  } catch (error) {
    next(error);
  }
};
