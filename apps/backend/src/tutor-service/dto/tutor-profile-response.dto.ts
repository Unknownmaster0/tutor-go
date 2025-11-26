import { SubjectDto } from './create-tutor-profile.dto';
import { ILocation } from '../../shared/database';

export interface AvailabilityDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface TutorProfileResponseDto {
  id: string;
  userId: string;
  name?: string;
  bio: string;
  qualifications: string[];
  subjects: SubjectDto[];
  hourlyRate: number;
  location: ILocation;
  demoVideos: string[];
  availability: AvailabilityDto[];
  rating: number;
  totalReviews: number;
  distance?: number;
  createdAt: Date;
  updatedAt: Date;
}
