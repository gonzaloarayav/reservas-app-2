import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Court } from '../models/court.model';

@Injectable({
  providedIn: 'root'
})
export class CourtService {
  private courts: Court[] = [];

  constructor() {
    // Datos de ejemplo para desarrollo
    this.courts = [
      {
        id: '1',
        name: 'Cancha Central',
        type: 'tennis',
        location: 'Complejo Deportivo Norte',
        description: 'Cancha principal de tenis con superficie de arcilla',
        pricePerHour: 25,
        lightingFeePerHour: 8,
        available: true,
        imageUrl: 'assets/images/court1.jpg',
        features: ['Iluminación', 'Vestuarios', 'Estacionamiento'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Cancha 2',
        type: 'tennis',
        location: 'Complejo Deportivo Norte',
        description: 'Cancha secundaria de tenis con superficie dura',
        pricePerHour: 20,
        lightingFeePerHour: 6,
        available: true,
        imageUrl: 'assets/images/court2-invalid.jpg',
        features: ['Iluminación', 'Vestuarios'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Cancha de Paddle',
        type: 'paddle',
        location: 'Complejo Deportivo Sur',
        description: 'Cancha de paddle con paredes de cristal',
        pricePerHour: 30,
        lightingFeePerHour: 10,
        available: true,
        imageUrl: 'assets/images/court3.jpg',
        features: ['Iluminación', 'Vestuarios', 'Cafetería'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  getCourts(): Observable<Court[]> {
    return of(this.courts);
  }

  getCourtById(id: string): Observable<Court | undefined> {
    const court = this.courts.find(c => c.id === id);
    return of(court);
  }

  getCourtsByType(type: Court['type']): Observable<Court[]> {
    const filteredCourts = this.courts.filter(c => c.type === type);
    return of(filteredCourts);
  }

  createCourt(court: Court): Observable<Court> {
    const newCourt = {
      ...court,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.courts.push(newCourt);
    return of(newCourt);
  }

  updateCourt(id: string, court: Partial<Court>): Observable<Court | undefined> {
    const index = this.courts.findIndex(c => c.id === id);
    if (index !== -1) {
      this.courts[index] = {
        ...this.courts[index],
        ...court,
        updatedAt: new Date()
      };
      return of(this.courts[index]);
    }
    return of(undefined);
  }

  deleteCourt(id: string): Observable<boolean> {
    const index = this.courts.findIndex(c => c.id === id);
    if (index !== -1) {
      this.courts.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}
