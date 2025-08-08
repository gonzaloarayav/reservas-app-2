import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UserService } from '../../services/user.service';
import { ReservationService } from '../../services/reservation.service';
import { User } from '../../models/user.model';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,
    MatSnackBarModule
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit {
  user: User | null = null;
  isLoggedIn = false;
  isEditing = false;
  editedUser: Partial<User> = {};
  reservationsCount = 0;
  
  constructor(
    private userService: UserService,
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.isLoggedIn = this.userService.isLoggedIn();
    if (this.isLoggedIn) {
      this.loadUserProfile();
      this.loadReservationsCount();
    }
  }
  
  loadUserProfile(): void {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.user = currentUser;
      // Initialize edited user with current values
      this.editedUser = {
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        profileImageUrl: currentUser.profileImageUrl
      };
    }
  }
  
  loadReservationsCount(): void {
    if (this.user && this.user.id) {
      this.reservationService.getReservationsByUserId(this.user.id).subscribe({
        next: (reservations: Reservation[]) => {
          this.reservationsCount = reservations.length;
        },
        error: (error: any) => {
          console.error('Error loading reservations count:', error);
        }
      });
    }
  }
  
  startEditing(): void {
    this.isEditing = true;
  }
  
  cancelEditing(): void {
    this.isEditing = false;
    // Reset edited user to current values
    if (this.user) {
      this.editedUser = {
        name: this.user.name,
        email: this.user.email,
        phone: this.user.phone,
        profileImageUrl: this.user.profileImageUrl
      };
    }
  }
  
  saveProfile(): void {
    if (this.user && this.user.id && this.editedUser) {
      this.userService.updateUser(this.user.id, this.editedUser).subscribe({
        next: (updatedUser: User | undefined) => {
          if (updatedUser) {
            this.user = updatedUser;
            this.isEditing = false;
            this.snackBar.open('Perfil actualizado con éxito', 'Cerrar', {
              duration: 3000
            });
          } else {
            this.snackBar.open('No se pudo actualizar el perfil', 'Cerrar', {
              duration: 3000
            });
          }
        },
        error: (error: any) => {
          this.snackBar.open('Error al actualizar el perfil', 'Cerrar', {
            duration: 3000
          });
          console.error('Error updating profile:', error);
        }
      });
    }
  }
  
  logout(): void {
    this.userService.logout();
    this.snackBar.open('Sesión cerrada con éxito', 'Cerrar', {
      duration: 3000
    });
    // Redirect to home page or login page
    window.location.href = '/';
  }
}
