export interface Court {
  id?: string;
  name: string;
  type: 'tennis' | 'paddle' | 'basketball' | 'football' | 'other';
  location: string;
  description?: string;
  pricePerHour: number;
  lightingFeePerHour: number;
  available: boolean;
  imageUrl?: string;
  features?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}