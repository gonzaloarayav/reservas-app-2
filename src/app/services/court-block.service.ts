import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { CourtBlock, CourtAvailability, TimeSlot } from '../models/court-block.model';

@Injectable({
  providedIn: 'root'
})
export class CourtBlockService {
  private courtBlocks: CourtBlock[] = [];
  private courtBlocksSubject = new BehaviorSubject<CourtBlock[]>([]);

  constructor() {
    // Datos de ejemplo para desarrollo
    this.courtBlocks = [
      {
        id: '1',
        courtId: '1',
        startDate: new Date(2024, 11, 25), // 25 de diciembre
        endDate: new Date(2024, 11, 25),
        reason: 'Mantenimiento programado',
        type: 'maintenance',
        isAllDay: true,
        createdBy: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        courtId: '2',
        startDate: new Date(2024, 11, 31), // 31 de diciembre
        endDate: new Date(2025, 0, 1),    // 1 de enero
        startTime: '22:00',
        endTime: '06:00',
        reason: 'Evento especial de Año Nuevo',
        type: 'event',
        isAllDay: false,
        createdBy: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    this.courtBlocksSubject.next(this.courtBlocks);
  }

  getCourtBlocks(): Observable<CourtBlock[]> {
    return this.courtBlocksSubject.asObservable();
  }

  getCourtBlocksByCourtId(courtId: string): Observable<CourtBlock[]> {
    const blocks = this.courtBlocks.filter(block => block.courtId === courtId);
    return of(blocks);
  }

  createCourtBlock(block: CourtBlock): Observable<CourtBlock> {
    const newBlock = {
      ...block,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.courtBlocks.push(newBlock);
    this.courtBlocksSubject.next(this.courtBlocks);
    return of(newBlock);
  }

  updateCourtBlock(id: string, block: Partial<CourtBlock>): Observable<CourtBlock | undefined> {
    const index = this.courtBlocks.findIndex(b => b.id === id);
    if (index !== -1) {
      this.courtBlocks[index] = {
        ...this.courtBlocks[index],
        ...block,
        updatedAt: new Date()
      };
      this.courtBlocksSubject.next(this.courtBlocks);
      return of(this.courtBlocks[index]);
    }
    return of(undefined);
  }

  deleteCourtBlock(id: string): Observable<boolean> {
    const index = this.courtBlocks.findIndex(b => b.id === id);
    if (index !== -1) {
      this.courtBlocks.splice(index, 1);
      this.courtBlocksSubject.next(this.courtBlocks);
      return of(true);
    }
    return of(false);
  }

  getCourtAvailability(courtId: string, date: Date): Observable<CourtAvailability> {
    const blocks = this.courtBlocks.filter(block => 
      block.courtId === courtId && 
      this.isDateInRange(date, block.startDate, block.endDate)
    );

    const availableSlots: TimeSlot[] = [];
    const blockedSlots: TimeSlot[] = [];

    // Generar slots de 1 hora desde las 8:00 hasta las 22:00
    for (let hour = 8; hour < 22; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      const isBlocked = blocks.some(block => {
        if (block.isAllDay) return true;
        if (!block.startTime || !block.endTime) return false;
        
        const blockStart = this.timeToMinutes(block.startTime);
        const blockEnd = this.timeToMinutes(block.endTime);
        const slotStart = this.timeToMinutes(startTime);
        const slotEnd = this.timeToMinutes(endTime);
        
        return slotStart < blockEnd && slotEnd > blockStart;
      });

      const slot: TimeSlot = {
        startTime,
        endTime,
        isBlocked,
        blockReason: isBlocked ? blocks.find(b => b.isAllDay || this.isTimeInBlock(startTime, b))?.reason : undefined
      };

      if (isBlocked) {
        blockedSlots.push(slot);
      } else {
        availableSlots.push(slot);
      }
    }

    return of({
      courtId,
      date,
      availableSlots,
      blockedSlots
    });
  }

  private isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    return checkDate >= start && checkDate <= end;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private isTimeInBlock(time: string, block: CourtBlock): boolean {
    if (block.isAllDay) return true;
    if (!block.startTime || !block.endTime) return false;
    
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(block.startTime);
    const endMinutes = this.timeToMinutes(block.endTime);
    
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  }
}