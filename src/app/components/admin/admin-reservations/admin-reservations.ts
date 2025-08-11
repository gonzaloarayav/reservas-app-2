import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { Reservation } from '../../../models/reservation.model';
import { Court } from '../../../models/court.model';
import { User } from '../../../models/user.model';
import { ReservationService } from '../../../services/reservation.service';
import { CourtService } from '../../../services/court.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './admin-reservations.html',
  styleUrl: './admin-reservations.css'
})
export class AdminReservations implements OnInit {
  reservations: Reservation[] = [];
  courts: Court[] = [];
  users: User[] = [];
  filteredReservations: Reservation[] = [];
  selection = new SelectionModel<Reservation>(true, []);
  
  displayedColumns: string[] = ['select', 'date', 'time', 'court', 'user', 'status', 'actions'];
  
  filterStatus: string = 'all';
  filterCourt: string = 'all';
  searchTerm: string = '';
  filterDateFrom: Date | null = null;
  filterDateTo: Date | null = null;

  constructor(
    private reservationService: ReservationService,
    private courtService: CourtService,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.reservationService.getReservations().subscribe(reservations => {
      this.reservations = reservations;
      this.applyFilters();
    });

    this.courtService.getCourts().subscribe(courts => {
      this.courts = courts;
    });

    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  applyFilters(): void {
    this.filteredReservations = this.reservations.filter(reservation => {
      const matchesStatus = this.filterStatus === 'all' || reservation.status === this.filterStatus;
      const matchesCourt = this.filterCourt === 'all' || reservation.courtId === this.filterCourt;
      const matchesSearch = this.searchTerm === '' || 
        this.getCourtName(reservation.courtId).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getUserName(reservation.userId).toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const reservationDate = new Date(reservation.date);
      const matchesDateFrom = !this.filterDateFrom || reservationDate >= this.filterDateFrom;
      const matchesDateTo = !this.filterDateTo || reservationDate <= this.filterDateTo;
      
      return matchesStatus && matchesCourt && matchesSearch && matchesDateFrom && matchesDateTo;
    });
    
    // Limpiar selección cuando se aplican filtros
    this.selection.clear();
  }

  getCourtName(courtId: string): string {
    const court = this.courts.find(c => c.id === courtId);
    return court ? court.name : 'Cancha no encontrada';
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.name : 'Usuario no encontrado';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed': return 'primary';
      case 'pending': return 'accent';
      case 'cancelled': return 'warn';
      case 'completed': return '';
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

  updateReservationStatus(reservation: Reservation, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed'): void {
    this.reservationService.updateReservation(reservation.id || '', { status: newStatus }).subscribe(() => {
      this.loadData();
    });
  }

  deleteReservation(reservation: Reservation): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      this.reservationService.deleteReservation(reservation.id!).subscribe(() => {
        this.loadData();
      });
    }
  }

  formatTime(time: string): string {
    return time.substring(0, 5); // Mostrar solo HH:MM
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES');
  }

  // Métodos para selección múltiple
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.filteredReservations.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.filteredReservations.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: Reservation): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  // Métodos para acciones masivas
  hasSelectedReservations(): boolean {
    return this.selection.selected.length > 0;
  }

  getSelectedCount(): number {
    return this.selection.selected.length;
  }

  cancelSelectedReservations(): void {
    const selectedReservations = this.selection.selected;
    const confirmMessage = `¿Estás seguro de que quieres cancelar ${selectedReservations.length} reserva(s) seleccionada(s)?`;
    
    if (confirm(confirmMessage)) {
      const cancelPromises = selectedReservations.map(reservation => 
        this.reservationService.updateReservation(reservation.id || '', { status: 'cancelled' })
      );

      Promise.all(cancelPromises).then(() => {
        this.selection.clear();
        this.loadData();
      });
    }
  }

  deleteSelectedReservations(): void {
    const selectedReservations = this.selection.selected;
    const confirmMessage = `¿Estás seguro de que quieres eliminar ${selectedReservations.length} reserva(s) seleccionada(s)? Esta acción no se puede deshacer.`;
    
    if (confirm(confirmMessage)) {
      const deletePromises = selectedReservations.map(reservation => 
        this.reservationService.deleteReservation(reservation.id!)
      );

      Promise.all(deletePromises).then(() => {
        this.selection.clear();
        this.loadData();
      });
    }
  }

  clearFilters(): void {
    this.filterStatus = 'all';
    this.filterCourt = 'all';
    this.searchTerm = '';
    this.filterDateFrom = null;
    this.filterDateTo = null;
    this.applyFilters();
  }
}