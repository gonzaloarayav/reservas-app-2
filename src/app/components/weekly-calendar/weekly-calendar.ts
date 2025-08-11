import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CourtService } from '../../services/court.service';
import { ReservationService } from '../../services/reservation.service';
import { UserService } from '../../services/user.service';
import { Court } from '../../models/court.model';
import { Reservation } from '../../models/reservation.model';

interface TimeSlot {
  time: string;
  hour: number;
}

interface CalendarDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
}

interface CalendarCell {
  court: Court;
  day: CalendarDay;
  timeSlot: TimeSlot;
  isReserved: boolean;
  reservation?: Reservation;
  isAvailable: boolean;
}

@Component({
  selector: 'app-weekly-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weekly-calendar.html',
  styleUrls: ['./weekly-calendar.css']
})
export class WeeklyCalendar implements OnInit {
  courts: Court[] = [];
  reservations: Reservation[] = [];
  currentWeek: CalendarDay[] = [];
  timeSlots: TimeSlot[] = [];
  calendarCells: CalendarCell[][] = [];
  currentWeekStart: Date = new Date();

  constructor(
    private courtService: CourtService,
    private reservationService: ReservationService,
    private userService: UserService,
    private router: Router
  ) {
    this.generateTimeSlots();
  }

  ngOnInit() {
    this.loadData();
    this.setCurrentWeek();
  }

  loadData() {
    this.courtService.getCourts().subscribe(courts => {
      this.courts = courts;
      this.generateCalendar();
    });

    this.reservationService.getReservations().subscribe(reservations => {
      this.reservations = reservations;
      this.generateCalendar();
    });
  }

  generateTimeSlots() {
    this.timeSlots = [];
    for (let hour = 8; hour <= 22; hour++) {
      this.timeSlots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour: hour
      });
    }
  }

  setCurrentWeek(startDate?: Date) {
    const start = startDate || new Date();
    const monday = new Date(start);
    monday.setDate(start.getDate() - start.getDay() + 1);
    
    this.currentWeekStart = monday;
    this.currentWeek = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      
      this.currentWeek.push({
        date: day,
        dayName: day.toLocaleDateString('es-ES', { weekday: 'short' }),
        dayNumber: day.getDate(),
        isToday: this.isToday(day)
      });
    }

    this.generateCalendar();
  }

  generateCalendar() {
    // Este método ya no es necesario con el nuevo template simplificado
    // La lógica se maneja directamente en los métodos auxiliares
  }

  findReservation(courtId: string, date: Date, time: string): Reservation | undefined {
    return this.reservations.find(reservation => 
      reservation.courtId === courtId &&
      this.isSameDate(reservation.date, date) &&
      reservation.startTime === time &&
      reservation.status !== 'cancelled'
    );
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  isToday(date: Date): boolean {
    return this.isSameDate(date, new Date());
  }

  isFutureSlot(date: Date, hour: number): boolean {
    const now = new Date();
    const slotDateTime = new Date(date);
    slotDateTime.setHours(hour, 0, 0, 0);
    return slotDateTime > now;
  }

  // Métodos auxiliares para el nuevo template
  isReservedForCourtAndTime(court: Court, day: CalendarDay, timeSlot: TimeSlot): boolean {
    return !!this.findReservation(court.id!, day.date, timeSlot.time);
  }

  isAvailableForCourtAndTime(court: Court, day: CalendarDay, timeSlot: TimeSlot): boolean {
    const reservation = this.findReservation(court.id!, day.date, timeSlot.time);
    return court.available && !reservation && this.isFutureSlot(day.date, timeSlot.hour);
  }

  getCellClassForCourtAndTime(court: Court, day: CalendarDay, timeSlot: TimeSlot): string {
    let classes = ['calendar-cell'];
    
    const isReserved = this.isReservedForCourtAndTime(court, day, timeSlot);
    const isAvailable = this.isAvailableForCourtAndTime(court, day, timeSlot);
    
    if (isReserved) {
      classes.push('reserved');
    } else if (isAvailable) {
      classes.push('available');
    } else {
      classes.push('unavailable');
    }
    
    if (day.isToday) {
      classes.push('today');
    }
    
    return classes.join(' ');
  }

  getReservationInfoForCourtAndTime(court: Court, day: CalendarDay, timeSlot: TimeSlot): string {
    const reservation = this.findReservation(court.id!, day.date, timeSlot.time);
    if (reservation) {
      return `Reservado hasta ${reservation.endTime}`;
    }
    return '';
  }

  onCellClickForCourtAndTime(court: Court, day: CalendarDay, timeSlot: TimeSlot) {
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const isAvailable = this.isAvailableForCourtAndTime(court, day, timeSlot);
    if (!isAvailable) {
      return;
    }

    // Navegar al formulario de reserva con parámetros
    const dateStr = day.date.toISOString().split('T')[0];
    this.router.navigate(['/reserve', court.id], {
      queryParams: {
        date: dateStr,
        time: timeSlot.time
      }
    });
  }

  previousWeek() {
    const newStart = new Date(this.currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    this.setCurrentWeek(newStart);
  }

  nextWeek() {
    const newStart = new Date(this.currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    this.setCurrentWeek(newStart);
  }

  getCurrentWeekRange(): string {
    const start = this.currentWeekStart;
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.getDate()} - ${end.getDate()} de ${start.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
  }

  getCellClass(cell: CalendarCell): string {
    let classes = ['calendar-cell'];
    
    if (cell.isReserved) {
      classes.push('reserved');
    } else if (cell.isAvailable) {
      classes.push('available');
    } else {
      classes.push('unavailable');
    }
    
    if (cell.day.isToday) {
      classes.push('today');
    }
    
    return classes.join(' ');
  }

  getReservationInfo(cell: CalendarCell): string {
    if (cell.reservation) {
      return `Reservado hasta ${cell.reservation.endTime}`;
    }
    return '';
  }
}