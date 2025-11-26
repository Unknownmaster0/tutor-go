export interface Review {
  id: string;
  tutorId: string;
  studentId: string;
  bookingId: string;
  studentName: string;
  rating: number;
  comment: string;
  flagged: boolean;
  createdAt: string;
}

export interface ReviewFormData {
  bookingId: string;
  tutorId: string;
  rating: number;
  comment: string;
}

export interface ReviewSubmissionResponse {
  review: Review;
  message: string;
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  averageRating: number;
}
