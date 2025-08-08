import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { CourtService } from '../../services/court.service';
import { Court } from '../../models/court.model';

@Component({
  selector: 'app-court-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    RouterLink
  ],
  templateUrl: './court-detail.html',
  styleUrls: ['./court-detail.css']
})
export class CourtDetail implements OnInit {
  court: Court | undefined;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private courtService: CourtService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const courtId = params.get('id');
      if (courtId) {
        this.loadCourtDetails(courtId);
      }
    });
  }

  loadCourtDetails(courtId: string): void {
    this.loading = true;
    this.error = false;
    
    this.courtService.getCourtById(courtId).subscribe({
      next: (court) => {
        if (court) {
          this.court = court;
        } else {
          this.error = true;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading court details:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
}