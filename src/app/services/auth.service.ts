import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Simular usuario logueado (en producción esto vendría del backend)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Observable<User> {
    // Simulación de login (en producción esto sería una llamada HTTP)
    return new Observable(observer => {
      setTimeout(() => {
        const mockUser: User = {
          id: '1',
          name: 'Administrador',
          email: email,
          role: email === 'admin@reservas.com' ? 'admin' : 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        this.currentUserSubject.next(mockUser);
        observer.next(mockUser);
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  hasRole(role: 'admin' | 'user'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}