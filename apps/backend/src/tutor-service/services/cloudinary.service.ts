import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export class CloudinaryService {
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly ALLOWED_FORMATS = ['mp4', 'mov', 'avi', 'webm'];

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadVideo(file: Express.Multer.File): Promise<string> {
    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Validate file format
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExtension || !this.ALLOWED_FORMATS.includes(fileExtension)) {
      throw new Error(`Invalid file format. Allowed formats: ${this.ALLOWED_FORMATS.join(', ')}`);
    }

    try {
      // Upload to Cloudinary
      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            folder: 'tutorgo/demo-videos',
            format: fileExtension,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as UploadApiResponse);
          }
        );

        uploadStream.end(file.buffer);
      });

      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload video to cloud storage');
    }
  }

  async deleteVideo(videoUrl: string): Promise<void> {
    try {
      // Extract public ID from URL
      const publicId = this.extractPublicId(videoUrl);
      
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
      }
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error('Failed to delete video from cloud storage');
    }
  }

  private extractPublicId(url: string): string | null {
    // Extract public ID from Cloudinary URL
    // Example: https://res.cloudinary.com/demo/video/upload/v1234567890/tutorgo/demo-videos/video.mp4
    const match = url.match(/\/v\d+\/(.+)\.\w+$/);
    return match ? match[1] : null;
  }

  validateVideoFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      };
    }

    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExtension || !this.ALLOWED_FORMATS.includes(fileExtension)) {
      return {
        valid: false,
        error: `Invalid file format. Allowed formats: ${this.ALLOWED_FORMATS.join(', ')}`,
      };
    }

    return { valid: true };
  }
}
