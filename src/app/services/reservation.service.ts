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
    this.reservations = [
      {
        id: '1',
        courtId: '1',
        userId: '1',
        date: new Date('2023-11-15'),
        startTime: '10:00',
        endTime: '11:00',
        status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        courtId: '2',
        userId: '1',
        date: new Date('2023-11-16'),
        startTime: '15:00',
        endTime: '16:00',
        status: 'pending',
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
