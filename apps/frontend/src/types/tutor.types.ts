export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

export interface Subject {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'expert';
}

export interface TutorProfile {
  id: string;
  userId: string;
  name: string;
  bio: string;
  qualifications: string[];
  subjects: Subject[];
  hourlyRate: number;
  location: Location;
  demoVideos: string[];
  rating: number;
  totalReviews: number;
  distance?: number;
}

export interface SearchFilters {
  latitude: number;
  longitude: number;
  radius: number;
  subject?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
}

export interface SearchResponse {
  tutors: TutorProfile[];
  total: number;
  page: number;
  limit: number;
}
