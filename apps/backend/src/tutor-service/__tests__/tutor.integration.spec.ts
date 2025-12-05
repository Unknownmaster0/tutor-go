import { TutorService, GeocodingService, CloudinaryService } from '../services';

// Mock dependencies
jest.mock('../services/geocoding.service');
jest.mock('../services/cloudinary.service');

describe('Tutor Service - Integration Tests', () => {
  let mockTutorModel: any;
  let mockGeocodingService: jest.Mocked<GeocodingService>;
  let mockCloudinaryService: jest.Mocked<CloudinaryService>;
  let tutorService: TutorService;

  beforeAll(() => {
    // Mock Mongoose model
    mockTutorModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      aggregate: jest.fn(),
    };

    // Mock services
    mockGeocodingService = {
      geocodeAddress: jest.fn(),
      reverseGeocode: jest.fn(),
      calculateDistance: jest.fn(),
    } as any;

    mockCloudinaryService = {
      uploadVideo: jest.fn(),
      deleteVideo: jest.fn(),
    } as any;

    // Initialize services
    tutorService = new TutorService(mockGeocodingService, mockCloudinaryService);
    (tutorService as any).TutorProfile = mockTutorModel;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile Creation and Updates', () => {
    it('should successfully create a tutor profile with geocoded location', async () => {
      const profileData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        bio: 'Experienced math tutor with 10 years of teaching',
        qualifications: ['PhD in Mathematics', 'Teaching Certificate'],
        subjects: [
          { name: 'Mathematics', proficiency: 'expert' },
          { name: 'Physics', proficiency: 'intermediate' },
        ],
        hourlyRate: 50,
        location: {
          address: '123 Main St, New York, NY',
        },
      };

      const mockCoordinates = {
        latitude: 40.730610,
        longitude: -73.935242,
      };

      const mockProfile = {
        _id: 'profile123',
        ...profileData,
        location: {
          ...profileData.location,
          coordinates: {
            type: 'Point',
            coordinates: [mockCoordinates.longitude, mockCoordinates.latitude],
          },
        },
        rating: 0,
        totalReviews: 0,
        demoVideos: [],
        availability: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGeocodingService.geocodeAddress.mockResolvedValue(mockCoordinates);
      mockTutorModel.findOne.mockResolvedValue(null);
      mockTutorModel.create.mockResolvedValue(mockProfile);

      const result = await tutorService.createProfile(profileData as any);

      expect(result).toHaveProperty('_id');
      expect(result.bio).toBe(profileData.bio);
      expect(mockGeocodingService.geocodeAddress).toHaveBeenCalledWith(profileData.location.address);
      expect(mockTutorModel.create).toHaveBeenCalled();
    });

    it('should reject profile creation if profile already exists', async () => {
      const profileData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        bio: 'Test bio',
        qualifications: ['Test'],
        subjects: [{ name: 'Math', proficiency: 'expert' }],
        hourlyRate: 50,
        location: { address: 'Test Address' },
      };

      mockTutorModel.findOne.mockResolvedValue({ userId: profileData.userId });

      await expect(tutorService.createProfile(profileData as any)).rejects.toThrow();
      expect(mockTutorModel.create).not.toHaveBeenCalled();
    });

    it('should successfully update a tutor profile', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = {
        bio: 'Updated bio',
        hourlyRate: 60,
      };

      const mockUpdatedProfile = {
        _id: 'profile123',
        userId,
        ...updateData,
        qualifications: ['PhD'],
        subjects: [{ name: 'Math', proficiency: 'expert' }],
        location: {
          address: 'Test',
          coordinates: { type: 'Point', coordinates: [0, 0] },
        },
        rating: 4.5,
        totalReviews: 10,
      };

      mockTutorModel.findOneAndUpdate.mockResolvedValue(mockUpdatedProfile);

      const result = await tutorService.updateProfile(userId, updateData as any);

      expect(result.bio).toBe(updateData.bio);
      expect(result.hourlyRate).toBe(updateData.hourlyRate);
    });

    it('should update location and geocode new address', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = {
        location: {
          address: '456 New St, Boston, MA',
        },
      };

      const mockCoordinates = {
        latitude: 42.3601,
        longitude: -71.0589,
      };

      const mockUpdatedProfile = {
        _id: 'profile123',
        userId,
        location: {
          address: updateData.location.address,
          coordinates: {
            type: 'Point',
            coordinates: [mockCoordinates.longitude, mockCoordinates.latitude],
          },
        },
      };

      mockGeocodingService.geocodeAddress.mockResolvedValue(mockCoordinates);
      mockTutorModel.findOneAndUpdate.mockResolvedValue(mockUpdatedProfile);

      const result = await tutorService.updateProfile(userId, updateData as any);

      expect(mockGeocodingService.geocodeAddress).toHaveBeenCalledWith(updateData.location.address);
      expect(result.location.address).toBe(updateData.location.address);
    });
  });

  describe('Geospatial Search with Various Parameters', () => {
    it('should search tutors by location within radius', async () => {
      const searchParams = {
        latitude: 40.7128,
        longitude: -74.0060,
        radius: 10,
      };

      const mockTutors = [
        {
          _id: 'tutor1',
          userId: 'user1',
          name: 'John Tutor',
          bio: 'Math expert',
          subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
          hourlyRate: 50,
          rating: 4.5,
          totalReviews: 20,
          location: {
            address: '123 Main St',
            coordinates: { type: 'Point', coordinates: [-74.0060, 40.7128] },
          },
          distance: 5.2,
        },
        {
          _id: 'tutor2',
          userId: 'user2',
          name: 'Jane Tutor',
          bio: 'Physics expert',
          subjects: [{ name: 'Physics', proficiency: 'expert' }],
          hourlyRate: 60,
          rating: 4.8,
          totalReviews: 15,
          location: {
            address: '456 Oak Ave',
            coordinates: { type: 'Point', coordinates: [-74.0100, 40.7150] },
          },
          distance: 8.1,
        },
      ];

      mockTutorModel.aggregate.mockResolvedValue(mockTutors);

      const result = await tutorService.searchTutors(searchParams as any);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('distance');
      expect(mockTutorModel.aggregate).toHaveBeenCalled();
    });

    it('should filter tutors by subject', async () => {
      const searchParams = {
        latitude: 40.7128,
        longitude: -74.0060,
        radius: 10,
        subject: 'Mathematics',
      };

      const mockTutors = [
        {
          _id: 'tutor1',
          userId: 'user1',
          name: 'John Tutor',
          subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
          hourlyRate: 50,
          rating: 4.5,
          distance: 5.2,
        },
      ];

      mockTutorModel.aggregate.mockResolvedValue(mockTutors);

      const result = await tutorService.searchTutors(searchParams as any);

      expect(result).toHaveLength(1);
      expect(result[0].subjects[0].name).toBe('Mathematics');
    });

    it('should filter tutors by rate range', async () => {
      const searchParams = {
        latitude: 40.7128,
        longitude: -74.0060,
        radius: 10,
        minRate: 40,
        maxRate: 55,
      };

      const mockTutors = [
        {
          _id: 'tutor1',
          userId: 'user1',
          name: 'John Tutor',
          hourlyRate: 50,
          rating: 4.5,
          distance: 5.2,
        },
      ];

      mockTutorModel.aggregate.mockResolvedValue(mockTutors);

      const result = await tutorService.searchTutors(searchParams as any);

      expect(result[0].hourlyRate).toBeGreaterThanOrEqual(searchParams.minRate);
      expect(result[0].hourlyRate).toBeLessThanOrEqual(searchParams.maxRate);
    });

    it('should filter tutors by minimum rating', async () => {
      const searchParams = {
        latitude: 40.7128,
        longitude: -74.0060,
        radius: 10,
        minRating: 4.5,
      };

      const mockTutors = [
        {
          _id: 'tutor1',
          userId: 'user1',
          name: 'John Tutor',
          hourlyRate: 50,
          rating: 4.8,
          distance: 5.2,
        },
      ];

      mockTutorModel.aggregate.mockResolvedValue(mockTutors);

      const result = await tutorService.searchTutors(searchParams as any);

      expect(result[0].rating).toBeGreaterThanOrEqual(searchParams.minRating);
    });

    it('should return empty array when no tutors match criteria', async () => {
      const searchParams = {
        latitude: 40.7128,
        longitude: -74.0060,
        radius: 1,
      };

      mockTutorModel.aggregate.mockResolvedValue([]);

      const result = await tutorService.searchTutors(searchParams as any);

      expect(result).toHaveLength(0);
    });
  });

  describe('Video Upload and Retrieval', () => {
    it('should successfully upload a demo video', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockVideoUrl = 'https://cloudinary.com/videos/demo123.mp4';
      const mockFile = {
        path: '/tmp/video.mp4',
        mimetype: 'video/mp4',
      } as Express.Multer.File;

      const mockProfile = {
        _id: 'profile123',
        userId,
        demoVideos: [],
        save: jest.fn().mockResolvedValue({
          _id: 'profile123',
          userId,
          demoVideos: [mockVideoUrl],
        }),
      };

      mockCloudinaryService.uploadVideo.mockResolvedValue(mockVideoUrl);
      mockTutorModel.findOne.mockResolvedValue(mockProfile);

      const result = await tutorService.uploadDemoVideo(userId, mockFile);

      expect(result).toBe(mockVideoUrl);
      expect(mockCloudinaryService.uploadVideo).toHaveBeenCalled();
      expect(mockProfile.save).toHaveBeenCalled();
    });

    it('should reject video upload if profile does not exist', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockFile = {
        path: '/tmp/video.mp4',
        mimetype: 'video/mp4',
      } as Express.Multer.File;

      mockTutorModel.findOne.mockResolvedValue(null);

      await expect(tutorService.uploadDemoVideo(userId, mockFile)).rejects.toThrow();
      expect(mockCloudinaryService.uploadVideo).not.toHaveBeenCalled();
    });

    it('should retrieve tutor profile with demo videos', async () => {
      const tutorId = 'profile123';
      const mockProfile = {
        _id: tutorId,
        userId: 'user123',
        name: 'John Tutor',
        bio: 'Experienced tutor',
        demoVideos: [
          'https://cloudinary.com/videos/demo1.mp4',
          'https://cloudinary.com/videos/demo2.mp4',
        ],
        subjects: [{ name: 'Math', proficiency: 'expert' }],
        hourlyRate: 50,
        rating: 4.5,
        totalReviews: 20,
      };

      mockTutorModel.findById.mockResolvedValue(mockProfile);

      const result = await tutorService.getProfileById(tutorId);

      expect(result.demoVideos).toHaveLength(2);
    });
  });

  describe('Complete Tutor Profile Flow', () => {
    it('should create profile, upload video, and retrieve complete profile', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      // Step 1: Create profile
      const profileData = {
        userId,
        bio: 'Experienced tutor',
        qualifications: ['PhD'],
        subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
        hourlyRate: 50,
        location: { address: '123 Main St' },
      };

      const mockCoordinates = {
        latitude: 40.730610,
        longitude: -73.935242,
      };

      const mockProfile = {
        _id: 'profile123',
        ...profileData,
        location: {
          ...profileData.location,
          coordinates: {
            type: 'Point',
            coordinates: [mockCoordinates.longitude, mockCoordinates.latitude],
          },
        },
        rating: 0,
        totalReviews: 0,
        demoVideos: [],
      };

      mockGeocodingService.geocodeAddress.mockResolvedValue(mockCoordinates);
      mockTutorModel.findOne.mockResolvedValueOnce(null);
      mockTutorModel.create.mockResolvedValue(mockProfile);

      const createResult = await tutorService.createProfile(profileData as any);
      expect(createResult).toHaveProperty('_id');

      // Step 2: Upload video
      const mockVideoUrl = 'https://cloudinary.com/videos/demo.mp4';
      const mockFile = {
        path: '/tmp/video.mp4',
        mimetype: 'video/mp4',
      } as Express.Multer.File;

      const profileWithVideo = {
        ...mockProfile,
        demoVideos: [],
        save: jest.fn().mockResolvedValue({
          ...mockProfile,
          demoVideos: [mockVideoUrl],
        }),
      };

      mockCloudinaryService.uploadVideo.mockResolvedValue(mockVideoUrl);
      mockTutorModel.findOne.mockResolvedValueOnce(profileWithVideo);

      const uploadResult = await tutorService.uploadDemoVideo(userId, mockFile);
      expect(uploadResult).toBe(mockVideoUrl);

      // Step 3: Retrieve complete profile
      const completeProfile = {
        ...mockProfile,
        demoVideos: [mockVideoUrl],
      };

      mockTutorModel.findById.mockResolvedValue(completeProfile);

      const getResult = await tutorService.getProfileById(mockProfile._id);
      expect(getResult.demoVideos).toContain(mockVideoUrl);
    });
  });
});
