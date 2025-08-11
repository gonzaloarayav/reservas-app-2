import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CourtService } from '../../services/court.service';
import { ReservationService } from '../../services/reservation.service';
import { UserService } from '../../services/user.service';
import { Court } from '../../models/court.model';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './reservation-form.html',
  styleUrls: ['./reservation-form.css']
})
export class ReservationForm implements OnInit {
  reservationForm!: FormGroup;
  courts: Court[] = [];
  selectedCourt: Court | undefined;
  loading = true;
  submitting = false;
  error = false;
  isLoggedIn = false;
  userId: string | null = null;
  preselectedCourtId: string | null = null;
  timeSlots: string[] = [];
  availableTimeSlots: string[] = [];

  constructor(
    private fb: FormBuilder,
    private courtService: CourtService,
    private reservationService: ReservationService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.userService.isLoggedIn();
    this.userId = this.userService.getCurrentUser()?.id || null;

    if (!this.isLoggedIn || !this.userId) {
      return;
    }

    // Generate fixed 1.5 hour time blocks: 8:00-9:30, 9:30-11:00, etc.
    const startHour = 8;
    const endHour = 21;
    let currentTime = startHour * 60; // Convert to minutes
    
    while (currentTime + 90 <= endHour * 60) { // 90 minutes = 1.5 hours
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      const timeString = `${hours}:${minutes.toString().padStart(2, '0')}`;
      this.timeSlots.push(timeString);
      currentTime += 90; // Add 1.5 hours (90 minutes)
    }

    this.initForm();
    this.loadCourts();

    // Check if a court ID was passed in the URL (either as route param or query param)
    this.route.params.subscribe(params => {
      this.preselectedCourtId = params['courtId'] || null;
      this.selectPreselectedCourt();
    });

    this.route.queryParams.subscribe(params => {
      if (!this.preselectedCourtId) {
        this.preselectedCourtId = params['courtId'] || null;
        this.selectPreselectedCourt();
      }
    });
  }

  initForm(): void {
    this.reservationForm = this.fb.group({
      courtId: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      duration: [1.5, [Validators.required]], // Fixed duration of 1.5 hours
      notes: [''],
    });

    // Listen for court changes
    this.reservationForm.get('courtId')?.valueChanges.subscribe(courtId => {
      if (courtId) {
        this.onCourtChange(courtId);
      }
    });

    // Listen for date changes to update available time slots
    this.reservationForm.get('date')?.valueChanges.subscribe(date => {
      if (date && this.selectedCourt) {
        this.updateAvailableTimeSlots(date);
      }
    });
    
    // Listen for startTime changes
    this.reservationForm.get('startTime')?.valueChanges.subscribe(startTime => {
      // You could add additional logic here if needed
    });
  }

  loadCourts(): void {
    this.loading = true;
    this.courtService.getCourts().subscribe({
      next: (courts) => {
        this.courts = courts;
        this.loading = false;
        
        // If there's a preselected court ID from the URL, select it
        if (this.preselectedCourtId) {
          this.selectPreselectedCourt();
        }
      },
      error: (err) => {
        console.error('Error loading courts:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private selectPreselectedCourt(): void {
    if (this.preselectedCourtId && this.courts.length > 0) {
      this.onCourtChange(this.preselectedCourtId);
      this.reservationForm.patchValue({ courtId: this.preselectedCourtId });
    }
  }

  onCourtChange(courtId: string): void {
    this.selectedCourt = this.courts.find(court => court.id === courtId);
    
    // Reset time slot if date is already selected
    const selectedDate = this.reservationForm.get('date')?.value;
    if (selectedDate) {
      this.updateAvailableTimeSlots(selectedDate);
    }
  }

  updateAvailableTimeSlots(date: Date): void {
    // In a real app, you would check the database for existing reservations
    // For now, we'll just simulate some time slots being unavailable
    this.availableTimeSlots = [...this.timeSlots];
    
    // Simulate some random unavailable slots
    const unavailableSlots = Math.floor(Math.random() * 5); // 0-4 unavailable slots
    for (let i = 0; i < unavailableSlots; i++) {
      const randomIndex = Math.floor(Math.random() * this.availableTimeSlots.length);
      this.availableTimeSlots.splice(randomIndex, 1);
    }

    // If the currently selected time is not available, reset it
    const currentTime = this.reservationForm.get('startTime')?.value;
    if (currentTime && !this.availableTimeSlots.includes(currentTime)) {
      this.reservationForm.patchValue({ startTime: '' });
    }
  }

  onSubmit(): void {
    if (this.reservationForm.invalid) {
      return;
    }

    this.submitting = true;
    const formValues = this.reservationForm.value;
    
    // Combine date and time
    const reservationDate = new Date(formValues.date);
    const [hours, minutes] = formValues.startTime.split(':').map(Number);
    reservationDate.setHours(hours, minutes, 0, 0);
    
    // Calculate end time based on start time and duration (1.5 hours)
    const [startHour, startMinute] = formValues.startTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = startTotalMinutes + (formValues.duration * 60);
    const endHour = Math.floor(endTotalMinutes / 60);
    const endMinute = endTotalMinutes % 60;
    const endTime = `${endHour}:${endMinute.toString().padStart(2, '0')}`;

    // Calculate pricing - only charge non-members
    const currentUser = this.userService.getCurrentUser();
    const isNonMember = currentUser?.membershipType === 'no_socio';
    
    const basePrice = isNonMember ? this.selectedCourt!.pricePerHour * formValues.duration : 0;
    const hasLighting = startHour >= 17; // Lighting fee applies after 17:00
    const lightingFee = (isNonMember && hasLighting) ? this.selectedCourt!.lightingFeePerHour * formValues.duration : 0;
    const totalPrice = basePrice + lightingFee;

    const reservation: Reservation = {
      userId: this.userId!,
      courtId: formValues.courtId,
      date: reservationDate,
      startTime: formValues.startTime,
      endTime: endTime,
      status: 'confirmed',
      notes: formValues.notes || '',
      basePrice: basePrice,
      lightingFee: lightingFee,
      totalPrice: totalPrice,
      hasLighting: hasLighting
    };

    this.reservationService.createReservation(reservation).subscribe({
      next: (createdReservation) => {
        this.submitting = false;
        this.snackBar.open('Reserva creada con éxito', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
        this.router.navigate(['/reservations']);
      },
      error: (err) => {
        console.error('Error creating reservation:', err);
        this.submitting = false;
        this.snackBar.open('Error al crear la reserva', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      }
    });
  }

  getMinDate(): Date {
    const today = new Date();
    return today;
  }

  getMaxDate(): Date {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2); // Allow booking up to 2 months in advance
    return maxDate;
  }

  calculateEndTime(): string {
    const startTime = this.reservationForm.get('startTime')?.value;
    
    if (!startTime) {
      return '';
    }
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = startTotalMinutes + (1.5 * 60); // Fixed 1.5 hours
    const endHour = Math.floor(endTotalMinutes / 60);
    const endMinute = endTotalMinutes % 60;
    
    return `${endHour}:${endMinute.toString().padStart(2, '0')}`;
  }

  isAfter17Hours(): boolean {
    const startTime = this.reservationForm.get('startTime')?.value;
    
    if (!startTime) {
      return false;
    }
    
    const startHour = parseInt(startTime.split(':')[0]);
    return startHour >= 17;
  }

  isMember(): boolean {
    const currentUser = this.userService.getCurrentUser();
    return currentUser?.membershipType === 'socio';
  }

  calculateTotalPrice(): number {
    if (!this.selectedCourt) {
      return 0;
    }
    
    // Only charge non-members
    const currentUser = this.userService.getCurrentUser();
    const isNonMember = currentUser?.membershipType === 'no_socio';
    
    if (!isNonMember) {
      return 0; // Free for members
    }
    
    const basePrice = this.selectedCourt.pricePerHour * 1.5;
    const lightingFee = this.isAfter17Hours() ? this.selectedCourt.lightingFeePerHour * 1.5 : 0;
    
    return basePrice + lightingFee;
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    const container = imgElement.parentElement;
    
    if (container) {
      // Ocultar la imagen rota
      imgElement.style.display = 'none';
      
      // Mostrar el fallback
      const fallback = container.querySelector('.court-image-fallback') as HTMLElement;
      if (fallback) {
        fallback.style.display = 'flex';
      }
    }
  }
}