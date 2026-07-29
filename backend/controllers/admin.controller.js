import * as adminService from '../services/admin.service.js';
import { successResponse } from '../utils/response.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    return successResponse(res, 'Users fetched successfully.', { users }, 200);
  } catch (error) {
    next(error);
  }
};

export const changeRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await adminService.updateUserRole(req.params.id, role);
    return successResponse(res, 'User role updated successfully.', { user }, 200);
  } catch (error) {
    next(error);
  }
};

export const resetLimit = async (req, res, next) => {
  try {
    const user = await adminService.resetUserLimit(req.params.id);
    return successResponse(res, 'User AI requests limit reset successfully.', { user }, 200);
  } catch (error) {
    next(error);
  }
};

export const removeUser = async (req, res, next) => {
  try {
    const result = await adminService.deleteUser(req.params.id);
    return successResponse(res, 'User and associated trips deleted successfully.', result, 200);
  } catch (error) {
    next(error);
  }
};

export const getTrips = async (req, res, next) => {
  try {
    const trips = await adminService.getAllTrips();
    return successResponse(res, 'All system trips fetched successfully.', { trips }, 200);
  } catch (error) {
    next(error);
  }
};
