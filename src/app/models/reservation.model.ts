export interface Reservation {
  id?: string;
  courtId: string;
  userId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
