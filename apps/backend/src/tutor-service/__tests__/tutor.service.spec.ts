import { TutorService } from '../services/tutor.service';
import { GeocodingService } from '../services/geocoding.service';
import { TutorProfile } from '../../shared/database';
import { CreateTutorProfileDto, UpdateTutorProfileDto } from '../dto';

// Mock the TutorProfile model
jest.mock('../../shared/database', () => ({
  TutorProfile: {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn(),
  },
}));

jest.mock('../services/cloudinary.service');

describe('TutorService', () => {
  let tutorService: TutorService;
  let geocodingService: GeocodingService;
  let cloudinaryService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    geocodingService = new GeocodingService();
    cloudinaryService = {} as any;
    tutorService = new TutorService(geocodingService, cloudinaryService);
  });

  describe('createProfile', () => {
    it('should create a tutor profile successfully', async () => {
      const createDto: CreateTutorProfileDto = {
        userId: 'user123',
        bio: 'Experienced math tutor',
        qualifications: ['PhD in Mathematics'],
        subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
        hourlyRate: 50,
        location: {
          address: '123 Main St, New York, NY',
          coordinates: {
            type: 'Point',
            coordinates: [-74.006, 40.7128],
          },
        },
      };

      const mockProfile = {
        _id: 'profile123',
        ...createDto,
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
          address: '123 Main St, New York, NY',
        },
        demoVideos: [],
        availability: [],
        rating: 0,
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(null);
      (TutorProfile.create as jest.Mock).mockResolvedValue(mockProfile);

      const result = await tutorService.createProfile(createDto);

      expect(TutorProfile.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(TutorProfile.create).toHaveBeenCalled();
      expect(result.userId).toBe('user123');
      expect(result.bio).toBe('Experienced math tutor');
    });

    it('should throw error if profile already exists', async () => {
      const createDto: CreateTutorProfileDto = {
        userId: 'user123',
        bio: 'Experienced math tutor',
        qualifications: ['PhD in Mathematics'],
        subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
        hourlyRate: 50,
        location: {
          address: '123 Main St, New York, NY',
        },
      };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue({ userId: 'user123' });

      await expect(tutorService.createProfile(createDto)).rejects.toThrow(
        'Tutor profile already exists for this user'
      );
    });

    it('should geocode address if coordinates not provided', async () => {
      const createDto: CreateTutorProfileDto = {
        userId: 'user123',
        bio: 'Experienced math tutor',
        qualifications: ['PhD in Mathematics'],
        subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
        hourlyRate: 50,
        location: {
          address: '123 Main St, New York, NY',
        },
      };

      const mockProfile = {
        _id: 'profile123',
        userId: 'user123',
        bio: 'Experienced math tutor',
        qualifications: ['PhD in Mathematics'],
        subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
        hourlyRate: 50,
        location: {
          type: 'Point',
          coordinates: [40.7128, -74.006],
          address: '123 Main St, New York, NY',
        },
        demoVideos: [],
        availability: [],
        rating: 0,
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(null);
      (TutorProfile.create as jest.Mock).mockResolvedValue(mockProfile);

      const geocodeSpy = jest.spyOn(geocodingService, 'geocodeAddress');

      await tutorService.createProfile(createDto);

      expect(geocodeSpy).toHaveBeenCalledWith('123 Main St, New York, NY');
    });
  });

  describe('updateProfile', () => {
    it('should update tutor profile successfully', async () => {
      const updateDto: UpdateTutorProfileDto = {
        bio: 'Updated bio',
        hourlyRate: 60,
      };

      const mockProfile = {
        _id: 'profile123',
        userId: 'user123',
        bio: 'Old bio',
        qualifications: ['PhD in Mathematics'],
        subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
        hourlyRate: 50,
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
          address: '123 Main St, New York, NY',
        },
        demoVideos: [],
        availability: [],
        rating: 0,
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);

      const result = await tutorService.updateProfile('user123', updateDto);

      expect(TutorProfile.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockProfile.save).toHaveBeenCalled();
      expect(mockProfile.bio).toBe('Updated bio');
      expect(mockProfile.hourlyRate).toBe(60);
    });

    it('should throw error if profile not found', async () => {
      const updateDto: UpdateTutorProfileDto = {
        bio: 'Updated bio',
      };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(null);

      await expect(tutorService.updateProfile('user123', updateDto)).rejects.toThrow(
        'Tutor profile not found'
      );
    });
  });

  describe('getProfileByUserId', () => {
    it('should retrieve profile by user ID', async () => {
      const mockProfile = {
        _id: 'profile123',
        userId: 'user123',
        bio: 'Experienced math tutor',
        qualifications: ['PhD in Mathematics'],
        subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
        hourlyRate: 50,
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
          address: '123 Main St, New York, NY',
        },
        demoVideos: [],
        availability: [],
        rating: 0,
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);

      const result = await tutorService.getProfileByUserId('user123');

      expect(TutorProfile.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(result).not.toBeNull();
      expect(result?.userId).toBe('user123');
    });

    it('should return null if profile not found', async () => {
      (TutorProfile.findOne as jest.Mock).mockResolvedValue(null);

      const result = await tutorService.getProfileByUserId('user123');

      expect(result).toBeNull();
    });
  });

  describe('getProfileById', () => {
    it('should retrieve profile by ID', async () => {
      const mockProfile = {
        _id: 'profile123',
        userId: 'user123',
        bio: 'Experienced math tutor',
        qualifications: ['PhD in Mathematics'],
        subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
        hourlyRate: 50,
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
          address: '123 Main St, New York, NY',
        },
        demoVideos: [],
        availability: [],
        rating: 0,
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (TutorProfile.findById as jest.Mock).mockResolvedValue(mockProfile);

      const result = await tutorService.getProfileById('profile123');

      expect(TutorProfile.findById).toHaveBeenCalledWith('profile123');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('profile123');
    });
  });

  describe('deleteProfile', () => {
    it('should delete profile successfully', async () => {
      (TutorProfile.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      await tutorService.deleteProfile('user123');

      expect(TutorProfile.deleteOne).toHaveBeenCalledWith({ userId: 'user123' });
    });

    it('should throw error if profile not found', async () => {
      (TutorProfile.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      await expect(tutorService.deleteProfile('user123')).rejects.toThrow(
        'Tutor profile not found'
      );
    });
  });
});
