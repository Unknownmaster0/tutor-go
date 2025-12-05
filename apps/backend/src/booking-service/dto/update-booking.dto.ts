export interface UpdateBookingStatusDto {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}
