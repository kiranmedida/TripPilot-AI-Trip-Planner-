import * as communityService from './community.service.js';
import { successResponse } from '../../utils/response.js';

export const getFeed = async (req, res, next) => {
  try {
    const templates = await communityService.getFeed(req.query);
    return successResponse(res, 'Community feed fetched successfully.', { templates }, 200);
  } catch (error) {
    next(error);
  }
};

export const share = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { title, description } = req.body;
    const template = await communityService.shareTrip(tripId, title, description, req.user.id);
    return successResponse(res, 'Trip shared successfully with the community.', template, 201);
  } catch (error) {
    next(error);
  }
};

export const duplicate = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const clonedTrip = await communityService.duplicateTemplate(templateId, req.user.id);
    return successResponse(res, 'Trip template cloned successfully.', clonedTrip, 201);
  } catch (error) {
    next(error);
  }
};

export const like = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const result = await communityService.toggleLikeTemplate(templateId, req.user.id);
    return successResponse(res, 'Like state toggled.', result, 200);
  } catch (error) {
    next(error);
  }
};

export const comment = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const { text } = req.body;
    const newComment = await communityService.addComment(templateId, text, req.user.id);
    return successResponse(res, 'Comment posted successfully.', newComment, 201);
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const comments = await communityService.getTemplateComments(templateId);
    return successResponse(res, 'Template comments fetched.', { comments }, 200);
  } catch (error) {
    next(error);
  }
};
