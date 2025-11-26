export interface SubjectDto {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'expert';
}

export interface LocationDto {
  address: string;
  coordinates?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface CreateTutorProfileDto {
  userId: string;
  bio: string;
  qualifications: string[];
  subjects: SubjectDto[];
  hourlyRate: number;
  location: LocationDto;
}
