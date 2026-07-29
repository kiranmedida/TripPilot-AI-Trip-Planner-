import * as tripService from '../services/trip.service.js';
import { successResponse } from '../utils/response.js';

export const create = async (req, res, next) => {
  try {
    const trip = await tripService.createTrip(req.body, req.user.id);
    return successResponse(res, 'Trip saved successfully.', trip, 201);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const trips = await tripService.getUserTrips(req.user.id);
    return successResponse(res, 'User trips fetched successfully.', { trips }, 200);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const trip = await tripService.getTripById(req.params.id, req.user.id, req.user.role);
    return successResponse(res, 'Trip details fetched successfully.', trip, 200);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const trip = await tripService.updateTrip(req.params.id, req.user.id, req.user.role, req.body);
    return successResponse(res, 'Trip updated successfully.', trip, 200);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await tripService.deleteTrip(req.params.id, req.user.id, req.user.role);
    return successResponse(res, 'Trip deleted successfully.', result, 200);
  } catch (error) {
    next(error);
  }
};
