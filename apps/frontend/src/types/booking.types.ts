export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
}

export interface BookingFormData {
  tutorId: string;
  subject: string;
  startTime: Date;
  endTime: Date;
}

export interface Booking {
  id: string;
  tutorId: string;
  studentId: string;
  tutorName?: string;
  studentName?: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  totalAmount: number;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingResponse {
  booking: Booking;
  message: string;
}

export interface BookingListResponse {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
}

export interface BookingFilters {
  status?: BookingStatus;
  startDate?: Date;
  endDate?: Date;
  subject?: string;
}
