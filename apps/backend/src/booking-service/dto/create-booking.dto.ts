export interface CreateBookingDto {
  tutorId: string;
  studentId: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  totalAmount: number;
}

export interface BookingResponseDto {
  id: string;
  tutorId: string;
  studentId: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}
