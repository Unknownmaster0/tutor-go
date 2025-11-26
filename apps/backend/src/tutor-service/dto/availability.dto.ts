export interface AvailabilitySlotDto {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

export interface SetAvailabilityDto {
  availability: AvailabilitySlotDto[];
}
