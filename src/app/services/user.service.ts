import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [];
  private currentUser: User | null = null;

  constructor() {
    // Datos de ejemplo para desarrollo
    this.users = [
      {
        id: '1',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '123456789',
        role: 'user',
        profileImageUrl: 'assets/images/user1.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Admin',
        email: 'admin@example.com',
        phone: '987654321',
        role: 'admin',
        profileImageUrl: 'assets/images/admin.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Establecer usuario actual para desarrollo
    this.currentUser = this.users[0];
  }

  getUsers(): Observable<User[]> {
    return of(this.users);
  }

  getUserById(id: string): Observable<User | undefined> {
    const user = this.users.find(u => u.id === id);
    return of(user);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
  
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  login(email: string, password: string): Observable<User | null> {
    // Simulación de login
    const user = this.users.find(u => u.email === email);
    if (user) {
      this.currentUser = user;
      return of(user);
    }
    return of(null);
  }

  logout(): Observable<boolean> {
    this.currentUser = null;
    return of(true);
  }

  createUser(user: User): Observable<User> {
    const newUser = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return of(newUser);
  }

  updateUser(id: string, user: Partial<User>): Observable<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = {
        ...this.users[index],
        ...user,
        updatedAt: new Date()
      };

      // Actualizar usuario actual si es el mismo
      if (this.currentUser && this.currentUser.id === id) {
        this.currentUser = this.users[index];
      }

      return of(this.users[index]);
    }
    return of(undefined);
  }

  deleteUser(id: string): Observable<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      // Si es el usuario actual, hacer logout
      if (this.currentUser && this.currentUser.id === id) {
        this.currentUser = null;
      }

      this.users.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}
