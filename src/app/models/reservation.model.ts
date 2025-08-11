export interface Reservation {
  id?: string;
  courtId: string;
  userId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  basePrice: number;
  lightingFee?: number;
  totalPrice: number;
  hasLighting: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
