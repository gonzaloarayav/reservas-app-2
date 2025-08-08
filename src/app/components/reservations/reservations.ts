import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, combineLatest, map } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ReservationService } from '../../services/reservation.service';
import { CourtService } from '../../services/court.service';
import { UserService } from '../../services/user.service';
import { Reservation } from '../../models/reservation.model';
import { Court } from '../../models/court.model';

interface ReservationWithCourt extends Reservation {
  court?: Court;
}

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css'
})
export class Reservations implements OnInit {
  reservationsWithCourts$!: Observable<ReservationWithCourt[]>;
  upcomingReservations$!: Observable<ReservationWithCourt[]>;
  pastReservations$!: Observable<ReservationWithCourt[]>;
  isLoggedIn = false;
  userId: string | null = null;
  
  private reservationService = inject(ReservationService);
  private courtService = inject(CourtService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.isLoggedIn = this.userService.isLoggedIn();
    this.userId = this.userService.getCurrentUser()?.id || null;

    if (this.isLoggedIn && this.userId) {
      this.loadReservations();
    }
  }

  loadReservations(): void {
    // Get all reservations for the current user
    const reservations$ = this.reservationService.getReservationsByUserId(this.userId!);
    const courts$ = this.courtService.getCourts();

    // Combine reservations with court details
    this.reservationsWithCourts$ = combineLatest([reservations$, courts$]).pipe(
      map(([reservations, courts]) => {
        return reservations.map(reservation => {
          const court = courts.find(c => c.id === reservation.courtId);
          return { ...reservation, court };
        });
      })
    );

    const now = new Date();

    // Filter for upcoming reservations
    this.upcomingReservations$ = this.reservationsWithCourts$.pipe(
      map(reservations => {
        return reservations.filter(res => {
          const reservationDate = new Date(res.date);
          return reservationDate >= now ||
                 (reservationDate.toDateString() === now.toDateString() &&
                  res.status !== 'completed' && res.status !== 'cancelled');
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      })
    );

    // Filter for past reservations
    this.pastReservations$ = this.reservationsWithCourts$.pipe(
      map(reservations => {
        return reservations.filter(res => {
          const reservationDate = new Date(res.date);
          return reservationDate < now ||
                 (reservationDate.toDateString() === now.toDateString() &&
                  (res.status === 'completed' || res.status === 'cancelled'));
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      })
    );
  }

  cancelReservation(reservationId: string | undefined): void {
    if (!reservationId) {
      this.snackBar.open('ID de reserva no válido', 'Cerrar', {
        duration: 3000
      });
      return;
    }
    
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      this.reservationService.updateReservation(reservationId, { status: 'cancelled' })
        .subscribe({
          next: () => {
            this.snackBar.open('Reserva cancelada con éxito', 'Cerrar', {
              duration: 3000
            });
            this.loadReservations();
          },
          error: (error) => {
            this.snackBar.open('Error al cancelar la reserva', 'Cerrar', {
              duration: 3000
            });
            console.error('Error cancelling reservation:', error);
          }
        });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      default: return status;
    }
  }

  formatDate(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(time: string): string {
    // Assuming time is in format like "14:00"
    return time;
  }
}
