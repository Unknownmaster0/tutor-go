import { TutorProfile, ITutorProfile, prisma } from '../../shared/database';
import { CreateTutorProfileDto, UpdateTutorProfileDto, TutorProfileResponseDto } from '../dto';
import { GeocodingService } from './geocoding.service';
import { CloudinaryService } from './cloudinary.service';

export interface ReviewDto {
  id: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

export interface TutorProfileDetailDto extends TutorProfileResponseDto {
  reviews: ReviewDto[];
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export class TutorService {
  private geocodingService: GeocodingService;
  private cloudinaryService: CloudinaryService;

  constructor(geocodingService: GeocodingService, cloudinaryService: CloudinaryService) {
    this.geocodingService = geocodingService;
    this.cloudinaryService = cloudinaryService;
  }

  async createProfile(data: CreateTutorProfileDto): Promise<TutorProfileResponseDto> {
    // Check if profile already exists for this user
    const existingProfile = await TutorProfile.findOne({ userId: data.userId });
    if (existingProfile) {
      throw new Error('Tutor profile already exists for this user');
    }

    // Convert address to coordinates if not provided
    let coordinates = data.location.coordinates;
    if (!coordinates) {
      const coords = await this.geocodingService.geocodeAddress(data.location.address);
      coordinates = {
        type: 'Point',
        coordinates: [coords.longitude, coords.latitude],
      };
    }

    // Create tutor profile
    const profile = await TutorProfile.create({
      userId: data.userId,
      bio: data.bio,
      qualifications: data.qualifications,
      subjects: data.subjects,
      hourlyRate: data.hourlyRate,
      location: {
        type: 'Point',
        coordinates: coordinates.coordinates,
        address: data.location.address,
      },
      demoVideos: [],
      availability: [],
      rating: 0,
      totalReviews: 0,
    });

    return this.mapToResponseDto(profile);
  }

  async updateProfile(userId: string, data: UpdateTutorProfileDto): Promise<TutorProfileResponseDto> {
    const profile = await TutorProfile.findOne({ userId });
    if (!profile) {
      throw new Error('Tutor profile not found');
    }

    // Handle location update
    if (data.location) {
      let coordinates = data.location.coordinates;
      if (!coordinates && data.location.address) {
        const coords = await this.geocodingService.geocodeAddress(data.location.address);
        coordinates = {
          type: 'Point',
          coordinates: [coords.longitude, coords.latitude],
        };
      }

      if (coordinates) {
        profile.location = {
          type: 'Point',
          coordinates: coordinates.coordinates,
          address: data.location.address || profile.location.address,
        };
      }
    }

    // Update other fields
    if (data.bio !== undefined) profile.bio = data.bio;
    if (data.qualifications !== undefined) profile.qualifications = data.qualifications;
    if (data.subjects !== undefined) profile.subjects = data.subjects;
    if (data.hourlyRate !== undefined) profile.hourlyRate = data.hourlyRate;

    await profile.save();

    return this.mapToResponseDto(profile);
  }

  async getProfileByUserId(userId: string): Promise<TutorProfileResponseDto | null> {
    const profile = await TutorProfile.findOne({ userId });
    if (!profile) {
      return null;
    }
    return this.mapToResponseDto(profile);
  }

  async getProfileById(id: string): Promise<TutorProfileResponseDto | null> {
    const profile = await TutorProfile.findById(id);
    if (!profile) {
      return null;
    }
    return this.mapToResponseDto(profile);
  }

  async getProfileDetailById(id: string): Promise<TutorProfileDetailDto | null> {
    // Get tutor profile from MongoDB
    const profile = await TutorProfile.findById(id);
    if (!profile) {
      return null;
    }

    // Get user details from PostgreSQL
    const user = await prisma.user.findUnique({
      where: { id: profile.userId },
      select: { name: true },
    });

    // Get reviews from PostgreSQL
    const reviews = await prisma.review.findMany({
      where: {
        tutorId: profile.userId,
        flagged: false, // Only show non-flagged reviews
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate rating breakdown
    const ratingBreakdown = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingBreakdown[review.rating as keyof typeof ratingBreakdown]++;
      }
    });

    // Map reviews to DTO
    const reviewDtos: ReviewDto[] = reviews.map((review) => ({
      id: review.id,
      studentId: review.student.id,
      studentName: review.student.name,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    }));

    // Calculate average rating and total reviews
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    // Update profile with latest rating stats if they've changed
    if (profile.rating !== averageRating || profile.totalReviews !== totalReviews) {
      profile.rating = Math.round(averageRating * 10) / 10; // Round to 1 decimal
      profile.totalReviews = totalReviews;
      await profile.save();
    }

    return {
      ...this.mapToResponseDto(profile),
      name: user?.name,
      reviews: reviewDtos,
      ratingBreakdown,
    };
  }

  async deleteProfile(userId: string): Promise<void> {
    const result = await TutorProfile.deleteOne({ userId });
    if (result.deletedCount === 0) {
      throw new Error('Tutor profile not found');
    }
  }

  async uploadDemoVideo(userId: string, file: Express.Multer.File): Promise<string> {
    // Get tutor profile
    const profile = await TutorProfile.findOne({ userId });
    if (!profile) {
      throw new Error('Tutor profile not found');
    }

    // Validate video file
    const validation = this.cloudinaryService.validateVideoFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid video file');
    }

    // Upload to Cloudinary
    const videoUrl = await this.cloudinaryService.uploadVideo(file);

    // Add video URL to profile
    profile.demoVideos.push(videoUrl);
    await profile.save();

    return videoUrl;
  }

  async deleteDemoVideo(userId: string, videoUrl: string): Promise<void> {
    // Get tutor profile
    const profile = await TutorProfile.findOne({ userId });
    if (!profile) {
      throw new Error('Tutor profile not found');
    }

    // Check if video exists in profile
    const videoIndex = profile.demoVideos.indexOf(videoUrl);
    if (videoIndex === -1) {
      throw new Error('Video not found in profile');
    }

    // Delete from Cloudinary
    await this.cloudinaryService.deleteVideo(videoUrl);

    // Remove from profile
    profile.demoVideos.splice(videoIndex, 1);
    await profile.save();
  }

  async setAvailability(
    userId: string,
    availability: Array<{ dayOfWeek: number; startTime: string; endTime: string }>
  ): Promise<TutorProfileResponseDto> {
    const profile = await TutorProfile.findOne({ userId });
    if (!profile) {
      throw new Error('Tutor profile not found');
    }

    // Validate availability slots
    this.validateAvailabilitySlots(availability);

    // Update availability
    profile.availability = availability;
    await profile.save();

    return this.mapToResponseDto(profile);
  }

  async getAvailability(userId: string): Promise<Array<{ dayOfWeek: number; startTime: string; endTime: string }>> {
    const profile = await TutorProfile.findOne({ userId });
    if (!profile) {
      throw new Error('Tutor profile not found');
    }

    return profile.availability;
  }

  async addAvailabilitySlot(
    userId: string,
    slot: { dayOfWeek: number; startTime: string; endTime: string }
  ): Promise<TutorProfileResponseDto> {
    const profile = await TutorProfile.findOne({ userId });
    if (!profile) {
      throw new Error('Tutor profile not found');
    }

    // Validate the new slot
    this.validateAvailabilitySlots([slot]);

    // Check for overlapping slots
    const hasOverlap = profile.availability.some(
      (existing) =>
        existing.dayOfWeek === slot.dayOfWeek &&
        this.timeSlotsOverlap(existing.startTime, existing.endTime, slot.startTime, slot.endTime)
    );

    if (hasOverlap) {
      throw new Error('Availability slot overlaps with existing slot');
    }

    // Add the new slot
    profile.availability.push(slot);
    await profile.save();

    return this.mapToResponseDto(profile);
  }

  async removeAvailabilitySlot(
    userId: string,
    dayOfWeek: number,
    startTime: string
  ): Promise<TutorProfileResponseDto> {
    const profile = await TutorProfile.findOne({ userId });
    if (!profile) {
      throw new Error('Tutor profile not found');
    }

    // Find and remove the slot
    const initialLength = profile.availability.length;
    profile.availability = profile.availability.filter(
      (slot) => !(slot.dayOfWeek === dayOfWeek && slot.startTime === startTime)
    );

    if (profile.availability.length === initialLength) {
      throw new Error('Availability slot not found');
    }

    await profile.save();

    return this.mapToResponseDto(profile);
  }

  private validateAvailabilitySlots(
    slots: Array<{ dayOfWeek: number; startTime: string; endTime: string }>
  ): void {
    for (const slot of slots) {
      // Validate day of week
      if (slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
        throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
      }

      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
        throw new Error('Time must be in HH:MM format');
      }

      // Validate that end time is after start time
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        throw new Error('End time must be after start time');
      }
    }
  }

  private timeSlotsOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const [start1Hour, start1Min] = start1.split(':').map(Number);
    const [end1Hour, end1Min] = end1.split(':').map(Number);
    const [start2Hour, start2Min] = start2.split(':').map(Number);
    const [end2Hour, end2Min] = end2.split(':').map(Number);

    const start1Minutes = start1Hour * 60 + start1Min;
    const end1Minutes = end1Hour * 60 + end1Min;
    const start2Minutes = start2Hour * 60 + start2Min;
    const end2Minutes = end2Hour * 60 + end2Min;

    return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
  }

  async searchTutors(params: {
    latitude: number;
    longitude: number;
    radius: number;
    subject?: string;
    minRate?: number;
    maxRate?: number;
    minRating?: number;
  }): Promise<TutorProfileResponseDto[]> {
    const { latitude, longitude, radius, subject, minRate, maxRate, minRating } = params;

    // Build query
    const query: any = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radius * 1000, // Convert km to meters
        },
      },
    };

    // Add subject filter
    if (subject) {
      query['subjects.name'] = { $regex: new RegExp(subject, 'i') };
    }

    // Add rate range filter
    if (minRate !== undefined || maxRate !== undefined) {
      query.hourlyRate = {};
      if (minRate !== undefined) query.hourlyRate.$gte = minRate;
      if (maxRate !== undefined) query.hourlyRate.$lte = maxRate;
    }

    // Add rating filter
    if (minRating !== undefined) {
      query.rating = { $gte: minRating };
    }

    // Execute query
    const profiles = await TutorProfile.find(query).limit(50);

    // Map to response DTOs and calculate distances
    return profiles.map((profile) => {
      const distance = this.geocodingService.calculateDistance(
        latitude,
        longitude,
        profile.location.coordinates[1],
        profile.location.coordinates[0]
      );

      return {
        ...this.mapToResponseDto(profile),
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      };
    });
  }

  private mapToResponseDto(profile: ITutorProfile): TutorProfileResponseDto {
    return {
      id: profile._id.toString(),
      userId: profile.userId,
      bio: profile.bio,
      qualifications: profile.qualifications,
      subjects: profile.subjects,
      hourlyRate: profile.hourlyRate,
      location: profile.location,
      demoVideos: profile.demoVideos,
      availability: profile.availability,
      rating: profile.rating,
      totalReviews: profile.totalReviews,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
