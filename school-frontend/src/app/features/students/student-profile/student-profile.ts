import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StudentsService } from '../../../core/services/students.service';
import { StudentGradesComponent } from '../student-grades/student-grades';
import { StudentRecordsComponent } from '../../records/student-records/student-records.component';
import { StudentConsentsComponent } from '../../consents/student-consents/student-consents.component';
import { StudentAttendanceComponent } from '../student-attendance/student-attendance.component';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    StudentGradesComponent,
    StudentRecordsComponent,
    StudentConsentsComponent,
    StudentAttendanceComponent
  ],
  template: `
    <div class="profile-container" *ngIf="student">
      <!-- Header mejorado con avatar y estado -->
      <div class="profile-header">
        <div class="header-content">
          <div class="avatar-section">
            <div class="student-avatar">
              <mat-icon>person</mat-icon>
            </div>
            <div class="status-badge" [class.active]="student.status === 'active'">
              {{ student.status === 'active' ? 'Activo' : 'Inactivo' }}
            </div>
          </div>
          
          <div class="student-info">
            <h1>{{ student.fullName }}</h1>
            <div class="student-meta">
              <span class="meta-item">
                <mat-icon>badge</mat-icon>
                <span>ID: {{ student.id }}</span>
              </span>
              <span class="meta-item" *ngIf="student.enrollmentId">
                <mat-icon>school</mat-icon>
                <span>Matrícula: {{ student.enrollmentId }}</span>
              </span>
              <span class="meta-item" *ngIf="student.email">
                <mat-icon>email</mat-icon>
                <span>{{ student.email }}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button mat-raised-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Regresar
          </button>
          <button mat-raised-button color="primary" (click)="editStudent()">
            <mat-icon>edit</mat-icon>
            Editar
          </button>
        </div>
      </div>

      <!-- Tabs mejorados -->
      <mat-tab-group class="student-tabs" animationDuration="300ms">
        <!-- Tab General -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">person</mat-icon>
            General
          </ng-template>
          
          <div class="tab-content">
            <div class="cards-grid">
              <!-- Tarjeta de Información Personal -->
              <mat-card class="info-card">
                <mat-card-header>
                  <mat-icon mat-card-avatar>account_circle</mat-icon>
                  <mat-card-title>Información Personal</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="info-list">
                    <div class="info-row">
                      <span class="label">Nombre Completo</span>
                      <span class="value">{{ student.fullName }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Fecha de Nacimiento</span>
                      <span class="value">{{ student.birthDate ? (student.birthDate | date: 'dd/MM/yyyy') : 'N/A' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Email</span>
                      <span class="value">{{ student.email || 'N/A' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Estado</span>
                      <span class="value">
                        <span class="status-chip" [class.active]="student.status === 'active'">
                          {{ student.status === 'active' ? 'Activo' : 'Inactivo' }}
                        </span>
                      </span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Tarjeta de Contacto -->
              <mat-card class="info-card">
                <mat-card-header>
                  <mat-icon mat-card-avatar>contact_phone</mat-icon>
                  <mat-card-title>Información de Contacto</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="info-list">
                    <div class="info-row">
                      <span class="label">Dirección</span>
                      <span class="value">{{ student.address || 'N/A' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Teléfono de Padres</span>
                      <span class="value">{{ student.parentPhone || 'N/A' }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Tarjeta de Notas Adicionales -->
              <mat-card class="info-card full-width" *ngIf="student.notes">
                <mat-card-header>
                  <mat-icon mat-card-avatar>notes</mat-icon>
                  <mat-card-title>Notas</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p class="notes-text">{{ student.notes }}</p>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Tab Calificaciones -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">grade</mat-icon>
            Calificaciones
          </ng-template>
          <div class="tab-content">
            <app-student-grades [studentId]="student.id"></app-student-grades>
          </div>
        </mat-tab>

        <!-- Tab Asistencias -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">event_available</mat-icon>
            Asistencias
          </ng-template>
          <div class="tab-content">
            <app-student-attendance [studentId]="student.id"></app-student-attendance>
          </div>
        </mat-tab>

        <!-- Tab Expediente -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">folder</mat-icon>
            Expediente
          </ng-template>
          <div class="tab-content">
            <app-student-records [studentId]="student.id"></app-student-records>
          </div>
        </mat-tab>

        <!-- Tab Consentimientos -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">verified_user</mat-icon>
            Consentimientos
          </ng-template>
          <div class="tab-content">
            <app-student-consents [studentId]="student.id"></app-student-consents>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>

    <!-- Estado de carga -->
    <div class="loading-container" *ngIf="!student">
      <mat-icon class="loading-icon">hourglass_empty</mat-icon>
      <p>Cargando información del estudiante...</p>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .profile-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
      color: white;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .header-content {
      display: flex;
      gap: 24px;
      align-items: center;
      flex: 1;
    }

    .avatar-section {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .student-avatar {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 4px solid rgba(255, 255, 255, 0.3);
    }

    .student-avatar mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      background: rgba(255, 255, 255, 0.2);
    }

    .status-badge.active {
      background: #4caf50;
    }

    .student-info h1 {
      margin: 0 0 12px 0;
      font-size: 32px;
      font-weight: 600;
    }

    .student-meta {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      opacity: 0.9;
    }

    .meta-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .header-actions button {
      background: white;
      color: #667eea;
    }

    .student-tabs {
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .student-tabs ::ng-deep .mat-mdc-tab-labels {
      background: #f5f7fa;
    }

    .tab-icon {
      margin-right: 8px;
    }

    .tab-content {
      padding: 24px;
      min-height: 400px;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    .info-card {
      height: fit-content;
    }

    .info-card.full-width {
      grid-column: 1 / -1;
    }

    .info-card mat-card-header {
      margin-bottom: 16px;
    }

    .info-card mat-icon[mat-card-avatar] {
      background: #667eea;
      color: white;
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-row .label {
      font-weight: 500;
      color: #666;
      font-size: 14px;
    }

    .info-row .value {
      font-size: 15px;
      color: #333;
      text-align: right;
    }

    .status-chip {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
      background: #ff9800;
      color: white;
    }

    .status-chip.active {
      background: #4caf50;
    }

    .notes-text {
      margin: 0;
      line-height: 1.6;
      color: #555;
      white-space: pre-wrap;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      color: #999;
    }

    .loading-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    @media (max-width: 768px) {
      .profile-header {
        padding: 20px;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
      }

      .student-info h1 {
        font-size: 24px;
      }

      .cards-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StudentProfileComponent implements OnInit {
  student: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentsService: StudentsService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.studentsService.getById(+id).subscribe(student => {
        this.student = student;
      });
    }
  }

  editStudent() {
    if (this.student?.id) {
      this.router.navigate(['/students', this.student.id, 'edit']);
    }
  }

  goBack() {
    this.router.navigate(['/students']);
  }
}
