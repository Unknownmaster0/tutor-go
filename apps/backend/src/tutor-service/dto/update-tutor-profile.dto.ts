import { SubjectDto, LocationDto } from './create-tutor-profile.dto';

export interface UpdateTutorProfileDto {
  bio?: string;
  qualifications?: string[];
  subjects?: SubjectDto[];
  hourlyRate?: number;
  location?: LocationDto;
}
