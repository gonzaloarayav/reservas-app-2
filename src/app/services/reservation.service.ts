import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Reservation } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private reservations: Reservation[] = [];

  constructor() {
    // Datos de ejemplo para desarrollo
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    this.reservations = [
      // Reservas de usuario socio (gratis)
      {
        id: '1',
        courtId: '1',
        userId: '1', // Usuario socio
        date: today,
        startTime: '10:00',
        endTime: '11:30',
        status: 'confirmed',
        basePrice: 0,
        lightingFee: 0,
        totalPrice: 0,
        hasLighting: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        courtId: '2',
        userId: '1', // Usuario socio
        date: today,
        startTime: '15:00',
        endTime: '16:30',
        status: 'confirmed',
        basePrice: 0,
        lightingFee: 0,
        totalPrice: 0,
        hasLighting: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Reservas de admin socio (gratis)
      {
        id: '3',
        courtId: '1',
        userId: '2', // Admin socio
        date: tomorrow,
        startTime: '09:00',
        endTime: '10:30',
        status: 'confirmed',
        basePrice: 0,
        lightingFee: 0,
        totalPrice: 0,
        hasLighting: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Reservas de usuario no socio (con precio)
      {
        id: '4',
        courtId: '3',
        userId: '3', // Usuario no socio
        date: tomorrow,
        startTime: '18:00',
        endTime: '19:30',
        status: 'confirmed',
        basePrice: 45,
        lightingFee: 15,
        totalPrice: 60,
        hasLighting: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        courtId: '2',
        userId: '3', // Usuario no socio
        date: dayAfterTomorrow,
        startTime: '11:00',
        endTime: '12:30',
        status: 'confirmed',
        basePrice: 30,
        lightingFee: 0,
        totalPrice: 30,
        hasLighting: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  getReservations(): Observable<Reservation[]> {
    return of(this.reservations);
  }

  getReservationById(id: string): Observable<Reservation | undefined> {
    const reservation = this.reservations.find(r => r.id === id);
    return of(reservation);
  }

  getReservationsByUserId(userId: string): Observable<Reservation[]> {
    const userReservations = this.reservations.filter(r => r.userId === userId);
    return of(userReservations);
  }

  getReservationsByCourtId(courtId: string): Observable<Reservation[]> {
    const courtReservations = this.reservations.filter(r => r.courtId === courtId);
    return of(courtReservations);
  }

  createReservation(reservation: Reservation): Observable<Reservation> {
    const newReservation = {
      ...reservation,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.reservations.push(newReservation);
    return of(newReservation);
  }

  updateReservation(id: string, reservation: Partial<Reservation>): Observable<Reservation | undefined> {
    const index = this.reservations.findIndex(r => r.id === id);
    if (index !== -1) {
      this.reservations[index] = {
        ...this.reservations[index],
        ...reservation,
        updatedAt: new Date()
      };
      return of(this.reservations[index]);
    }
    return of(undefined);
  }

  deleteReservation(id: string): Observable<boolean> {
    const index = this.reservations.findIndex(r => r.id === id);
    if (index !== -1) {
      this.reservations.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}
