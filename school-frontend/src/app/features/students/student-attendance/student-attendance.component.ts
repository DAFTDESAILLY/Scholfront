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

    mat-card {
      display: block !important;
      background: white !important;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      display: flex !important;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border-radius: 12px;
      color: white;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    }

    .summary-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
      transform: translateY(-6px);
      box-shadow: var(--shadow-md) !important;
    }

    .summary-card.present-card {
      background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark) 100%) !important;
    }

    .summary-card.late-card {
      background: linear-gradient(135deg, var(--color-warning) 0%, var(--color-warning-dark) 100%) !important;
    }

    .summary-card.absent-card {
      background: linear-gradient(135deg, var(--color-danger) 0%, var(--color-danger-dark) 100%) !important;
    }

    .summary-card.excused-card {
      background: linear-gradient(135deg, var(--secondary-color) 0%, var(--secondary-color) 100%) !important;
    }

    .card-icon mat-icon {
      font-size: 44px;
      width: 44px;
      height: 44px;
      opacity: 0.8;
    }

    .card-info {
      display: flex;
      flex-direction: column;
    }

    .card-label {
      font-size: 14px;
      opacity: 0.8;
      font-weight: 500;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-value {
      font-size: 32px;
      font-weight: 800;
    }

    .table-card {
      border-radius: 16px;
      border: 1px solid var(--neutral-300);
      overflow: hidden;
      background: white !important;
    }

    .table-container {
      overflow-x: auto;
      padding: 8px;
    }

    .attendance-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 12px;

      th {
        background: transparent;
        font-weight: 700;
        color: var(--neutral-500);
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 0 24px;
      }

      td {
        padding: 20px 24px;
        background: white;
        border-top: 1px solid var(--neutral-100);
        border-bottom: 1px solid var(--neutral-100);
        
        &:first-child { 
          border-left: 1px solid var(--neutral-100); 
          border-radius: 12px 0 0 12px; 
        }
        &:last-child { 
          border-right: 1px solid var(--neutral-100); 
          border-radius: 0 12px 12px 0; 
        }
      }
    }

    .subject-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      mat-icon {
        color: var(--primary-color);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      span {
        font-size: 14px;
        color: var(--neutral-700);
        font-weight: 500;
      }
    }

    .date-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      mat-icon {
        color: var(--secondary-color);
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      span {
        font-size: 14px;
        color: var(--neutral-700);
      }
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      box-shadow: var(--shadow-sm);
      color: var(--neutral-900);

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      &.status-present {
        background: var(--color-success);
      }

      &.status-late {
        background: var(--color-warning);
      }

      &.status-absent {
        background: var(--color-danger);
      }

      &.status-excused {
        background: var(--accent-color);
      }
    }

    .notes-text {
      font-size: 14px;
      color: var(--neutral-500);
      font-style: italic;
    }

    .attendance-row {
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--primary-light);
      }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      color: var(--neutral-500);

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
      color: var(--neutral-500);
      text-align: center;

      mat-icon {
        font-size: 96px;
        width: 96px;
        height: 96px;
        margin-bottom: 24px;
        opacity: 0.3;
        color: var(--primary-color);
      }

      p {
        margin: 8px 0;
        font-size: 16px;
      }

      .sub-text {
        font-size: 14px;
        color: var(--neutral-300);
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
  ) { }

  ngOnInit(): void {
    console.log('🚀 StudentAttendanceComponent initialized');
    console.log('   studentId recibido:', this.studentId);
    console.log('   tipo de studentId:', typeof this.studentId);
    
    if (!this.studentId) {
      console.error('❌ ADVERTENCIA: studentId no está definido en ngOnInit');
    }
    
    this.loadAttendance();
  }

  loadAttendance(): void {
    if (!this.studentId) {
      console.warn('⚠️ No se puede cargar asistencia sin studentId');
      this.loading = false;
      return;
    }

    console.log('🔄 Iniciando carga de asistencias para estudiante:', this.studentId);
    this.loading = true;
    this.attendances = [];

    this.subjectsService.getAll().subscribe({
      next: (subjects) => {
        console.log('📚 Asignaturas cargadas:', subjects?.length);
        
        if (!subjects || subjects.length === 0) {
          console.warn('⚠️ No se encontraron asignaturas.');
          this.attendances = [];
          this.loading = false;
          return;
        }

        const attendanceRequests = subjects.map(subject => {
          console.log(`📡 Solicitando asistencias para: studentId=${this.studentId}, subjectId=${subject.id} (${subject.name})`);
          return this.attendanceService.getStudentAttendance(this.studentId, subject.id);
        });

        forkJoin(attendanceRequests).subscribe({
          next: (results) => {
            console.log('✅ Respuestas recibidas:', results.length, 'grupos');
            
            results.forEach((attendanceList, index) => {
              const subject = subjects[index];
              console.log(`\n📊 Procesando materia[${index}]: ${subject.name} (ID: ${subject.id})`);
              
              if (!attendanceList || !Array.isArray(attendanceList)) {
                console.log(`   Sin registros o formato inválido`);
                return;
              }

              console.log(`   Total registros recibidos: ${attendanceList.length}`);
              
              attendanceList.forEach((attendance: any, idx: number) => {
                if (!attendance) {
                  console.warn(`   ⚠️ Registro ${idx} es null/undefined`);
                  return;
                }

                console.log(`\n   📋 Registro #${idx}:`, JSON.stringify(attendance, null, 2));
                console.log(`   📋 Campos disponibles:`, Object.keys(attendance));
                
                // Obtener el studentId del registro de todas las formas posibles
                const recordStudentId = attendance.studentId || 
                                       attendance.student_id || 
                                       attendance.StudentId ||
                                       (attendance.student && attendance.student.id) ||
                                       (attendance.studentAssignment && attendance.studentAssignment.studentId) ||
                                       (attendance.studentAssignment && attendance.studentAssignment.student && attendance.studentAssignment.student.id);
                
                console.log(`   🔍 recordStudentId encontrado: "${recordStudentId}" (tipo: ${typeof recordStudentId})`);
                console.log(`   🔍 this.studentId esperado: "${this.studentId}" (tipo: ${typeof this.studentId})`);
                
                // Convertir ambos a número para comparar
                const recordIdNum = recordStudentId ? Number(recordStudentId) : null;
                const expectedIdNum = Number(this.studentId);
                
                console.log(`   🔍 Comparación numérica: ${recordIdNum} === ${expectedIdNum} = ${recordIdNum === expectedIdNum}`);
                
                // VERIFICAR que sea del estudiante correcto
                if (recordIdNum !== expectedIdNum) {
                  console.log(`   ❌ FILTRADO: No coincide el studentId (esperado: ${expectedIdNum}, recibido: ${recordIdNum})`);
                  return;
                }
                
                console.log(`   ✅ Match de studentId confirmado`);
                
                // Obtener la fecha
                const dateValue = attendance.date || attendance.attendanceDate;
                
                if (!dateValue) {
                  console.warn(`   ⚠️ Registro sin fecha, ignorado`);
                  return;
                }
                
                // Crear el registro de asistencia
                const attendanceRecord: AttendanceWithSubject = {
                  id: attendance.id,
                  subjectId: attendance.subjectId || subject.id,
                  studentId: expectedIdNum,
                  date: dateValue,
                  status: attendance.status || 'present',
                  notes: attendance.notes || attendance.observation || '',
                  createdAt: attendance.createdAt || new Date(),
                  updatedAt: attendance.updatedAt || new Date(),
                  subjectName: subject.name
                };
                
                this.attendances.push(attendanceRecord);
                console.log(`   ✅✅ AGREGADO EXITOSAMENTE: ${subject.name} - ${dateValue} - ${attendance.status}`);
              });
            });

            console.log(`\n📈 TOTAL ASISTENCIAS CARGADAS: ${this.attendances.length}`);
            
            // Ordenar por fecha descendente
            this.attendances.sort((a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            if (this.attendances.length > 0) {
              console.log('✅ Asistencias procesadas y ordenadas correctamente');
              console.log('📊 Resumen:', {
                total: this.attendances.length,
                presentes: this.getPresentCount(),
                retardos: this.getLateCount(),
                faltas: this.getAbsentCount(),
                justificadas: this.getExcusedCount()
              });
            } else {
              console.log('ℹ️ No se encontraron asistencias para este estudiante');
            }

            this.loading = false;
          },
          error: (error) => {
            console.error('❌ Error al cargar asistencias:', error);
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('❌ Error al cargar materias:', error);
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
