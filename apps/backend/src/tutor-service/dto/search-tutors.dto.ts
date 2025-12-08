export interface SearchTutorsDto {
  latitude: number;
  longitude: number;
  radius: number; // in kilometers
  subject?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
}

export interface SearchTutorsResponseDto {
  tutors: any[];
  total: number;
  page: number;
  limit: number;
}
