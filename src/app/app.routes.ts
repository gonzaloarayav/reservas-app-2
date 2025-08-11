import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Reservations } from './components/reservations/reservations';
import { Courts } from './components/courts/courts';
import { CourtDetail } from './components/court-detail/court-detail';
import { UserProfile } from './components/user-profile/user-profile';
import { ReservationForm } from './components/reservation-form/reservation-form';
import { Login } from './components/login/login';
import { WeeklyCalendar } from './components/weekly-calendar/weekly-calendar';
import { AdminDashboard } from './components/admin/admin-dashboard/admin-dashboard';
import { AdminReservations } from './components/admin/admin-reservations/admin-reservations';
import { AdminCourts } from './components/admin/admin-courts/admin-courts';
import { AdminUsers } from './components/admin/admin-users/admin-users';
import { AdminReports } from './components/admin/admin-reports/admin-reports';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'calendar', component: WeeklyCalendar },
  { path: 'reservations', component: Reservations, canActivate: [AuthGuard] },
  { path: 'courts', component: Courts },
  { path: 'courts/:id', component: CourtDetail },
  { path: 'profile', component: UserProfile, canActivate: [AuthGuard] },
  { path: 'reserve/:courtId', component: ReservationForm, canActivate: [AuthGuard] },
  { path: 'reservations/new', component: ReservationForm, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminDashboard, canActivate: [AdminGuard] },
  { path: 'admin/reservations', component: AdminReservations, canActivate: [AdminGuard] },
  { path: 'admin/courts', component: AdminCourts, canActivate: [AdminGuard] },
  { path: 'admin/users', component: AdminUsers, canActivate: [AdminGuard] },
  { path: 'admin/reports', component: AdminReports, canActivate: [AdminGuard] }
];
