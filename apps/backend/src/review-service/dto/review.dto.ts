export interface CreateReviewDto {
  tutorId: string;
  studentId: string;
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface ReviewResponseDto {
  id: string;
  tutorId: string;
  studentId: string;
  bookingId: string;
  rating: number;
  comment: string | null;
  flagged: boolean;
  createdAt: Date;
}

export interface FlagReviewDto {
  reviewId: string;
  flagged: boolean;
}
