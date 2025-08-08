import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CourtService } from '../../services/court.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private courtService = inject(CourtService);
  
  featuredCourts$ = this.courtService.getCourts();
  
  // Características principales de la aplicación
  features = [
    {
      icon: 'event_available',
      title: 'Reservas Fáciles',
      description: 'Reserva tu cancha favorita en segundos con nuestro sistema intuitivo.'
    },
    {
      icon: 'sports_tennis',
      title: 'Múltiples Deportes',
      description: 'Canchas disponibles para tenis, paddle, basketball y más.'
    },
    {
      icon: 'notifications',
      title: 'Notificaciones',
      description: 'Recibe recordatorios de tus próximas reservas.'
    },
    {
      icon: 'calendar_today',
      title: 'Gestión de Horarios',
      description: 'Visualiza la disponibilidad en tiempo real y elige el mejor horario.'
    }
  ];
}
