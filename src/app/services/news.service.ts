import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { News } from '../models/news.model';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private mockNews: News[] = [
    {
      id: '1',
      title: 'Nuevo Torneo de Tenis - Inscripciones Abiertas',
      summary: 'Se abre la inscripción para el torneo anual de tenis del club. ¡No te lo pierdas!',
      content: 'Estamos emocionados de anunciar que las inscripciones para nuestro torneo anual de tenis ya están abiertas. El evento se realizará del 15 al 20 de marzo y contará con diferentes categorías para todos los niveles.',
      imageUrl: 'assets/img/tournament.jpg',
      author: 'Administración del Club',
      publishDate: new Date('2024-01-15'),
      category: 'tournament',
      featured: true
    },
    {
      id: '2',
      title: 'Mantenimiento Programado - Cancha 3',
      summary: 'La cancha 3 estará en mantenimiento del 20 al 22 de enero.',
      content: 'Informamos que la cancha 3 estará cerrada por mantenimiento preventivo desde el 20 hasta el 22 de enero. Durante este período, la cancha no estará disponible para reservas.',
      imageUrl: 'assets/img/maintenance-invalid.jpg',
      author: 'Equipo de Mantenimiento',
      publishDate: new Date('2024-01-18'),
      category: 'maintenance',
      featured: false
    },
    {
      id: '3',
      title: 'Nuevos Horarios de Atención',
      summary: 'A partir del 1 de febrero, el club tendrá nuevos horarios de atención.',
      content: 'A partir del 1 de febrero, nuestros horarios de atención serán de lunes a viernes de 6:00 AM a 10:00 PM, y fines de semana de 7:00 AM a 9:00 PM.',
      imageUrl: 'assets/img/schedule.jpg',
      author: 'Gerencia',
      publishDate: new Date('2024-01-20'),
      category: 'announcement',
      featured: true
    },
    {
      id: '4',
      title: 'Clases de Tenis para Principiantes',
      summary: 'Nuevas clases grupales para principiantes todos los sábados.',
      content: 'Iniciamos clases grupales de tenis para principiantes todos los sábados a las 9:00 AM. Las clases incluyen equipamiento básico y están dirigidas por instructores certificados.',
      imageUrl: 'assets/img/lessons-invalid.jpg',
      author: 'Instructor Principal',
      publishDate: new Date('2024-01-22'),
      category: 'event',
      featured: true
    },
    {
      id: '5',
      title: 'Mejoras en las Instalaciones',
      summary: 'Hemos renovado los vestuarios y agregado nuevas comodidades.',
      content: 'Nos complace anunciar que hemos completado la renovación de los vestuarios, incluyendo nuevas duchas, casilleros y un área de descanso mejorada.',
      imageUrl: 'assets/img/facilities.jpg',
      author: 'Administración del Club',
      publishDate: new Date('2024-01-25'),
      category: 'general',
      featured: false
    }
  ];

  constructor() { }

  getNews(): Observable<News[]> {
    return of(this.mockNews);
  }

  getFeaturedNews(): Observable<News[]> {
    const featuredNews = this.mockNews.filter(news => news.featured);
    return of(featuredNews);
  }

  getNewsByCategory(category: string): Observable<News[]> {
    const filteredNews = this.mockNews.filter(news => news.category === category);
    return of(filteredNews);
  }

  getNewsById(id: string): Observable<News | undefined> {
    const news = this.mockNews.find(news => news.id === id);
    return of(news);
  }

  getLatestNews(limit: number = 3): Observable<News[]> {
    const sortedNews = this.mockNews
      .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime())
      .slice(0, limit);
    return of(sortedNews);
  }
}