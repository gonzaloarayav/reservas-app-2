export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  password?: string; // Solo para autenticación, no para almacenamiento
  role: 'admin' | 'user';
  membershipType: 'socio' | 'no_socio';
  profileImageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}