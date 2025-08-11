import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { ReservationService } from '../../../services/reservation.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css'
})
export class AdminUsers implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  userReservationCounts: { [userId: string]: number } = {};
  
  displayedColumns: string[] = ['name', 'email', 'role', 'reservations', 'createdAt', 'actions'];
  
  filterRole: string = 'all';
  searchTerm: string = '';

  constructor(
    private userService: UserService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadReservationCounts();
  }

  private loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.applyFilters();
    });
  }

  private loadReservationCounts(): void {
    this.reservationService.getReservations().subscribe(reservations => {
      this.userReservationCounts = {};
      reservations.forEach(reservation => {
        if (this.userReservationCounts[reservation.userId]) {
          this.userReservationCounts[reservation.userId]++;
        } else {
          this.userReservationCounts[reservation.userId] = 1;
        }
      });
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesRole = this.filterRole === 'all' || user.role === this.filterRole;
      const matchesSearch = this.searchTerm === '' || 
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesRole && matchesSearch;
    });
  }

  getRoleColor(role: string): string {
    return role === 'admin' ? 'accent' : 'primary';
  }

  getRoleText(role: string): string {
    return role === 'admin' ? 'Administrador' : 'Usuario';
  }

  getAdminCount(): number {
    return this.users.filter(u => u.role === 'admin').length;
  }

  getRegularUserCount(): number {
    return this.users.filter(u => u.role === 'user').length;
  }

  getUserReservationCount(userId: string): number {
    return this.userReservationCounts[userId] || 0;
  }

  toggleUserRole(user: User): void {
    const newRole: 'admin' | 'user' = user.role === 'admin' ? 'user' : 'admin';
    const updatedUser: Partial<User> = { role: newRole };
    
    if (confirm(`¿Estás seguro de cambiar el rol de ${user.name} a ${this.getRoleText(newRole)}?`)) {
      this.userService.updateUser(user.id || '', updatedUser).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  deleteUser(user: User): void {
    if (user.role === 'admin') {
      alert('No se puede eliminar un usuario administrador');
      return;
    }

    if (confirm(`¿Estás seguro de que quieres eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`)) {
      this.userService.deleteUser(user.id || '').subscribe(() => {
        this.loadUsers();
        this.loadReservationCounts();
      });
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES');
  }

  viewUserDetails(user: User): void {
    // Aquí podrías abrir un modal con más detalles del usuario
    console.log('Ver detalles de:', user);
  }
}