import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Reservations } from './components/reservations/reservations';
import { Courts } from './components/courts/courts';
import { UserProfile } from './components/user-profile/user-profile';
import { CourtDetail } from './components/court-detail/court-detail';
import { ReservationForm } from './components/reservation-form/reservation-form';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'reservations', component: Reservations },
  { path: 'reservations/new', component: ReservationForm },
  { path: 'courts', component: Courts },
  { path: 'courts/:id', component: CourtDetail },
  { path: 'profile', component: UserProfile },
  { path: '**', redirectTo: '' } // Ruta para manejar rutas no encontradas
];
