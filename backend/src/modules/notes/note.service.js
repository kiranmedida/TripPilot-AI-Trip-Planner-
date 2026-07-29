import { Note } from './note.model.js';
import { Trip } from '../trips/trip.model.js';
import { AppError } from '../../utils/appError.js';

export const createNote = async (tripId, noteData, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found.', 404);
  }

  const isCollaborator = trip.collaborators.some(id => id.toString() === userId.toString());
  if (trip.userId.toString() !== userId.toString() && !isCollaborator) {
    throw new AppError('You do not have permission to add notes to this trip.', 403);
  }

  const note = await Note.create({
    tripId,
    dayId: noteData.dayId || null,
    userId,
    category: noteData.category || 'General',
    content: noteData.content,
  });

  return note;
};

export const getTripNotes = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found.', 404);
  }

  const isCollaborator = trip.collaborators.some(id => id.toString() === userId.toString());
  if (trip.userId.toString() !== userId.toString() && !isCollaborator) {
    throw new AppError('You do not have permission to view notes for this trip.', 403);
  }

  const notes = await Note.find({ tripId })
    .populate('userId', 'name email profilePic')
    .sort({ createdAt: -1 });

  return notes;
};

export const updateNote = async (noteId, updateData, userId) => {
  const note = await Note.findById(noteId);
  if (!note) {
    throw new AppError('Note not found.', 404);
  }

  const trip = await Trip.findById(note.tripId);
  if (!trip) {
    throw new AppError('Trip associated with this note not found.', 404);
  }

  const isCollaborator = trip.collaborators.some(id => id.toString() === userId.toString());
  if (
    note.userId.toString() !== userId.toString() &&
    trip.userId.toString() !== userId.toString() &&
    !isCollaborator
  ) {
    throw new AppError('You do not have permission to update this note.', 403);
  }

  note.content = updateData.content !== undefined ? updateData.content : note.content;
  note.category = updateData.category !== undefined ? updateData.category : note.category;
  note.dayId = updateData.dayId !== undefined ? updateData.dayId : note.dayId;

  await note.save();
  return note;
};

export const deleteNote = async (noteId, userId) => {
  const note = await Note.findById(noteId);
  if (!note) {
    throw new AppError('Note not found.', 404);
  }

  const trip = await Trip.findById(note.tripId);
  if (!trip) {
    throw new AppError('Trip associated with this note not found.', 404);
  }

  const isCollaborator = trip.collaborators.some(id => id.toString() === userId.toString());
  if (
    note.userId.toString() !== userId.toString() &&
    trip.userId.toString() !== userId.toString() &&
    !isCollaborator
  ) {
    throw new AppError('You do not have permission to delete this note.', 403);
  }

  await Note.findByIdAndDelete(noteId);
  return { id: noteId };
};
