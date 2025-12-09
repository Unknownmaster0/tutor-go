import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { TutorService, RedisService } from '../services';
import { ApiResponse } from '../../shared';
import { CreateTutorProfileDto, UpdateTutorProfileDto } from '../dto';

export class TutorController {
  constructor(
    private tutorService: TutorService,
    private redisService: RedisService
  ) {}

  createProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ApiResponse.error(res, 'Validation failed', 400, errors.array());
        return;
      }

      const data: CreateTutorProfileDto = req.body;
      const profile = await this.tutorService.createProfile(data);

      ApiResponse.success(res, profile, 'Tutor profile created successfully', 201);
    } catch (error: any) {
      if (error.message === 'Tutor profile already exists for this user') {
        ApiResponse.error(res, error.message, 409);
      } else {
        console.error('Create profile error:', error);
        ApiResponse.error(res, 'Failed to create tutor profile', 500);
      }
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ApiResponse.error(res, 'Validation failed', 400, errors.array());
        return;
      }

      const userId = (req as any).user?.userId;
      if (!userId) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      const data: UpdateTutorProfileDto = req.body;
      const profile = await this.tutorService.updateProfile(userId, data);

      // Invalidate cache after profile update
      await this.redisService.invalidateTutorCache(profile.id);

      ApiResponse.success(res, profile, 'Tutor profile updated successfully');
    } catch (error: any) {
      if (error.message === 'Tutor profile not found') {
        ApiResponse.error(res, error.message, 404);
      } else {
        console.error('Update profile error:', error);
        ApiResponse.error(res, 'Failed to update tutor profile', 500);
      }
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      const profile = await this.tutorService.getProfileByUserId(userId);
      if (!profile) {
        ApiResponse.error(res, 'Tutor profile not found', 404);
        return;
      }

      ApiResponse.success(res, profile, 'Tutor profile retrieved successfully');
    } catch (error: any) {
      console.error('Get profile error:', error);
      ApiResponse.error(res, 'Failed to retrieve tutor profile', 500);
    }
  };

  getProfileById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const includeReviews = req.query.includeReviews === 'true';

      let profile;
      if (includeReviews) {
        profile = await this.tutorService.getProfileDetailById(id);
      } else {
        profile = await this.tutorService.getProfileById(id);
      }

      if (!profile) {
        ApiResponse.error(res, 'Tutor profile not found', 404);
        return;
      }

      ApiResponse.success(res, profile, 'Tutor profile retrieved successfully');
    } catch (error: any) {
      console.error('Get profile by ID error:', error);
      ApiResponse.error(res, 'Failed to retrieve tutor profile', 500);
    }
  };

  deleteProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      await this.tutorService.deleteProfile(userId);
      ApiResponse.success(res, null, 'Tutor profile deleted successfully');
    } catch (error: any) {
      if (error.message === 'Tutor profile not found') {
        ApiResponse.error(res, error.message, 404);
      } else {
        console.error('Delete profile error:', error);
        ApiResponse.error(res, 'Failed to delete tutor profile', 500);
      }
    }
  };

  uploadVideo = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      const file = req.file;
      if (!file) {
        ApiResponse.error(res, 'No video file provided', 400);
        return;
      }

      const videoUrl = await this.tutorService.uploadDemoVideo(userId, file);

      ApiResponse.success(res, { videoUrl }, 'Video uploaded successfully', 201);
    } catch (error: any) {
      if (error.message === 'Tutor profile not found') {
        ApiResponse.error(res, error.message, 404);
      } else if (error.message.includes('File size exceeds') || error.message.includes('Invalid file format')) {
        ApiResponse.error(res, error.message, 400);
      } else {
        console.error('Upload video error:', error);
        ApiResponse.error(res, 'Failed to upload video', 500);
      }
    }
  };

  deleteVideo = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      // Accept videoUrl from both query params and body for flexibility
      const videoUrl = req.query.url as string || req.body.videoUrl;
      if (!videoUrl) {
        ApiResponse.error(res, 'Video URL is required', 400);
        return;
      }

      await this.tutorService.deleteDemoVideo(userId, videoUrl);

      ApiResponse.success(res, null, 'Video deleted successfully');
    } catch (error: any) {
      if (error.message === 'Tutor profile not found' || error.message === 'Video not found in profile') {
        ApiResponse.error(res, error.message, 404);
      } else {
        console.error('Delete video error:', error);
        ApiResponse.error(res, 'Failed to delete video', 500);
      }
    }
  };

  searchTutors = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ApiResponse.error(res, 'Validation failed', 400, errors.array());
        return;
      }

      const { latitude, longitude, radius, subject, minRate, maxRate, minRating } = req.query;

      const searchParams = {
        latitude: parseFloat(latitude as string),
        longitude: parseFloat(longitude as string),
        radius: parseFloat(radius as string),
        subject: subject as string | undefined,
        minRate: minRate ? parseFloat(minRate as string) : undefined,
        maxRate: maxRate ? parseFloat(maxRate as string) : undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
      };

      // Generate cache key
      const cacheKey = this.redisService.generateSearchCacheKey(searchParams);

      // Check cache
      const cachedResults = await this.redisService.getCachedSearchResults(cacheKey);
      if (cachedResults) {
        ApiResponse.success(res, cachedResults, 'Tutors retrieved from cache');
        return;
      }

      // Search tutors
      const tutors = await this.tutorService.searchTutors(searchParams);

      // Cache results for 5 minutes
      await this.redisService.cacheSearchResults(cacheKey, tutors, 300);

      ApiResponse.success(res, tutors, 'Tutors retrieved successfully');
    } catch (error: any) {
      console.error('Search tutors error:', error);
      ApiResponse.error(res, 'Failed to search tutors', 500);
    }
  };

  setAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ApiResponse.error(res, 'Validation failed', 400, errors.array());
        return;
      }

      const userId = (req as any).user?.userId;
      if (!userId) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      const { availability } = req.body;
      const profile = await this.tutorService.setAvailability(userId, availability);

      ApiResponse.success(res, profile, 'Availability updated successfully');
    } catch (error: any) {
      if (error.message === 'Tutor profile not found') {
        ApiResponse.error(res, error.message, 404);
      } else if (
        error.message.includes('Day of week') ||
        error.message.includes('Time must be') ||
        error.message.includes('End time must be')
      ) {
        ApiResponse.error(res, error.message, 400);
      } else {
        console.error('Set availability error:', error);
        ApiResponse.error(res, 'Failed to update availability', 500);
      }
    }
  };

  getAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Get profile to find userId
      const profile = await this.tutorService.getProfileById(id);
      if (!profile) {
        ApiResponse.error(res, 'Tutor profile not found', 404);
        return;
      }

      const availability = await this.tutorService.getAvailability(profile.userId);

      ApiResponse.success(res, { availability }, 'Availability retrieved successfully');
    } catch (error: any) {
      if (error.message === 'Tutor profile not found') {
        ApiResponse.error(res, error.message, 404);
      } else {
        console.error('Get availability error:', error);
        ApiResponse.error(res, 'Failed to retrieve availability', 500);
      }
    }
  };

  addAvailabilitySlot = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ApiResponse.error(res, 'Validation failed', 400, errors.array());
        return;
      }

      const userId = (req as any).user?.userId;
      if (!userId) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      const { dayOfWeek, startTime, endTime } = req.body;
      const profile = await this.tutorService.addAvailabilitySlot(userId, {
        dayOfWeek,
        startTime,
        endTime,
      });

      ApiResponse.success(res, profile, 'Availability slot added successfully', 201);
    } catch (error: any) {
      if (error.message === 'Tutor profile not found') {
        ApiResponse.error(res, error.message, 404);
      } else if (
        error.message.includes('overlaps') ||
        error.message.includes('Day of week') ||
        error.message.includes('Time must be') ||
        error.message.includes('End time must be')
      ) {
        ApiResponse.error(res, error.message, 400);
      } else {
        console.error('Add availability slot error:', error);
        ApiResponse.error(res, 'Failed to add availability slot', 500);
      }
    }
  };

  removeAvailabilitySlot = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      const { dayOfWeek, startTime } = req.body;
      const profile = await this.tutorService.removeAvailabilitySlot(
        userId,
        parseInt(dayOfWeek),
        startTime
      );

      ApiResponse.success(res, profile, 'Availability slot removed successfully');
    } catch (error: any) {
      if (error.message === 'Tutor profile not found' || error.message === 'Availability slot not found') {
        ApiResponse.error(res, error.message, 404);
      } else {
        console.error('Remove availability slot error:', error);
        ApiResponse.error(res, 'Failed to remove availability slot', 500);
      }
    }
  };
}
