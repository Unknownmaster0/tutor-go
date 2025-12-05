import { TutorService } from '../services/tutor.service';
import { GeocodingService } from '../services/geocoding.service';
import { CloudinaryService } from '../services/cloudinary.service';
import { TutorProfile } from '../../shared/database';

// Mock dependencies
jest.mock('../../shared/database', () => ({
  TutorProfile: {
    find: jest.fn(),
  },
}));

jest.mock('../services/cloudinary.service');

describe('TutorService - Search', () => {
  let tutorService: TutorService;
  let geocodingService: GeocodingService;
  let cloudinaryService: CloudinaryService;

  beforeEach(() => {
    jest.clearAllMocks();
    geocodingService = new GeocodingService();
    cloudinaryService = new CloudinaryService();
    tutorService = new TutorService(geocodingService, cloudinaryService);
  });

  describe('searchTutors', () => {
    it('should search tutors by location and radius', async () => {
      const mockProfiles = [
        {
          _id: 'profile1',
          userId: 'user1',
          bio: 'Math tutor',
          qualifications: ['PhD'],
          subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
          hourlyRate: 50,
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128],
            address: 'New York, NY',
          },
          demoVideos: [],
          availability: [],
          rating: 4.5,
          totalReviews: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: 'profile2',
          userId: 'user2',
          bio: 'Physics tutor',
          qualifications: ['MSc'],
          subjects: [{ name: 'Physics', proficiency: 'expert' }],
          hourlyRate: 45,
          location: {
            type: 'Point',
            coordinates: [-74.01, 40.72],
            address: 'New York, NY',
          },
          demoVideos: [],
          availability: [],
          rating: 4.8,
          totalReviews: 15,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuery = {
        limit: jest.fn().mockResolvedValue(mockProfiles),
      };

      (TutorProfile.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await tutorService.searchTutors({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 10,
      });

      expect(TutorProfile.find).toHaveBeenCalledWith(
        expect.objectContaining({
          location: expect.objectContaining({
            $near: expect.objectContaining({
              $geometry: {
                type: 'Point',
                coordinates: [-74.006, 40.7128],
              },
              $maxDistance: 10000, // 10km in meters
            }),
          }),
        })
      );

      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe('user1');
      expect(result[0].distance).toBeDefined();
      expect(result[1].userId).toBe('user2');
    });

    it('should filter tutors by subject', async () => {
      const mockProfiles = [
        {
          _id: 'profile1',
          userId: 'user1',
          bio: 'Math tutor',
          qualifications: ['PhD'],
          subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
          hourlyRate: 50,
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128],
            address: 'New York, NY',
          },
          demoVideos: [],
          availability: [],
          rating: 4.5,
          totalReviews: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuery = {
        limit: jest.fn().mockResolvedValue(mockProfiles),
      };

      (TutorProfile.find as jest.Mock).mockReturnValue(mockQuery);

      await tutorService.searchTutors({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 10,
        subject: 'Mathematics',
      });

      expect(TutorProfile.find).toHaveBeenCalledWith(
        expect.objectContaining({
          'subjects.name': expect.objectContaining({
            $regex: expect.any(RegExp),
          }),
        })
      );
    });

    it('should filter tutors by rate range', async () => {
      const mockProfiles = [
        {
          _id: 'profile1',
          userId: 'user1',
          bio: 'Math tutor',
          qualifications: ['PhD'],
          subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
          hourlyRate: 50,
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128],
            address: 'New York, NY',
          },
          demoVideos: [],
          availability: [],
          rating: 4.5,
          totalReviews: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuery = {
        limit: jest.fn().mockResolvedValue(mockProfiles),
      };

      (TutorProfile.find as jest.Mock).mockReturnValue(mockQuery);

      await tutorService.searchTutors({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 10,
        minRate: 30,
        maxRate: 60,
      });

      expect(TutorProfile.find).toHaveBeenCalledWith(
        expect.objectContaining({
          hourlyRate: {
            $gte: 30,
            $lte: 60,
          },
        })
      );
    });

    it('should filter tutors by minimum rating', async () => {
      const mockProfiles = [
        {
          _id: 'profile1',
          userId: 'user1',
          bio: 'Math tutor',
          qualifications: ['PhD'],
          subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
          hourlyRate: 50,
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128],
            address: 'New York, NY',
          },
          demoVideos: [],
          availability: [],
          rating: 4.5,
          totalReviews: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuery = {
        limit: jest.fn().mockResolvedValue(mockProfiles),
      };

      (TutorProfile.find as jest.Mock).mockReturnValue(mockQuery);

      await tutorService.searchTutors({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 10,
        minRating: 4.0,
      });

      expect(TutorProfile.find).toHaveBeenCalledWith(
        expect.objectContaining({
          rating: {
            $gte: 4.0,
          },
        })
      );
    });

    it('should apply multiple filters simultaneously', async () => {
      const mockProfiles = [
        {
          _id: 'profile1',
          userId: 'user1',
          bio: 'Math tutor',
          qualifications: ['PhD'],
          subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
          hourlyRate: 50,
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128],
            address: 'New York, NY',
          },
          demoVideos: [],
          availability: [],
          rating: 4.5,
          totalReviews: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuery = {
        limit: jest.fn().mockResolvedValue(mockProfiles),
      };

      (TutorProfile.find as jest.Mock).mockReturnValue(mockQuery);

      await tutorService.searchTutors({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 10,
        subject: 'Mathematics',
        minRate: 30,
        maxRate: 60,
        minRating: 4.0,
      });

      expect(TutorProfile.find).toHaveBeenCalledWith(
        expect.objectContaining({
          'subjects.name': expect.any(Object),
          hourlyRate: {
            $gte: 30,
            $lte: 60,
          },
          rating: {
            $gte: 4.0,
          },
        })
      );
    });

    it('should limit results to 50 tutors', async () => {
      const mockProfiles = Array(60)
        .fill(null)
        .map((_, i) => ({
          _id: `profile${i}`,
          userId: `user${i}`,
          bio: 'Tutor',
          qualifications: ['PhD'],
          subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
          hourlyRate: 50,
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128],
            address: 'New York, NY',
          },
          demoVideos: [],
          availability: [],
          rating: 4.5,
          totalReviews: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

      const mockQuery = {
        limit: jest.fn().mockResolvedValue(mockProfiles.slice(0, 50)),
      };

      (TutorProfile.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await tutorService.searchTutors({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 10,
      });

      expect(mockQuery.limit).toHaveBeenCalledWith(50);
      expect(result).toHaveLength(50);
    });

    it('should calculate and include distance for each tutor', async () => {
      const mockProfiles = [
        {
          _id: 'profile1',
          userId: 'user1',
          bio: 'Math tutor',
          qualifications: ['PhD'],
          subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
          hourlyRate: 50,
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128],
            address: 'New York, NY',
          },
          demoVideos: [],
          availability: [],
          rating: 4.5,
          totalReviews: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuery = {
        limit: jest.fn().mockResolvedValue(mockProfiles),
      };

      (TutorProfile.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await tutorService.searchTutors({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 10,
      });

      expect(result[0].distance).toBeDefined();
      expect(typeof result[0].distance).toBe('number');
      expect(result[0].distance).toBeGreaterThanOrEqual(0);
    });
  });
});
