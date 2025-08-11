export interface CourtBlock {
  id?: string;
  courtId: string;
  startDate: Date;
  endDate: Date;
  startTime?: string; // HH:mm format
  endTime?: string;   // HH:mm format
  reason: string;
  type: 'maintenance' | 'event' | 'closure' | 'other';
  isAllDay: boolean;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourtAvailability {
  courtId: string;
  date: Date;
  availableSlots: TimeSlot[];
  blockedSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isBlocked: boolean;
  blockReason?: string;
}