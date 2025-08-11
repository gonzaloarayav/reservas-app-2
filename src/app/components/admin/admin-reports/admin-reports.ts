import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../services/reservation.service';
import { CourtService } from '../../../services/court.service';
import { UserService } from '../../../services/user.service';
import { Reservation } from '../../../models/reservation.model';
import { Court } from '../../../models/court.model';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.css'
})
export class AdminReports implements OnInit {
  reservations: Reservation[] = [];
  courts: Court[] = [];
  
  selectedPeriod: string = 'month';
  
  // Estadísticas calculadas
  stats = {
    totalRevenue: 0,
    totalReservations: 0,
    averageReservationValue: 0,
    mostPopularCourt: '',
    reservationsByStatus: {
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0
    },
    reservationsByCourtType: {} as { [key: string]: number },
    monthlyRevenue: [] as { month: string, revenue: number }[]
  };

  constructor(
    private reservationService: ReservationService,
    private courtService: CourtService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.reservationService.getReservations().subscribe(reservations => {
      this.reservations = reservations;
      this.calculateStats();
    });

    this.courtService.getCourts().subscribe(courts => {
      this.courts = courts;
      this.calculateStats();
    });
  }

  calculateStats(): void {
    if (this.reservations.length === 0 || this.courts.length === 0) return;

    // Filtrar reservaciones por período
    const filteredReservations = this.filterReservationsByPeriod();

    // Calcular ingresos totales
    this.stats.totalRevenue = this.calculateTotalRevenue(filteredReservations);
    
    // Total de reservaciones
    this.stats.totalReservations = filteredReservations.length;
    
    // Valor promedio por reservación
    this.stats.averageReservationValue = this.stats.totalReservations > 0 
      ? this.stats.totalRevenue / this.stats.totalReservations 
      : 0;

    // Cancha más popular
    this.stats.mostPopularCourt = this.getMostPopularCourt(filteredReservations);

    // Reservaciones por estado
    this.stats.reservationsByStatus = {
      pending: filteredReservations.filter(r => r.status === 'pending').length,
      confirmed: filteredReservations.filter(r => r.status === 'confirmed').length,
      cancelled: filteredReservations.filter(r => r.status === 'cancelled').length,
      completed: filteredReservations.filter(r => r.status === 'completed').length
    };

    // Reservaciones por tipo de cancha
    this.calculateReservationsByCourtType(filteredReservations);

    // Ingresos mensuales (últimos 6 meses)
    this.calculateMonthlyRevenue();
  }

  filterReservationsByPeriod(): Reservation[] {
    const now = new Date();
    const startDate = new Date();

    switch (this.selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return this.reservations;
    }

    return this.reservations.filter(r => new Date(r.date) >= startDate);
  }

  calculateTotalRevenue(reservations: Reservation[]): number {
    return reservations.reduce((total, reservation) => {
      const court = this.courts.find(c => c.id === reservation.courtId);
      if (court && (reservation.status === 'confirmed' || reservation.status === 'completed')) {
        const hours = this.calculateHours(reservation.startTime, reservation.endTime);
        return total + (court.pricePerHour * hours);
      }
      return total;
    }, 0);
  }

  calculateHours(startTime: string, endTime: string): number {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  getMostPopularCourt(reservations: Reservation[]): string {
    const courtCounts: { [courtId: string]: number } = {};
    
    reservations.forEach(r => {
      courtCounts[r.courtId] = (courtCounts[r.courtId] || 0) + 1;
    });

    const mostPopularCourtId = Object.keys(courtCounts).reduce((a, b) => 
      courtCounts[a] > courtCounts[b] ? a : b, '');

    const court = this.courts.find(c => c.id === mostPopularCourtId);
    return court ? court.name : 'N/A';
  }

  calculateReservationsByCourtType(reservations: Reservation[]): void {
    this.stats.reservationsByCourtType = {};
    
    reservations.forEach(reservation => {
      const court = this.courts.find(c => c.id === reservation.courtId);
      if (court) {
        const type = this.getCourtTypeLabel(court.type);
        this.stats.reservationsByCourtType[type] = 
          (this.stats.reservationsByCourtType[type] || 0) + 1;
      }
    });
  }

  calculateMonthlyRevenue(): void {
    const monthlyData: { [month: string]: number } = {};
    const now = new Date();
    
    // Últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = 0;
    }

    this.reservations.forEach(reservation => {
      const reservationDate = new Date(reservation.date);
      const monthKey = reservationDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      
      if (monthlyData.hasOwnProperty(monthKey) && 
          (reservation.status === 'confirmed' || reservation.status === 'completed')) {
        const court = this.courts.find(c => c.id === reservation.courtId);
        if (court) {
          const hours = this.calculateHours(reservation.startTime, reservation.endTime);
          monthlyData[monthKey] += court.pricePerHour * hours;
        }
      }
    });

    this.stats.monthlyRevenue = Object.entries(monthlyData).map(([month, revenue]) => ({
      month,
      revenue
    }));
  }

  getCourtTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'tennis': 'Tenis',
      'paddle': 'Pádel',
      'basketball': 'Básquetbol',
      'football': 'Fútbol',
      'other': 'Otro'
    };
    return types[type] || type;
  }

  onPeriodChange(): void {
    this.calculateStats();
  }

  exportReport(): void {
    // Aquí podrías implementar la exportación a PDF o Excel
    console.log('Exportando reporte...', this.stats);
    alert('Funcionalidad de exportación en desarrollo');
  }

  getMonthBarHeight(revenue: number): number {
    if (this.stats.monthlyRevenue.length === 0) return 0;
    const maxRevenue = Math.max(...this.stats.monthlyRevenue.map(m => m.revenue));
    return maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
  }
}