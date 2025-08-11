import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CourtService } from '../../services/court.service';
import { ReservationService } from '../../services/reservation.service';
import { UserService } from '../../services/user.service';
import { Court } from '../../models/court.model';
import { Reservation } from '../../models/reservation.model';
import { User } from '../../models/user.model';

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
  
  // Modal de confirmación de reserva
  showReservationModal = false;
  selectedCourt: Court | null = null;
  selectedDay: CalendarDay | null = null;
  selectedTimeSlot: TimeSlot | null = null;
  isCreatingReservation = false;
  
  // Notificaciones
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

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
    // Generate fixed 1.5 hour time blocks: 8:00-9:30, 9:30-11:00, etc.
    const startHour = 8;
    const endHour = 21;
    let currentTime = startHour * 60; // Convert to minutes
    
    while (currentTime + 90 <= endHour * 60) { // 90 minutes = 1.5 hours
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      const timeString = `${hours}:${minutes.toString().padStart(2, '0')}`;
      
      this.timeSlots.push({
        time: timeString,
        hour: hours + (minutes / 60) // Store as decimal for easier comparison
      });
      
      currentTime += 90; // Add 1.5 hours (90 minutes)
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
    
    // Convert decimal hour back to hours and minutes
    const wholeHours = Math.floor(hour);
    const minutes = Math.round((hour - wholeHours) * 60);
    
    slotDateTime.setHours(wholeHours, minutes, 0, 0);
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

    // Crear reserva directamente con un solo click
    this.createDirectReservation(court, day, timeSlot);
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

  // Método para crear reserva directa con un click
  createDirectReservation(court: Court, day: CalendarDay, timeSlot: TimeSlot) {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Calcular hora de fin (1.5 horas después)
    const startTime = timeSlot.time;
    const endTime = this.calculateEndTime(startTime);

    // Calcular precios basado en el tipo de membresía
    const isMember = currentUser.membershipType === 'socio';
    const isAfter17 = timeSlot.hour >= 17;
    
    const basePrice = isMember ? 0 : court.pricePerHour * 1.5;
    const lightingFee = isMember ? 0 : (isAfter17 ? court.lightingFeePerHour * 1.5 : 0);
    const totalPrice = basePrice + lightingFee;

    const newReservation: Reservation = {
      courtId: court.id!,
      userId: currentUser.id!,
      date: day.date,
      startTime: startTime,
      endTime: endTime,
      status: 'confirmed',
      basePrice: basePrice,
      lightingFee: lightingFee,
      totalPrice: totalPrice,
      hasLighting: isAfter17,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.reservationService.createReservation(newReservation).subscribe({
      next: (reservation) => {
        // Agregar la nueva reserva a la lista local
        this.reservations.push(reservation);
        
        // Mostrar notificación de éxito
        this.showSuccessNotification(court, day, timeSlot, isMember, totalPrice);
      },
      error: (error) => {
        console.error('Error al crear la reserva:', error);
        this.showErrorNotification();
      }
    });
  }

  // Métodos para el modal de reserva (mantenidos para compatibilidad)
  closeReservationModal() {
    this.showReservationModal = false;
    this.selectedCourt = null;
    this.selectedDay = null;
    this.selectedTimeSlot = null;
    this.isCreatingReservation = false;
  }

  confirmReservation() {
    if (!this.selectedCourt || !this.selectedDay || !this.selectedTimeSlot) {
      return;
    }

    this.isCreatingReservation = true;
    
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      this.closeReservationModal();
      this.router.navigate(['/login']);
      return;
    }

    // Calcular hora de fin (1.5 horas después)
    const startTime = this.selectedTimeSlot.time;
    const endTime = this.calculateEndTime(startTime);

    // Calcular precios basado en el tipo de membresía
    const isMember = currentUser.membershipType === 'socio';
    const isAfter17 = this.selectedTimeSlot.hour >= 17;
    
    const basePrice = isMember ? 0 : this.selectedCourt.pricePerHour * 1.5;
    const lightingFee = isMember ? 0 : (isAfter17 ? this.selectedCourt.lightingFeePerHour * 1.5 : 0);
    const totalPrice = basePrice + lightingFee;

    const newReservation: Reservation = {
      courtId: this.selectedCourt.id!,
      userId: currentUser.id!,
      date: this.selectedDay.date,
      startTime: startTime,
      endTime: endTime,
      status: 'confirmed',
      basePrice: basePrice,
      lightingFee: lightingFee,
      totalPrice: totalPrice,
      hasLighting: isAfter17,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.reservationService.createReservation(newReservation).subscribe({
      next: (reservation) => {
        // Agregar la nueva reserva a la lista local
        this.reservations.push(reservation);
        this.closeReservationModal();
        
        // Mostrar mensaje de éxito (opcional)
        alert('¡Reserva creada exitosamente!');
      },
      error: (error) => {
        console.error('Error al crear la reserva:', error);
        alert('Error al crear la reserva. Por favor, inténtalo de nuevo.');
        this.isCreatingReservation = false;
      }
    });
  }

  private calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    // Agregar 1.5 horas (90 minutos)
    startDate.setMinutes(startDate.getMinutes() + 90);
    
    const endHours = startDate.getHours().toString().padStart(2, '0');
    const endMinutes = startDate.getMinutes().toString().padStart(2, '0');
    
    return `${endHours}:${endMinutes}`;
  }

  // Métodos auxiliares para el modal
  getReservationSummary(): any {
    if (!this.selectedCourt || !this.selectedTimeSlot) {
      return null;
    }

    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      return null;
    }

    const isMember = currentUser.membershipType === 'socio';
    const isAfter17 = this.selectedTimeSlot.hour >= 17;
    
    const basePrice = isMember ? 0 : this.selectedCourt.pricePerHour * 1.5;
    const lightingFee = isMember ? 0 : (isAfter17 ? this.selectedCourt.lightingFeePerHour * 1.5 : 0);
    const totalPrice = basePrice + lightingFee;

    return {
       courtName: this.selectedCourt.name,
       courtType: this.selectedCourt.type,
       date: this.selectedDay?.date.toLocaleDateString('es-ES'),
       startTime: this.selectedTimeSlot.time,
       endTime: this.calculateEndTime(this.selectedTimeSlot.time),
       duration: '1.5 horas',
       isMember,
       basePrice,
       lightingFee,
       totalPrice,
       hasLighting: isAfter17
     };
   }

   // Métodos para notificaciones
   showSuccessNotification(court: Court, day: CalendarDay, timeSlot: TimeSlot, isMember: boolean, totalPrice: number) {
     const endTime = this.calculateEndTime(timeSlot.time);
     const dateStr = day.date.toLocaleDateString('es-ES');
     
     if (isMember) {
       this.notificationMessage = `¡Reserva confirmada! ${court.name} - ${dateStr} de ${timeSlot.time} a ${endTime} (Gratis para socios)`;
     } else {
       this.notificationMessage = `¡Reserva confirmada! ${court.name} - ${dateStr} de ${timeSlot.time} a ${endTime} - Total: $${totalPrice}`;
     }
     
     this.notificationType = 'success';
     this.showNotification = true;
     
     // Ocultar notificación después de 5 segundos
     setTimeout(() => {
       this.hideNotification();
     }, 5000);
   }

   showErrorNotification() {
     this.notificationMessage = 'Error al crear la reserva. Por favor, inténtalo de nuevo.';
     this.notificationType = 'error';
     this.showNotification = true;
     
     // Ocultar notificación después de 5 segundos
     setTimeout(() => {
       this.hideNotification();
     }, 5000);
   }

   hideNotification() {
     this.showNotification = false;
     this.notificationMessage = '';
   }
 }