import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { StudentAssignmentsService } from '../../../core/services/student-assignments.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-student-grades',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatIconModule, MatChipsModule],
  template: `
    <div class="grades-container">
      <!-- Resumen de calificaciones -->
      <div class="summary-cards" *ngIf="assignments.length > 0">
        <mat-card class="summary-card">
          <mat-icon>assessment</mat-icon>
          <div class="summary-info">
            <span class="summary-label">Promedio General</span>
            <span class="summary-value">{{ calculateAverage() | number: '1.1-1' }}</span>
          </div>
        </mat-card>

        <mat-card class="summary-card">
          <mat-icon>assignment</mat-icon>
          <div class="summary-info">
            <span class="summary-label">Total Asignaturas</span>
            <span class="summary-value">{{ getUniqueSubjects() }}</span>
          </div>
        </mat-card>

        <mat-card class="summary-card">
          <mat-icon>grade</mat-icon>
          <div class="summary-info">
            <span class="summary-label">Evaluaciones</span>
            <span class="summary-value">{{ getTotalGrades() }}</span>
          </div>
        </mat-card>
      </div>

      <!-- Tabla de calificaciones mejorada -->
      <mat-card class="grades-table-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>school</mat-icon>
          <mat-card-title>Historial de Calificaciones</mat-card-title>
          <mat-card-subtitle>Todas las evaluaciones del estudiante</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="table-container" *ngIf="assignments.length > 0; else noGrades">
            <table mat-table [dataSource]="assignments" class="grades-table">
              <!-- Materia -->
              <ng-container matColumnDef="subject">
                <th mat-header-cell *matHeaderCellDef> Materia </th>
                <td mat-cell *matCellDef="let element">
                  <div class="subject-cell">
                    <mat-icon>menu_book</mat-icon>
                    <span>{{ element.group?.subject?.name || 'N/A' }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Grupo -->
              <ng-container matColumnDef="group">
                <th mat-header-cell *matHeaderCellDef> Grupo </th>
                <td mat-cell *matCellDef="let element">
                  <mat-chip class="group-chip">
                    {{ element.group?.name || 'N/A' }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Evaluaciones -->
              <ng-container matColumnDef="evaluations">
                <th mat-header-cell *matHeaderCellDef> Evaluaciones </th>
                <td mat-cell *matCellDef="let element">
                  <span class="evaluation-count">{{ element.grades?.length || 0 }} evaluación(es)</span>
                </td>
              </ng-container>

              <!-- Calificaciones -->
              <ng-container matColumnDef="grades">
                <th mat-header-cell *matHeaderCellDef> Calificaciones </th>
                <td mat-cell *matCellDef="let element">
                  <div class="grades-list" *ngIf="element.grades?.length > 0; else noGradeData">
                    <span *ngFor="let grade of element.grades" 
                          class="grade-badge"
                          [class.excellent]="grade.score >= 90"
                          [class.good]="grade.score >= 70 && grade.score < 90"
                          [class.regular]="grade.score >= 60 && grade.score < 70"
                          [class.poor]="grade.score < 60">
                      {{ grade.score }}
                    </span>
                  </div>
                  <ng-template #noGradeData>
                    <span class="no-grade">Sin calificar</span>
                  </ng-template>
                </td>
              </ng-container>

              <!-- Promedio por materia -->
              <ng-container matColumnDef="average">
                <th mat-header-cell *matHeaderCellDef> Promedio </th>
                <td mat-cell *matCellDef="let element">
                  <span class="average-badge" 
                        *ngIf="element.grades?.length > 0"
                        [class.excellent]="getAssignmentAverage(element) >= 90"
                        [class.good]="getAssignmentAverage(element) >= 70 && getAssignmentAverage(element) < 90"
                        [class.regular]="getAssignmentAverage(element) >= 60 && getAssignmentAverage(element) < 70"
                        [class.poor]="getAssignmentAverage(element) < 60">
                    {{ getAssignmentAverage(element) | number: '1.1-1' }}
                  </span>
                  <span class="no-grade" *ngIf="!element.grades?.length">-</span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="grade-row"></tr>
            </table>
          </div>

          <ng-template #noGrades>
            <div class="no-data">
              <mat-icon>inbox</mat-icon>
              <p>No hay calificaciones registradas</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .grades-container {
      padding: 20px;
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
    }

    .summary-card mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      opacity: 0.9;
    }

    .summary-info {
      display: flex;
      flex-direction: column;
    }

    .summary-label {
      font-size: 13px;
      opacity: 0.9;
      margin-bottom: 4px;
    }

    .summary-value {
      font-size: 28px;
      font-weight: 600;
    }

    .grades-table-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .grades-table-card mat-card-header {
      margin-bottom: 20px;
    }

    .grades-table-card mat-icon[mat-card-avatar] {
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

    .table-container {
      overflow-x: auto;
    }

    .grades-table {
      width: 100%;
    }

    .subject-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .subject-cell mat-icon {
      color: #667eea;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .group-chip {
      font-size: 12px;
      height: 24px;
      background: #e3f2fd;
      color: #1976d2;
    }

    .evaluation-count {
      color: #666;
      font-size: 13px;
    }

    .grades-list {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .grade-badge, .average-badge {
      padding: 6px 12px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      display: inline-block;
      min-width: 40px;
      text-align: center;
    }

    .grade-badge.excellent, .average-badge.excellent {
      background: #4caf50;
      color: white;
    }

    .grade-badge.good, .average-badge.good {
      background: #2196f3;
      color: white;
    }

    .grade-badge.regular, .average-badge.regular {
      background: #ff9800;
      color: white;
    }

    .grade-badge.poor, .average-badge.poor {
      background: #f44336;
      color: white;
    }

    .no-grade {
      color: #999;
      font-style: italic;
    }

    .grade-row {
      transition: background-color 0.2s;
    }

    .grade-row:hover {
      background-color: #f5f5f5;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #999;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    @media (max-width: 768px) {
      .summary-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StudentGradesComponent implements OnInit {
  @Input() studentId?: number;
  assignments: any[] = [];
  displayedColumns: string[] = ['subject', 'group', 'evaluations', 'grades', 'average'];

  constructor(
    private studentAssignmentsService: StudentAssignmentsService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    if (!this.studentId) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) this.studentId = +id;
    }

    if (this.studentId) {
      this.loadGrades();
    }
  }

  loadGrades() {
    this.studentAssignmentsService.findByStudent(this.studentId!).subscribe(data => {
      this.assignments = data;
      console.log('📊 Assignments loaded:', this.assignments);
    });
  }

  calculateAverage(): number {
    let totalScore = 0;
    let totalGrades = 0;

    this.assignments.forEach(assignment => {
      if (assignment.grades && assignment.grades.length > 0) {
        assignment.grades.forEach((grade: any) => {
          totalScore += grade.score;
          totalGrades++;
        });
      }
    });

    return totalGrades > 0 ? totalScore / totalGrades : 0;
  }

  getAssignmentAverage(assignment: any): number {
    if (!assignment.grades || assignment.grades.length === 0) return 0;
    const sum = assignment.grades.reduce((acc: number, grade: any) => acc + grade.score, 0);
    return sum / assignment.grades.length;
  }

  getUniqueSubjects(): number {
    const subjects = new Set(
      this.assignments
        .map(a => a.group?.subject?.id)
        .filter(id => id != null)
    );
    return subjects.size;
  }

  getTotalGrades(): number {
    return this.assignments.reduce((total, assignment) => {
      return total + (assignment.grades?.length || 0);
    }, 0);
  }
}
