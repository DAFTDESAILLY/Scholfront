import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AttendanceService } from '../../../core/services/attendance.service';
import { SubjectsService } from '../../../core/services/subjects.service';
import { Attendance } from '../../../core/models/attendance.model';
import { Subject } from '../../../core/models/subject.model';
import { forkJoin } from 'rxjs';

interface AttendanceWithSubject extends Attendance {
  subjectName?: string;
}

@Component({
  selector: 'app-student-attendance',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="attendance-container">
      <!-- Tarjetas de resumen -->
      <div class="summary-cards">
        <mat-card class="summary-card present-card">
          <div class="card-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="card-info">
            <span class="card-label">Asistencias</span>
            <span class="card-value">{{ getPresentCount() }}</span>
          </div>
        </mat-card>

        <mat-card class="summary-card late-card">
          <div class="card-icon">
            <mat-icon>schedule</mat-icon>
          </div>
          <div class="card-info">
            <span class="card-label">Retardos</span>
            <span class="card-value">{{ getLateCount() }}</span>
          </div>
        </mat-card>

        <mat-card class="summary-card absent-card">
          <div class="card-icon">
            <mat-icon>cancel</mat-icon>
          </div>
          <div class="card-info">
            <span class="card-label">Faltas</span>
            <span class="card-value">{{ getAbsentCount() }}</span>
          </div>
        </mat-card>

        <mat-card class="summary-card excused-card">
          <div class="card-icon">
            <mat-icon>verified</mat-icon>
          </div>
          <div class="card-info">
            <span class="card-label">Justificadas</span>
            <span class="card-value">{{ getExcusedCount() }}</span>
          </div>
        </mat-card>
      </div>

      <!-- Tabla de asistencias -->
      <mat-card class="table-card" *ngIf="!loading && attendances.length > 0">
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="attendances" class="attendance-table">
              <!-- Columna de Materia -->
              <ng-container matColumnDef="subject">
                <th mat-header-cell *matHeaderCellDef>Materia</th>
                <td mat-cell *matCellDef="let attendance">
                  <div class="subject-cell">
                    <mat-icon>book</mat-icon>
                    <span>{{ attendance.subjectName || 'N/A' }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Columna de Fecha -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Fecha</th>
                <td mat-cell *matCellDef="let attendance">
                  <div class="date-cell">
                    <mat-icon>event</mat-icon>
                    <span>{{ attendance.date | date: 'dd/MM/yyyy' }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Columna de Estado -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let attendance">
                  <span [class]="'status-badge status-' + attendance.status">
                    <mat-icon>{{ getStatusIcon(attendance.status) }}</mat-icon>
                    <span>{{ getStatusLabel(attendance.status) }}</span>
                  </span>
                </td>
              </ng-container>

              <!-- Columna de Notas -->
              <ng-container matColumnDef="notes">
                <th mat-header-cell *matHeaderCellDef>Notas</th>
                <td mat-cell *matCellDef="let attendance">
                  <span class="notes-text">{{ attendance.notes || '-' }}</span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="attendance-row"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Estado de carga -->
      <div class="loading-state" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Cargando asistencias...</p>
      </div>

      <!-- Sin datos -->
      <div class="no-data" *ngIf="!loading && attendances.length === 0">
        <mat-icon>event_busy</mat-icon>
        <p>No hay registros de asistencia</p>
        <span class="sub-text">Este estudiante aún no tiene asistencias registradas</span>
      </div>
    </div>
  `,
  styles: [`
    .attendance-container {
      padding: 0;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border-radius: 12px;
      color: white;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }
    }

    .summary-card.present-card {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
    }

    .summary-card.late-card {
      background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
    }

    .summary-card.absent-card {
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
    }

    .summary-card.excused-card {
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
    }

    .card-icon {
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        opacity: 0.9;
      }
    }

    .card-info {
      display: flex;
      flex-direction: column;
    }

    .card-label {
      font-size: 13px;
      opacity: 0.9;
      margin-bottom: 4px;
    }

    .card-value {
      font-size: 32px;
      font-weight: 700;
    }

    .table-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
    }

    .attendance-table {
      width: 100%;

      th {
        background: #f5f7fa;
        font-weight: 600;
        color: #333;
        font-size: 14px;
      }
    }

    .subject-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      mat-icon {
        color: #667eea;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      span {
        font-size: 14px;
        color: #666;
        font-weight: 500;
      }
    }

    .date-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      mat-icon {
        color: #2196f3;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      span {
        font-size: 14px;
        color: #666;
      }
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 13px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &.status-present {
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;

        &:hover {
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        }
      }

      &.status-late {
        background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
        color: white;

        &:hover {
          box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
        }
      }

      &.status-absent {
        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
        color: white;

        &:hover {
          box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
        }
      }

      &.status-excused {
        background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
        color: white;

        &:hover {
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
        }
      }
    }

    .notes-text {
      font-size: 14px;
      color: #666;
      font-style: italic;
    }

    .attendance-row {
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f7fa;
      }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      color: #999;

      p {
        margin-top: 16px;
        font-size: 16px;
      }
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      color: #999;
      text-align: center;

      mat-icon {
        font-size: 96px;
        width: 96px;
        height: 96px;
        margin-bottom: 24px;
        opacity: 0.3;
        color: #667eea;
      }

      p {
        margin: 8px 0;
        font-size: 16px;
      }

      .sub-text {
        font-size: 14px;
        color: #bbb;
      }
    }

    @media (max-width: 768px) {
      .summary-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StudentAttendanceComponent implements OnInit {
  @Input() studentId!: number;
  
  attendances: AttendanceWithSubject[] = [];
  loading = true;
  displayedColumns = ['subject', 'date', 'status', 'notes'];

  constructor(
    private attendanceService: AttendanceService,
    private subjectsService: SubjectsService
  ) {}

  ngOnInit(): void {
    this.loadAttendance();
  }

  loadAttendance(): void {
    this.loading = true;
    
    // Get all subjects first, then get attendance for each
    this.subjectsService.getAll().subscribe({
      next: (subjects) => {
        const attendanceRequests = subjects.map(subject =>
          this.attendanceService.getStudentAttendance(this.studentId, subject.id)
        );

        forkJoin(attendanceRequests).subscribe({
          next: (results) => {
            this.attendances = [];
            results.forEach((attendanceList, index) => {
              attendanceList.forEach(attendance => {
                this.attendances.push({
                  ...attendance,
                  subjectName: subjects[index].name
                });
              });
            });
            
            // Sort by date descending
            this.attendances.sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
            this.loading = false;
          },
          error: (error) => {
            console.error('❌ Error loading attendance:', error);
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('❌ Error loading subjects:', error);
        this.loading = false;
      }
    });
  }

  getPresentCount(): number {
    return this.attendances.filter(a => a.status === 'present').length;
  }

  getLateCount(): number {
    return this.attendances.filter(a => a.status === 'late').length;
  }

  getAbsentCount(): number {
    return this.attendances.filter(a => a.status === 'absent').length;
  }

  getExcusedCount(): number {
    return this.attendances.filter(a => a.status === 'excused').length;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'present': 'Presente',
      'absent': 'Falta',
      'late': 'Retardo',
      'excused': 'Justificada'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'present': 'check_circle',
      'absent': 'cancel',
      'late': 'schedule',
      'excused': 'verified'
    };
    return icons[status] || 'help';
  }
}
