export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  password?: string; // Solo para autenticación, no para almacenamiento
  role: 'admin' | 'user';
  profileImageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}