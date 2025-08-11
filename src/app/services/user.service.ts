import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [];
  private currentUser: User | null = null;
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor() {
    // Datos de ejemplo para desarrollo
    this.users = [
      {
        id: '1',
        name: 'Usuario Demo',
        email: 'usuario@reservas.com',
        phone: '123456789',
        role: 'user',
        profileImageUrl: 'assets/images/user1.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Admin Demo',
        email: 'admin@reservas.com',
        phone: '987654321',
        role: 'admin',
        profileImageUrl: 'assets/images/admin.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Para desarrollo: iniciar sin usuario logueado
    // Descomenta la siguiente línea para auto-login durante desarrollo
    // this.currentUser = this.users[0];
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

  getCurrentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }
  
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  login(email: string, password: string): Observable<User | null> {
    console.log('Intentando login con:', { email, password });
    console.log('Usuarios disponibles:', this.users.map(u => ({ email: u.email, name: u.name })));
    
    // Simulación de login con validación básica de contraseña
    const user = this.users.find(u => u.email === email);
    
    if (user) {
      // Validación simple de contraseña para demo
      const validPasswords = {
        'usuario@reservas.com': 'user123',
        'admin@reservas.com': 'admin123'
      };
      
      if (validPasswords[email as keyof typeof validPasswords] === password) {
         this.currentUser = user;
         this.currentUserSubject.next(user);
         console.log('Login exitoso para:', user.name);
         return of(user);
       } else {
        console.log('Contraseña incorrecta para:', email);
        return of(null);
      }
    }
    
    console.log('Usuario no encontrado:', email);
    return of(null);
  }

  logout(): Observable<boolean> {
    this.currentUser = null;
    this.currentUserSubject.next(null);
    console.log('Logout realizado');
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
