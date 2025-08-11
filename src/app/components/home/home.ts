import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CourtService } from '../../services/court.service';
import { NewsService } from '../../services/news.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  private courtService = inject(CourtService);
  private newsService = inject(NewsService);
  private cdr = inject(ChangeDetectorRef);
  
  featuredCourts$ = this.courtService.getCourts();
  latestNews$ = this.newsService.getLatestNews(3);

  // Carousel properties
  currentSlide = 0;
  carouselInterval: any;
  
  heroSlides = [
    {
      image: 'assets/img/tennis-court-1.jpg',
      title: 'Reserva tu cancha de tenis fácilmente',
      subtitle: 'Sistema de reservas online para canchas deportivas',
      primaryAction: 'Ver Canchas',
      secondaryAction: 'Mis Reservas'
    },
    {
      image: 'assets/img/paddle-court.jpg',
      title: 'Canchas de paddle disponibles',
      subtitle: 'Disfruta del paddle en nuestras modernas instalaciones',
      primaryAction: 'Ver Canchas',
      secondaryAction: 'Reservar Ahora'
    },
    {
      image: 'assets/img/basketball-court.jpg',
      title: 'Basketball y más deportes',
      subtitle: 'Múltiples opciones deportivas para toda la familia',
      primaryAction: 'Explorar',
      secondaryAction: 'Contactar'
    }
  ];
  
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

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'general': 'primary',
      'tournament': 'accent',
      'maintenance': 'warn',
      'event': 'primary',
      'announcement': 'accent'
    };
    return colors[category] || 'primary';
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'general': 'General',
      'tournament': 'Torneo',
      'maintenance': 'Mantenimiento',
      'event': 'Evento',
      'announcement': 'Anuncio'
    };
    return labels[category] || 'General';
  }

  ngOnInit() {
    this.startCarousel();
  }

  ngOnDestroy() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  startCarousel() {
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 3000); // Cambia cada 3 segundos
  }

  restartCarousel() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    this.startCarousel();
  }

  pauseCarousel() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  resumeCarousel() {
    this.startCarousel();
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
    console.log('Carousel moved to slide:', this.currentSlide);
    this.cdr.detectChanges();
  }

  prevSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.heroSlides.length - 1 : this.currentSlide - 1;
    this.cdr.detectChanges();
    this.restartCarousel();
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.cdr.detectChanges();
    this.restartCarousel();
  }

  onImageError(event: any) {
    const img = event.target;
    const container = img.parentElement;
    const fallback = container.querySelector('.news-image-fallback, .court-image-fallback');
    
    if (img && fallback) {
      img.style.display = 'none';
      fallback.style.display = 'flex';
    }
  }
}
