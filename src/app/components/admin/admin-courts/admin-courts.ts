import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { Court } from '../../../models/court.model';
import { CourtBlock } from '../../../models/court-block.model';
import { CourtService } from '../../../services/court.service';
import { CourtBlockService } from '../../../services/court-block.service';
import { CourtBlockDialog } from '../court-block-dialog/court-block-dialog';

@Component({
  selector: 'app-admin-courts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule
  ],
  templateUrl: './admin-courts.html',
  styleUrl: './admin-courts.css'
})
export class AdminCourts implements OnInit {
  courts: Court[] = [];
  courtBlocks: CourtBlock[] = [];
  displayedColumns: string[] = ['name', 'type', 'location', 'price', 'available', 'actions'];
  blockColumns: string[] = ['court', 'dates', 'time', 'type', 'reason', 'actions'];
  
  showForm = false;
  editingCourt: Court | null = null;
  courtForm: FormGroup;

  courtTypes = [
    { value: 'tennis', label: 'Tenis' },
    { value: 'paddle', label: 'Pádel' },
    { value: 'basketball', label: 'Básquetbol' },
    { value: 'football', label: 'Fútbol' },
    { value: 'other', label: 'Otro' }
  ];

  blockTypes: { [key: string]: string } = {
    maintenance: 'Mantenimiento',
    event: 'Evento',
    closure: 'Cierre',
    other: 'Otro'
  };

  constructor(
    private courtService: CourtService,
    private courtBlockService: CourtBlockService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.courtForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      pricePerHour: [0, [Validators.required, Validators.min(0)]],
      available: [true],
      imageUrl: [''],
      features: ['']
    });
  }

  ngOnInit(): void {
    this.loadCourts();
    this.loadCourtBlocks();
  }

  loadCourts(): void {
    this.courtService.getCourts().subscribe(courts => {
      this.courts = courts;
    });
  }

  openForm(court?: Court): void {
    this.editingCourt = court || null;
    this.showForm = true;
    
    if (court) {
      this.courtForm.patchValue({
        ...court,
        features: court.features?.join(', ') || ''
      });
    } else {
      this.courtForm.reset({
        available: true,
        pricePerHour: 0
      });
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.editingCourt = null;
    this.courtForm.reset();
  }

  saveCourt(): void {
    if (this.courtForm.valid) {
      const formValue = this.courtForm.value;
      const courtData: Court = {
        ...formValue,
        features: formValue.features ? 
          formValue.features.split(',').map((f: string) => f.trim()).filter((f: string) => f) : 
          []
      };

      if (this.editingCourt) {
        // Actualizar cancha existente
        this.courtService.updateCourt(this.editingCourt.id || '', courtData).subscribe(() => {
          this.loadCourts();
          this.closeForm();
        });
      } else {
        // Crear nueva cancha
        this.courtService.createCourt(courtData).subscribe(() => {
          this.loadCourts();
          this.closeForm();
        });
      }
    }
  }

  deleteCourt(court: Court): void {
    if (confirm(`¿Estás seguro de que quieres eliminar la cancha "${court.name}"?`)) {
      this.courtService.deleteCourt(court.id!).subscribe(() => {
        this.loadCourts();
      });
    }
  }

  toggleAvailability(court: Court): void {
    this.courtService.updateCourt(court.id || '', { available: !court.available }).subscribe(() => {
      this.loadCourts();
    });
  }

  getTypeLabel(type: string): string {
    const typeObj = this.courtTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  }

  getFormErrorMessage(fieldName: string): string {
    const field = this.courtForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (field?.hasError('min')) {
      return 'El valor debe ser mayor a 0';
    }
    return '';
  }

  // Métodos para gestión de bloqueos
  loadCourtBlocks() {
    this.courtBlockService.getCourtBlocks().subscribe(blocks => {
      this.courtBlocks = blocks;
    });
  }

  openBlockDialog(courtId?: string) {
    const dialogRef = this.dialog.open(CourtBlockDialog, {
      width: '600px',
      data: { 
        courts: this.courts,
        selectedCourtId: courtId 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.courtBlockService.createCourtBlock(result).subscribe(() => {
          this.loadCourtBlocks();
        });
      }
    });
  }

  editBlock(block: CourtBlock) {
    const dialogRef = this.dialog.open(CourtBlockDialog, {
      width: '600px',
      data: { 
        courts: this.courts,
        block: block 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && block.id) {
        this.courtBlockService.updateCourtBlock(block.id, result).subscribe(() => {
          this.loadCourtBlocks();
        });
      }
    });
  }

  deleteBlock(blockId: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este bloqueo?')) {
      this.courtBlockService.deleteCourtBlock(blockId).subscribe(() => {
        this.loadCourtBlocks();
      });
    }
  }

  getCourtName(courtId: string): string {
    const court = this.courts.find(c => c.id === courtId);
    return court ? court.name : 'Cancha no encontrada';
  }

  formatBlockTime(block: CourtBlock): string {
    if (block.isAllDay) {
      return 'Todo el día';
    }
    return `${block.startTime} - ${block.endTime}`;
  }

  formatBlockDates(block: CourtBlock): string {
    const startDate = new Date(block.startDate).toLocaleDateString();
    const endDate = new Date(block.endDate).toLocaleDateString();
    
    if (startDate === endDate) {
      return startDate;
    }
    return `${startDate} - ${endDate}`;
  }
}