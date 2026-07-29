import * as noteService from './note.service.js';
import { successResponse } from '../../utils/response.js';

export const create = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const note = await noteService.createNote(tripId, req.body, req.user.id);
    return successResponse(res, 'Note created successfully.', note, 201);
  } catch (error) {
    next(error);
  }
};

export const getNotes = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const notes = await noteService.getTripNotes(tripId, req.user.id);
    return successResponse(res, 'Trip notes fetched successfully.', { notes }, 200);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const note = await noteService.updateNote(id, req.body, req.user.id);
    return successResponse(res, 'Note updated successfully.', note, 200);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await noteService.deleteNote(id, req.user.id);
    return successResponse(res, 'Note deleted successfully.', result, 200);
  } catch (error) {
    next(error);
  }
};
