import { Schema, model, Document } from 'mongoose';

export interface ISubject {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'expert';
}

export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

export interface IAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

export interface ITutorProfile extends Document {
  userId: string;
  bio: string;
  qualifications: string[];
  subjects: ISubject[];
  hourlyRate: number;
  location: ILocation;
  demoVideos: string[];
  availability: IAvailability[];
  rating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: {
      type: String,
      required: true,
    },
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      required: true,
    },
  },
  { _id: false }
);

const LocationSchema = new Schema<ILocation>(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (v: number[]) {
          return v.length === 2;
        },
        message: 'Coordinates must be an array of [longitude, latitude]',
      },
    },
    address: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const AvailabilitySchema = new Schema<IAvailability>(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
  },
  { _id: false }
);

const TutorProfileSchema = new Schema<ITutorProfile>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    bio: {
      type: String,
      required: true,
    },
    qualifications: {
      type: [String],
      default: [],
    },
    subjects: {
      type: [SubjectSchema],
      required: true,
      validate: {
        validator: function (v: ISubject[]) {
          return v.length > 0;
        },
        message: 'At least one subject is required',
      },
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: LocationSchema,
      required: true,
    },
    demoVideos: {
      type: [String],
      default: [],
    },
    availability: {
      type: [AvailabilitySchema],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
TutorProfileSchema.index({ location: '2dsphere' });

// Create index for subject names
TutorProfileSchema.index({ 'subjects.name': 1 });

// Create compound index for rating and hourly rate (for filtering)
TutorProfileSchema.index({ rating: -1, hourlyRate: 1 });

export const TutorProfile = model<ITutorProfile>('TutorProfile', TutorProfileSchema);
