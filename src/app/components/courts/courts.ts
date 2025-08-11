import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { CourtService } from '../../services/court.service';
import { UserService } from '../../services/user.service';
import { Court } from '../../models/court.model';

@Component({
  selector: 'app-courts',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './courts.html',
  styleUrl: './courts.css'
})
export class Courts implements OnInit {
  courts$!: Observable<Court[]>;
  filteredCourts$!: Observable<Court[]>;
  
  // Filter options
  courtTypes = ['Tenis', 'Pádel', 'Fútbol', 'Básquetbol', 'Voleibol'];
  selectedType: string = '';
  searchQuery: string = '';
  
  private courtService = inject(CourtService);
  private userService = inject(UserService);

  isLoggedIn() {
    return this.userService.isLoggedIn();
  }
  
  ngOnInit(): void {
    this.courts$ = this.courtService.getCourts();
    this.filteredCourts$ = this.courts$;
  }
  
  applyFilters(): void {
    // Obtener todas las canchas y filtrarlas en el cliente
    this.courts$ = this.courtService.getCourts();
    this.filteredCourts$ = this.courts$;
  }
  
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedType = '';
    this.filteredCourts$ = this.courts$;
  }

  onImageError(event: any): void {
    // Simplemente ocultar la imagen y mostrar el fallback
    const imgElement = event.target;
    imgElement.style.display = 'none';
    
    // Buscar el contenedor de fallback y mostrarlo
    const container = imgElement.closest('.court-image-container');
    if (container) {
      const fallback = container.querySelector('.court-image-fallback');
      if (fallback) {
        (fallback as HTMLElement).style.display = 'flex';
      }
    }
  }
}
