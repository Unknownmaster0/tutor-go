import { TutorService } from '../services/tutor.service';
import { GeocodingService } from '../services/geocoding.service';
import { CloudinaryService } from '../services/cloudinary.service';
import { TutorProfile } from '../../shared/database';

// Mock dependencies
jest.mock('../../shared/database', () => ({
  TutorProfile: {
    findOne: jest.fn(),
  },
}));

jest.mock('../services/cloudinary.service');

describe('TutorService - Video Upload', () => {
  let tutorService: TutorService;
  let geocodingService: GeocodingService;
  let cloudinaryService: CloudinaryService;

  beforeEach(() => {
    jest.clearAllMocks();
    geocodingService = new GeocodingService();
    cloudinaryService = new CloudinaryService();
    tutorService = new TutorService(geocodingService, cloudinaryService);
  });

  describe('uploadDemoVideo', () => {
    it('should upload video successfully', async () => {
      const mockFile = {
        fieldname: 'video',
        originalname: 'demo.mp4',
        encoding: '7bit',
        mimetype: 'video/mp4',
        buffer: Buffer.from('mock video data'),
        size: 1024 * 1024, // 1MB
      } as Express.Multer.File;

      const mockProfile = {
        userId: 'user123',
        demoVideos: [],
        save: jest.fn().mockResolvedValue(true),
      };

      const mockVideoUrl = 'https://cloudinary.com/video/demo.mp4';

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);
      (cloudinaryService.validateVideoFile as jest.Mock).mockReturnValue({ valid: true });
      (cloudinaryService.uploadVideo as jest.Mock).mockResolvedValue(mockVideoUrl);

      const result = await tutorService.uploadDemoVideo('user123', mockFile);

      expect(TutorProfile.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(cloudinaryService.validateVideoFile).toHaveBeenCalledWith(mockFile);
      expect(cloudinaryService.uploadVideo).toHaveBeenCalledWith(mockFile);
      expect(mockProfile.demoVideos).toContain(mockVideoUrl);
      expect(mockProfile.save).toHaveBeenCalled();
      expect(result).toBe(mockVideoUrl);
    });

    it('should throw error if profile not found', async () => {
      const mockFile = {
        fieldname: 'video',
        originalname: 'demo.mp4',
        encoding: '7bit',
        mimetype: 'video/mp4',
        buffer: Buffer.from('mock video data'),
        size: 1024 * 1024,
      } as Express.Multer.File;

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(null);

      await expect(tutorService.uploadDemoVideo('user123', mockFile)).rejects.toThrow(
        'Tutor profile not found'
      );
    });

    it('should throw error if video file is invalid', async () => {
      const mockFile = {
        fieldname: 'video',
        originalname: 'demo.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        buffer: Buffer.from('mock data'),
        size: 1024,
      } as Express.Multer.File;

      const mockProfile = {
        userId: 'user123',
        demoVideos: [],
      };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);
      (cloudinaryService.validateVideoFile as jest.Mock).mockReturnValue({
        valid: false,
        error: 'Invalid file format',
      });

      await expect(tutorService.uploadDemoVideo('user123', mockFile)).rejects.toThrow(
        'Invalid file format'
      );
    });

    it('should throw error if file size exceeds limit', async () => {
      const mockFile = {
        fieldname: 'video',
        originalname: 'demo.mp4',
        encoding: '7bit',
        mimetype: 'video/mp4',
        buffer: Buffer.from('mock video data'),
        size: 200 * 1024 * 1024, // 200MB
      } as Express.Multer.File;

      const mockProfile = {
        userId: 'user123',
        demoVideos: [],
      };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);
      (cloudinaryService.validateVideoFile as jest.Mock).mockReturnValue({
        valid: false,
        error: 'File size exceeds maximum allowed size of 100MB',
      });

      await expect(tutorService.uploadDemoVideo('user123', mockFile)).rejects.toThrow(
        'File size exceeds maximum allowed size of 100MB'
      );
    });
  });

  describe('deleteDemoVideo', () => {
    it('should delete video successfully', async () => {
      const videoUrl = 'https://cloudinary.com/video/demo.mp4';
      const mockProfile = {
        userId: 'user123',
        demoVideos: [videoUrl, 'https://cloudinary.com/video/demo2.mp4'],
        save: jest.fn().mockResolvedValue(true),
      };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);
      (cloudinaryService.deleteVideo as jest.Mock).mockResolvedValue(undefined);

      await tutorService.deleteDemoVideo('user123', videoUrl);

      expect(TutorProfile.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(cloudinaryService.deleteVideo).toHaveBeenCalledWith(videoUrl);
      expect(mockProfile.demoVideos).not.toContain(videoUrl);
      expect(mockProfile.demoVideos).toHaveLength(1);
      expect(mockProfile.save).toHaveBeenCalled();
    });

    it('should throw error if profile not found', async () => {
      (TutorProfile.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        tutorService.deleteDemoVideo('user123', 'https://cloudinary.com/video/demo.mp4')
      ).rejects.toThrow('Tutor profile not found');
    });

    it('should throw error if video not found in profile', async () => {
      const mockProfile = {
        userId: 'user123',
        demoVideos: ['https://cloudinary.com/video/demo2.mp4'],
      };

      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockProfile);

      await expect(
        tutorService.deleteDemoVideo('user123', 'https://cloudinary.com/video/demo.mp4')
      ).rejects.toThrow('Video not found in profile');
    });
  });
});
