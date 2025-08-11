import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { ReservationService } from '../../../services/reservation.service';
import { CourtService } from '../../../services/court.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  stats = {
    totalReservations: 0,
    totalCourts: 0,
    totalUsers: 0,
    pendingReservations: 0
  };

  constructor(
    private reservationService: ReservationService,
    private courtService: CourtService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    // Cargar estadísticas del dashboard
    this.reservationService.getReservations().subscribe(reservations => {
      this.stats.totalReservations = reservations.length;
      this.stats.pendingReservations = reservations.filter(r => r.status === 'pending').length;
    });

    this.courtService.getCourts().subscribe(courts => {
      this.stats.totalCourts = courts.length;
    });

    this.userService.getUsers().subscribe(users => {
      this.stats.totalUsers = users.length;
    });
  }
}