export interface UploadVideoDto {
  tutorId: string;
  video: Express.Multer.File;
}

export interface UploadVideoResponseDto {
  videoUrl: string;
  message: string;
}
