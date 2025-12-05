import { TutorService } from '../services/tutor.service';
import { GeocodingService } from '../services/geocoding.service';
import { CloudinaryService } from '../services/cloudinary.service';
import { TutorProfile, prisma } from '../../shared/database';

// Mock dependencies
jest.mock('../../shared/database', () => ({
  TutorProfile: {
    findById: jest.fn(),
  },
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    review: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('../services/cloudinary.service');

describe('TutorService - Profile Detail', () => {
  let tutorService: TutorService;
  let geocodingService: GeocodingService;
  let cloudinaryService: CloudinaryService;

  beforeEach(() => {
    jest.clearAllMocks();
    geocodingService = new GeocodingService();
    cloudinaryService = new CloudinaryService();
    tutorService = new TutorService(geocodingService, cloudinaryService);
  });

  describe('getProfileDetailById', () => {
    it('should retrieve profile with reviews and rating breakdown', async () => {
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
          address: 'New York, NY',
        },
        demoVideos: ['https://cloudinary.com/video1.mp4'],
        availability: [],
        rating: 4.5,
        totalReviews: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      const mockUser = {
        name: 'John Doe',
      };

      const mockReviews = [
        {
          id: 'review1',
          tutorId: 'user123',
          studentId: 'student1',
          rating: 5,
          comment: 'Excellent tutor!',
          flagged: false,
          createdAt: new Date('2024-01-15'),
          student: {
            id: 'student1',
            name: 'Alice Smith',
          },
        },
        {
          id: 'review2',
          tutorId: 'user123',
          studentId: 'student2',
          rating: 4,
          comment: 'Very helpful',
          flagged: false,
          createdAt: new Date('2024-01-10'),
          student: {
            id: 'student2',
            name: 'Bob Johnson',
          },
        },
        {
          id: 'review3',
          tutorId: 'user123',
          studentId: 'student3',
          rating: 5,
          comment: 'Great experience',
          flagged: false,
          createdAt: new Date('2024-01-05'),
          student: {
            id: 'student3',
            name: 'Carol White',
          },
        },
      ];

      (TutorProfile.findById as jest.Mock).mockResolvedValue(mockProfile);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);

      const result = await tutorService.getProfileDetailById('profile123');

      expect(TutorProfile.findById).toHaveBeenCalledWith('profile123');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
        select: { name: true },
      });
      expect(prisma.review.findMany).toHaveBeenCalledWith({
        where: {
          tutorId: 'user123',
          flagged: false,
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

      expect(result).not.toBeNull();
      expect(result?.name).toBe('John Doe');
      expect(result?.reviews).toHaveLength(3);
      expect(result?.reviews[0].studentName).toBe('Alice Smith');
      expect(result?.ratingBreakdown).toEqual({
        5: 2,
        4: 1,
        3: 0,
        2: 0,
        1: 0,
      });
    });

    it('should return null if profile not found', async () => {
      (TutorProfile.findById as jest.Mock).mockResolvedValue(null);

      const result = await tutorService.getProfileDetailById('profile123');

      expect(result).toBeNull();
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(prisma.review.findMany).not.toHaveBeenCalled();
    });

    it('should exclude flagged reviews', async () => {
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
          address: 'New York, NY',
        },
        demoVideos: [],
        availability: [],
        rating: 4.5,
        totalReviews: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      const mockUser = {
        name: 'John Doe',
      };

      const mockReviews = [
        {
          id: 'review1',
          tutorId: 'user123',
          studentId: 'student1',
          rating: 5,
          comment: 'Excellent tutor!',
          flagged: false,
          createdAt: new Date(),
          student: {
            id: 'student1',
            name: 'Alice Smith',
          },
        },
        {
          id: 'review2',
          tutorId: 'user123',
          studentId: 'student2',
          rating: 4,
          comment: 'Very helpful',
          flagged: false,
          createdAt: new Date(),
          student: {
            id: 'student2',
            name: 'Bob Johnson',
          },
        },
      ];

      (TutorProfile.findById as jest.Mock).mockResolvedValue(mockProfile);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);

      const result = await tutorService.getProfileDetailById('profile123');

      expect(prisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            flagged: false,
          }),
        })
      );

      expect(result?.reviews).toHaveLength(2);
    });

    it('should update profile rating if it has changed', async () => {
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
          address: 'New York, NY',
        },
        demoVideos: [],
        availability: [],
        rating: 0, // Old rating
        totalReviews: 0, // Old count
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      const mockUser = {
        name: 'John Doe',
      };

      const mockReviews = [
        {
          id: 'review1',
          tutorId: 'user123',
          studentId: 'student1',
          rating: 5,
          comment: 'Excellent tutor!',
          flagged: false,
          createdAt: new Date(),
          student: {
            id: 'student1',
            name: 'Alice Smith',
          },
        },
        {
          id: 'review2',
          tutorId: 'user123',
          studentId: 'student2',
          rating: 4,
          comment: 'Very helpful',
          flagged: false,
          createdAt: new Date(),
          student: {
            id: 'student2',
            name: 'Bob Johnson',
          },
        },
      ];

      (TutorProfile.findById as jest.Mock).mockResolvedValue(mockProfile);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);

      await tutorService.getProfileDetailById('profile123');

      expect(mockProfile.save).toHaveBeenCalled();
      expect(mockProfile.rating).toBe(4.5); // (5 + 4) / 2
      expect(mockProfile.totalReviews).toBe(2);
    });

    it('should handle profile with no reviews', async () => {
      const mockProfile = {
        _id: 'profile123',
        userId: 'user123',
        bio: 'New tutor',
        qualifications: ['BSc'],
        subjects: [{ name: 'Mathematics', proficiency: 'intermediate' }],
        hourlyRate: 30,
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
          address: 'New York, NY',
        },
        demoVideos: [],
        availability: [],
        rating: 0,
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      const mockUser = {
        name: 'Jane Doe',
      };

      (TutorProfile.findById as jest.Mock).mockResolvedValue(mockProfile);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.review.findMany as jest.Mock).mockResolvedValue([]);

      const result = await tutorService.getProfileDetailById('profile123');

      expect(result).not.toBeNull();
      expect(result?.reviews).toHaveLength(0);
      expect(result?.ratingBreakdown).toEqual({
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      });
      expect(result?.rating).toBe(0);
      expect(result?.totalReviews).toBe(0);
    });
  });
});
