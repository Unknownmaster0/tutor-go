import { TutorService } from '../services/tutor.service';
import { GeocodingService } from '../services/geocoding.service';
import { CloudinaryService } from '../services/cloudinary.service';
import { TutorProfile } from '../../shared/database';

// Mock dependencies
jest.mock('../../shared/database', () => ({
  TutorProfile: {
    findOne: jest.fn(),
  },
  prisma: {},
}));

jest.mock('../services/cloudinary.service');

describe('TutorService - Availability Management', () => {
  let tutorService: TutorService;
  let geocodingService: GeocodingService;
  let cloudinaryService: CloudinaryService;

  beforeEach(() => {
    jest.clearAllMocks();
    geocodingService = new GeocodingService();
    cloudinaryService = new CloudinaryService();
    tutorService = new TutorService(geocodingService, cloudinaryService);
  });

  describe('setAvailability', () => {
    it('should set availability successfully', async () => {
      const mockProfile = {
        userId: 'user123',
        availability: [],
        save: jest.fn().mockResolvedValue(true),
        _id: 'profile123',
        bio: 'Test',
        qualifications: [],
        subjects: [],
        hourlyRate: 50,
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
          address: 'Test',
        },
        demoVideos: [],
        rating: 0,
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const availability = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
      ];

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);

      await tutorService.setAvailability('user123', availability);

      expect(mockProfile.availability).toEqual(availability);
      expect(mockProfile.save).toHaveBeenCalled();
    });

    it('should throw error if profile not found', async () => {
      (TutorProfile.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        tutorService.setAvailability('user123', [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }])
      ).rejects.toThrow('Tutor profile not found');
    });

    it('should validate day of week', async () => {
      const mockProfile = {
        userId: 'user123',
        availability: [],
        save: jest.fn(),
      };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);

      await expect(
        tutorService.setAvailability('user123', [{ dayOfWeek: 7, startTime: '09:00', endTime: '17:00' }])
      ).rejects.toThrow('Day of week must be between 0 (Sunday) and 6 (Saturday)');

      await expect(
        tutorService.setAvailability('user123', [{ dayOfWeek: -1, startTime: '09:00', endTime: '17:00' }])
      ).rejects.toThrow('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    });

    it('should validate time format', async () => {
      const mockProfile = {
        userId: 'user123',
        availability: [],
        save: jest.fn(),
      };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);

      await expect(
        tutorService.setAvailability('user123', [{ dayOfWeek: 1, startTime: '25:00', endTime: '17:00' }])
      ).rejects.toThrow('Time must be in HH:MM format');

      await expect(
        tutorService.setAvailability('user123', [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:70' }])
      ).rejects.toThrow('Time must be in HH:MM format');
    });

    it('should validate that end time is after start time', async () => {
      const mockProfile = {
        userId: 'user123',
        availability: [],
        save: jest.fn(),
      };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);

      await expect(
        tutorService.setAvailability('user123', [{ dayOfWeek: 1, startTime: '17:00', endTime: '09:00' }])
      ).rejects.toThrow('End time must be after start time');

      await expect(
        tutorService.setAvailability('user123', [{ dayOfWeek: 1, startTime: '09:00', endTime: '09:00' }])
      ).rejects.toThrow('End time must be after start time');
    });
  });

  describe('getAvailability', () => {
    it('should retrieve availability successfully', async () => {
      const availability = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
      ];

      const mockProfile = {
        userId: 'user123',
        availability,
      };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);

      const result = await tutorService.getAvailability('user123');

      expect(result).toEqual(availability);
    });

    it('should throw error if profile not found', async () => {
      (TutorProfile.findOne as jest.Mock).mockResolvedValue(null);

      await expect(tutorService.getAvailability('user123')).rejects.toThrow('Tutor profile not found');
    });
  });

  describe('addAvailabilitySlot', () => {
    it('should add availability slot successfully', async () => {
      const mockProfile = {
        userId: 'user123',
        availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '12:00' }],
        save: jest.fn().mockResolvedValue(true),
        _id: 'profile123',
        bio: 'Test',
        qualifications: [],
        subjects: [],
        hourlyRate: 50,
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
          address: 'Test',
        },
        demoVideos: [],
        rating: 0,
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newSlot = { dayOfWeek: 1, startTime: '14:00', endTime: '17:00' };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);

      await tutorService.addAvailabilitySlot('user123', newSlot);

      expect(mockProfile.availability).toHaveLength(2);
      expect(mockProfile.availability[1]).toEqual(newSlot);
      expect(mockProfile.save).toHaveBeenCalled();
    });

    it('should throw error if slot overlaps with existing slot', async () => {
      const mockProfile = {
        userId: 'user123',
        availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '12:00' }],
        save: jest.fn(),
      };

      const overlappingSlot = { dayOfWeek: 1, startTime: '11:00', endTime: '14:00' };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);

      await expect(tutorService.addAvailabilitySlot('user123', overlappingSlot)).rejects.toThrow(
        'Availability slot overlaps with existing slot'
      );
    });

    it('should allow non-overlapping slots on the same day', async () => {
      const mockProfile = {
        userId: 'user123',
        availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '12:00' }],
        save: jest.fn().mockResolvedValue(true),
        _id: 'profile123',
        bio: 'Test',
        qualifications: [],
        subjects: [],
        hourlyRate: 50,
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
          address: 'Test',
        },
        demoVideos: [],
        rating: 0,
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const nonOverlappingSlot = { dayOfWeek: 1, startTime: '13:00', endTime: '16:00' };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);

      await tutorService.addAvailabilitySlot('user123', nonOverlappingSlot);

      expect(mockProfile.availability).toHaveLength(2);
      expect(mockProfile.save).toHaveBeenCalled();
    });
  });

  describe('removeAvailabilitySlot', () => {
    it('should remove availability slot successfully', async () => {
      const mockProfile = {
        userId: 'user123',
        availability: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
          { dayOfWeek: 1, startTime: '14:00', endTime: '17:00' },
          { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
        ],
        save: jest.fn().mockResolvedValue(true),
        _id: 'profile123',
        bio: 'Test',
        qualifications: [],
        subjects: [],
        hourlyRate: 50,
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
          address: 'Test',
        },
        demoVideos: [],
        rating: 0,
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);

      await tutorService.removeAvailabilitySlot('user123', 1, '14:00');

      expect(mockProfile.availability).toHaveLength(2);
      expect(mockProfile.availability.find((s) => s.startTime === '14:00')).toBeUndefined();
      expect(mockProfile.save).toHaveBeenCalled();
    });

    it('should throw error if slot not found', async () => {
      const mockProfile = {
        userId: 'user123',
        availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '12:00' }],
        save: jest.fn(),
      };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);

      await expect(tutorService.removeAvailabilitySlot('user123', 1, '14:00')).rejects.toThrow(
        'Availability slot not found'
      );
    });

    it('should throw error if profile not found', async () => {
      (TutorProfile.findOne as jest.Mock).mockResolvedValue(null);

      await expect(tutorService.removeAvailabilitySlot('user123', 1, '09:00')).rejects.toThrow(
        'Tutor profile not found'
      );
    });
  });
});
