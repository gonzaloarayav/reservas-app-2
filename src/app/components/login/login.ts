import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.userService.login(this.email, this.password).subscribe({
      next: (user: User | null) => {
        this.isLoading = false;
        console.log('Respuesta del login:', user);
        
        if (user) {
          console.log('Login exitoso, redirigiendo...');
          if (user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          console.log('Login fallido - credenciales incorrectas');
          this.errorMessage = 'Email o contraseña incorrectos';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error en login:', error);
        this.errorMessage = 'Error al iniciar sesión';
      }
    });
  }

  loginAsAdmin(): void {
    this.email = 'admin@reservas.com';
    this.password = 'admin123';
    this.onSubmit();
  }

  loginAsUser(): void {
    this.email = 'usuario@reservas.com';
    this.password = 'user123';
    this.onSubmit();
  }
}