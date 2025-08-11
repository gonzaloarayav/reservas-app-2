import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CourtBlock } from '../../../models/court-block.model';
import { Court } from '../../../models/court.model';

export interface CourtBlockDialogData {
  court: Court;
  block?: CourtBlock;
}

@Component({
  selector: 'app-court-block-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>block</mat-icon>
      {{ data.block ? 'Editar Bloqueo' : 'Nuevo Bloqueo' }} - {{ data.court.name }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="blockForm" class="block-form">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Fecha de inicio</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="startDate">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
            <mat-error>{{ getFormErrorMessage('startDate') }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha de fin</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="endDate">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
            <mat-error>{{ getFormErrorMessage('endDate') }}</mat-error>
          </mat-form-field>
        </div>

        <mat-slide-toggle formControlName="isAllDay" color="primary">
          Bloqueo de todo el día
        </mat-slide-toggle>

        <div class="form-row" *ngIf="!blockForm.get('isAllDay')?.value">
          <mat-form-field appearance="outline">
            <mat-label>Hora de inicio</mat-label>
            <input matInput type="time" formControlName="startTime">
            <mat-error>{{ getFormErrorMessage('startTime') }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Hora de fin</mat-label>
            <input matInput type="time" formControlName="endTime">
            <mat-error>{{ getFormErrorMessage('endTime') }}</mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tipo de bloqueo</mat-label>
          <mat-select formControlName="type">
            <mat-option value="maintenance">Mantenimiento</mat-option>
            <mat-option value="event">Evento especial</mat-option>
            <mat-option value="closure">Cierre temporal</mat-option>
            <mat-option value="other">Otro</mat-option>
          </mat-select>
          <mat-error>{{ getFormErrorMessage('type') }}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motivo del bloqueo</mat-label>
          <textarea matInput formControlName="reason" rows="3" 
                    placeholder="Describe el motivo del bloqueo"></textarea>
          <mat-error>{{ getFormErrorMessage('reason') }}</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" 
              [disabled]="!blockForm.valid" 
              (click)="onSave()">
        {{ data.block ? 'Actualizar' : 'Crear' }} Bloqueo
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .block-form {
      min-width: 500px;
      padding: 1rem 0;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    mat-slide-toggle {
      margin: 1rem 0;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class CourtBlockDialog implements OnInit {
  blockForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CourtBlockDialog>,
    @Inject(MAT_DIALOG_DATA) public data: CourtBlockDialogData
  ) {
    this.blockForm = this.fb.group({
      startDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
      startTime: ['08:00'],
      endTime: ['22:00'],
      isAllDay: [true],
      type: ['maintenance', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    if (this.data.block) {
      this.blockForm.patchValue({
        startDate: this.data.block.startDate,
        endDate: this.data.block.endDate,
        startTime: this.data.block.startTime || '08:00',
        endTime: this.data.block.endTime || '22:00',
        isAllDay: this.data.block.isAllDay,
        type: this.data.block.type,
        reason: this.data.block.reason
      });
    }

    // Validación personalizada para fechas
    this.blockForm.get('endDate')?.valueChanges.subscribe(() => {
      this.validateDates();
    });
    
    this.blockForm.get('startDate')?.valueChanges.subscribe(() => {
      this.validateDates();
    });
  }

  validateDates(): void {
    const startDate = this.blockForm.get('startDate')?.value;
    const endDate = this.blockForm.get('endDate')?.value;
    
    if (startDate && endDate && endDate < startDate) {
      this.blockForm.get('endDate')?.setErrors({ invalidDate: true });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.blockForm.valid) {
      const formValue = this.blockForm.value;
      const blockData: CourtBlock = {
        ...this.data.block,
        courtId: this.data.court.id!,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        startTime: formValue.isAllDay ? undefined : formValue.startTime,
        endTime: formValue.isAllDay ? undefined : formValue.endTime,
        isAllDay: formValue.isAllDay,
        type: formValue.type,
        reason: formValue.reason,
        createdBy: 'admin' // En una app real, esto vendría del usuario autenticado
      };

      this.dialogRef.close(blockData);
    }
  }

  getFormErrorMessage(fieldName: string): string {
    const field = this.blockForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (field?.hasError('invalidDate')) {
      return 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    return '';
  }
}