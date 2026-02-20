import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { StudentAssignmentsService } from '../../../core/services/student-assignments.service';
import { SubjectsService } from '../../../core/services/subjects.service';
import { Subject } from '../../../core/models/subject.model';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-student-grades',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatIconModule, MatChipsModule],
  template: `
    <div class="grades-container">
      <!-- Resumen de promedios -->
      <div class="summary-cards" *ngIf="assignments.length > 0">
        <mat-card class="summary-card general">
          <div class="icon-box">
            <mat-icon>functions</mat-icon>
          </div>
          <div class="summary-info">
            <span class="summary-label">Promedio General</span>
            <span class="summary-value">{{ calculateGeneralAverage() | number: '1.1-1' }}</span>
          </div>
        </mat-card>

        <mat-card class="summary-card global">
          <div class="icon-box">
            <mat-icon>public</mat-icon>
          </div>
          <div class="summary-info">
            <span class="summary-label">Promedio Global</span>
            <span class="summary-value">{{ calculateGlobalAverage() | number: '1.1-2' }}</span>
          </div>
        </mat-card>

        <mat-card class="summary-card subjects">
          <div class="icon-box">
            <mat-icon>menu_book</mat-icon>
          </div>
          <div class="summary-info">
            <span class="summary-label">Asignaturas</span>
            <span class="summary-value">{{ getUniqueSubjects() }}</span>
          </div>
        </mat-card>

        <mat-card class="summary-card total">
          <div class="icon-box">
            <mat-icon>assignment_turned_in</mat-icon>
          </div>
          <div class="summary-info">
            <span class="summary-label">Evaluaciones</span>
            <span class="summary-value">{{ getTotalGrades() }}</span>
          </div>
        </mat-card>
      </div>

      <!-- Cuadrícula de Materias -->
      <div class="subject-grid" *ngIf="groupedAssignments.length > 0; else noGrades">
        <div *ngFor="let item of groupedAssignments" class="subject-card-wrapper">
          <mat-card class="subject-card" [class.empty-card]="item.grades?.length === 0">
            <div class="subject-card-header">
              <div class="subject-main-info">
                <div class="subject-icon-pill">
                  <mat-icon>{{ item.grades?.length > 0 ? 'auto_stories' : 'library_books' }}</mat-icon>
                </div>
                <div class="title-lines">
                  <span class="subject-name">{{ item.subjectName }}</span>
                  <span class="group-tag">{{ item.groupName }}</span>
                </div>
              </div>
              <div class="subject-stat" *ngIf="item.grades?.length > 0">
                <span class="stat-pill" [class]="getScoreClass(calculateItemAverage(item))">
                  {{ calculateItemAverage(item) | number: '1.1-1' }}
                </span>
              </div>
            </div>
            
            <mat-card-content>
              <div class="evaluations-container" *ngIf="item.grades?.length > 0; else emptySubject">
                <div class="eval-header">
                  <span class="h-name">Actividad</span>
                  <span class="h-score">Nota</span>
                </div>
                <div class="eval-rows">
                  <div *ngFor="let grade of item.grades" class="eval-item">
                    <div class="e-info">
                      <span class="e-title">{{ grade.evaluationItem?.name || 'Evaluación' }}</span>
                      <span class="e-meta" *ngIf="grade.evaluationItem?.dueDate">
                        {{ grade.evaluationItem.dueDate | date:'dd MMM' }}
                      </span>
                    </div>
                    <div class="e-score">
                      <span class="score-badge" [class]="getScoreClass(grade.score)">{{ grade.score }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <ng-template #emptySubject>
                <div class="empty-state-inner">
                  <mat-icon>hourglass_empty</mat-icon>
                  <p>Pendiente de calificar</p>
                </div>
              </ng-template>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <ng-template #noGrades>
        <mat-card class="no-data-card glass-panel">
          <div class="no-data">
            <mat-icon>auto_awesome_motion</mat-icon>
            <p>No se encontraron inscripciones para este estudiante.</p>
          </div>
        </mat-card>
      </ng-template>
    </div>
  `,
  styles: [`
    .grades-container {
      padding: 8px;
      animation: fadeIn 0.5s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Summary Cards - Mejoradas */
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 36px;
    }

    .summary-card {
      padding: 24px !important;
      border: none !important;
      border-radius: 16px !important;
      background: white !important;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06) !important;
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      gap: 18px !important;
      overflow: hidden;
      position: relative;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        opacity: 0.08;
        transition: transform 0.4s ease;
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;

        &::before {
          transform: scale(1.4);
        }

        .icon-box {
          transform: scale(1.08);
        }
      }
    }

    .summary-card.general::before { background: #10b981; }
    .summary-card.global::before { background: #3b82f6; }
    .summary-card.subjects::before { background: #8b5cf6; }
    .summary-card.total::before { background: #f59e0b; }

    .icon-box {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      z-index: 1;
      transition: transform 0.3s ease;
    }

    .icon-box mat-icon { 
      font-size: 28px; 
      width: 28px; 
      height: 28px; 
    }

    .summary-card.general .icon-box { 
      background: rgba(16, 185, 129, 0.12); 
      color: #10b981;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    }
    .summary-card.global .icon-box { 
      background: rgba(59, 130, 246, 0.12); 
      color: #3b82f6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }
    .summary-card.subjects .icon-box { 
      background: rgba(139, 92, 246, 0.12); 
      color: #8b5cf6;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
    }
    .summary-card.total .icon-box { 
      background: rgba(245, 158, 11, 0.12); 
      color: #f59e0b;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
    }

    .summary-info { 
      display: flex; 
      flex-direction: column;
      z-index: 1;
    }
    .summary-label { 
      font-size: 11px; 
      color: #64748b; 
      font-weight: 600; 
      text-transform: uppercase; 
      letter-spacing: 0.6px; 
      margin-bottom: 4px; 
    }
    .summary-value { 
      font-size: 26px; 
      font-weight: 700; 
      color: #1e293b;
      line-height: 1; 
    }

    /* Grid layout - Mejorado */
    .subject-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 24px;
    }

    .subject-card {
      height: 100%;
      border-radius: 16px !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      background: white !important;
      padding: 0 !important;
      overflow: hidden;
    }

    .subject-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 28px rgba(0,0,0,0.12) !important;
      border-color: #3b82f6 !important;
    }

    .subject-card-header {
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%);
    }

    .subject-main-info { 
      display: flex; 
      align-items: center; 
      gap: 14px; 
    }
    
    .subject-icon-pill {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #475569;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
      transition: all 0.3s ease;
    }

    .subject-card:hover .subject-icon-pill {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      transform: rotate(5deg);
    }

    .subject-icon-pill mat-icon { 
      font-size: 22px; 
      width: 22px; 
      height: 22px; 
    }

    .title-lines { 
      display: flex; 
      flex-direction: column;
      gap: 2px; 
    }
    .subject-name { 
      font-size: 16px; 
      font-weight: 700; 
      color: #1e293b; 
      line-height: 1.3; 
    }
    .group-tag { 
      font-size: 11px; 
      color: #94a3b8; 
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .stat-pill {
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 14px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
    }

    .subject-card:hover .stat-pill {
      transform: scale(1.08);
    }

    .stat-pill.excellent { 
      background: var(--color-success-light); 
      color: var(--color-success-dark); 
    }
    .stat-pill.good { 
      background: var(--primary-light); 
      color: var(--primary-dark); 
    }
    .stat-pill.regular { 
      background: var(--color-warning-light); 
      color: var(--color-warning-dark); 
    }
    .stat-pill.poor { 
      background: var(--color-danger-light); 
      color: var(--color-danger-dark); 
    }

    /* Evaluations list - Mejorada */
    mat-card-content { 
      padding: 0 !important; 
    }

    .evaluations-container {
      padding: 8px 0;
    }

    .eval-header {
      display: flex;
      justify-content: space-between;
      padding: 12px 24px 8px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #94a3b8;
      letter-spacing: 0.6px;
      border-bottom: 1px solid #f8fafc;
    }

    .eval-rows { 
      display: flex; 
      flex-direction: column; 
      max-height: 240px; 
      overflow-y: auto;
      overflow-x: hidden;
    }

    .eval-rows::-webkit-scrollbar {
      width: 6px;
    }

    .eval-rows::-webkit-scrollbar-track {
      background: #f8fafc;
    }

    .eval-rows::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .eval-rows::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    
    .eval-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 24px;
      transition: all 0.25s ease;
      border-bottom: 1px solid #f8fafc;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: #3b82f6;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
      }

      &:hover {
        background: linear-gradient(90deg, rgba(59, 130, 246, 0.04) 0%, transparent 100%);
        padding-left: 28px;

        &::before {
          transform: scaleX(1);
        }
      }
    }

    .e-info { 
      display: flex; 
      flex-direction: column;
      gap: 4px; 
    }
    .e-title { 
      font-size: 14px; 
      font-weight: 600; 
      color: #334155;
      line-height: 1.3; 
    }
    .e-meta { 
      font-size: 11px; 
      color: #94a3b8;
      font-weight: 500; 
    }

    .score-badge {
      font-size: 15px;
      font-weight: 700;
      min-width: 32px;
      text-align: right;
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .eval-item:hover .score-badge {
      transform: scale(1.12);
    }

    .score-badge.excellent { 
      color: #059669;
      background: rgba(5, 150, 105, 0.08);
    }
    .score-badge.good { 
      color: #2563eb;
      background: rgba(37, 99, 235, 0.08);
    }
    .score-badge.regular { 
      color: #d97706;
      background: rgba(217, 119, 6, 0.08);
    }
    .score-badge.poor { 
      color: #dc2626;
      background: rgba(220, 38, 38, 0.08);
    }

    /* Empty states - Mejorados */
    .empty-card { 
      opacity: 0.75;
      transition: opacity 0.3s ease;
    }

    .empty-card:hover {
      opacity: 0.9;
    }

    .empty-state-inner {
      padding: 48px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #94a3b8;
    }
    .empty-state-inner mat-icon { 
      font-size: 48px; 
      width: 48px; 
      height: 48px; 
      margin-bottom: 12px; 
      opacity: 0.4;
      color: #cbd5e1;
    }
    .empty-state-inner p { 
      font-size: 13px; 
      font-weight: 600; 
      margin: 0;
      color: #94a3b8; 
    }

    .no-data-card {
      padding: 80px 40px !important;
      text-align: center;
      border-radius: 20px !important;
      border: 2px dashed #e2e8f0 !important;
      background: linear-gradient(135deg, rgba(248, 250, 252, 0.5) 0%, rgba(241, 245, 249, 0.5) 100%) !important;
    }
    .no-data mat-icon { 
      font-size: 80px; 
      width: 80px; 
      height: 80px; 
      color: #cbd5e1; 
      margin-bottom: 20px;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .no-data p { 
      color: #64748b; 
      font-size: 16px; 
      font-weight: 600;
      margin: 0; 
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .subject-grid { 
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
      }
    }

    @media (max-width: 1024px) {
      .summary-cards { 
        grid-template-columns: repeat(2, 1fr); 
      }
    }

    @media (max-width: 768px) {
      .grades-container {
        padding: 4px;
      }

      .summary-cards { 
        grid-template-columns: 1fr;
        gap: 16px;
        margin-bottom: 24px;
      }

      .summary-card {
        padding: 20px !important;
      }

      .subject-grid { 
        grid-template-columns: 1fr;
        gap: 20px; 
      }

      .subject-card-header {
        padding: 16px 20px;
      }

      .eval-item {
        padding: 12px 20px;
      }
    }

    @media (max-width: 640px) {
      .icon-box {
        width: 48px;
        height: 48px;
      }

      .icon-box mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .summary-value {
        font-size: 22px;
      }

      .subject-name {
        font-size: 15px;
      }
    }
  `]
})
export class StudentGradesComponent implements OnInit {
  @Input() studentId?: number;
  assignments: any[] = [];
  groupedAssignments: any[] = [];
  subjects: Subject[] = [];
  displayedColumns: string[] = ['subject', 'evaluations', 'average'];

  constructor(
    private studentAssignmentsService: StudentAssignmentsService,
    private subjectsService: SubjectsService,
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
    forkJoin({
      assignments: this.studentAssignmentsService.findByStudent(this.studentId!),
      subjects: this.subjectsService.getAll()
    }).subscribe(({ assignments, subjects }) => {
      this.assignments = assignments;
      this.subjects = subjects;
      this.groupAssignments();
      console.log('📊 Subjects loaded:', this.subjects.length);
      console.log('📊 Assignments loaded:', this.assignments.length);
      console.log('📊 Grouped:', this.groupedAssignments);
    });
  }

  groupAssignments() {
    const groups: { [key: string]: any } = {};

    // 1. Identificar todos los Group IDs a los que el estudiante está asignado
    const assignedGroupIds = this.assignments.map(a => a.groupId);

    // 2. Filtrar las materias que pertenecen a esos grupos
    const relevantSubjects = this.subjects.filter(s => assignedGroupIds.includes(s.groupId));

    // 3. Inicializar el objeto groups con todas las materias relevantes
    relevantSubjects.forEach(subject => {
      const assignment = this.assignments.find(a => a.groupId === subject.groupId);
      groups[subject.id] = {
        subjectId: subject.id,
        subjectName: subject.name,
        groupName: assignment?.group?.name || 'N/A',
        grades: []
      };
    });

    // 4. Distribuir las calificaciones existentes
    this.assignments.forEach(a => {
      if (a.grades && a.grades.length > 0) {
        a.grades.forEach((grade: any) => {
          const subjectId = grade.evaluationItem?.subjectId;
          if (subjectId) {
            if (groups[subjectId]) {
              // Evitar duplicados si la misma nota viene en varias asignaciones por error
              if (!groups[subjectId].grades.find((g: any) => g.id === grade.id)) {
                groups[subjectId].grades.push(grade);
              }
            } else {
              // Si tiene nota pero la materia no se encontró filtrando por grupo (caso de respaldo)
              const subject = this.subjects.find(s => s.id === subjectId);
              groups[subjectId] = {
                subjectId: subjectId,
                subjectName: subject?.name || 'Materia Extra',
                groupName: a.group?.name || 'N/A',
                grades: [grade]
              };
            }
          }
        });
      }
    });

    this.groupedAssignments = Object.values(groups);
  }

  calculateItemAverage(item: any): number {
    if (!item.grades || item.grades.length === 0) return 0;
    const sum = item.grades.reduce((acc: number, grade: any) => acc + Number(grade.score || 0), 0);
    return sum / item.grades.length;
  }

  /**
   * Promedio Global: Promedio de absolutamente todas las evaluaciones registradas.
   */
  calculateGlobalAverage(): number {
    let totalScore = 0;
    let totalGradesCount = 0;

    this.assignments.forEach(assignment => {
      if (assignment.grades && assignment.grades.length > 0) {
        assignment.grades.forEach((grade: any) => {
          totalScore += Number(grade.score || 0);
          totalGradesCount++;
        });
      }
    });

    return totalGradesCount > 0 ? totalScore / totalGradesCount : 0;
  }

  /**
   * Promedio General: Es el promedio de los promedios de cada materia.
   * Se considera más equitativo ya que cada materia pesa lo mismo en el general.
   */
  calculateGeneralAverage(): number {
    const subjectsWithGrades = this.groupedAssignments.filter(item => item.grades && item.grades.length > 0);

    if (subjectsWithGrades.length === 0) return 0;

    const subjectAveragesSum = subjectsWithGrades.reduce((acc, item) => {
      return acc + this.calculateItemAverage(item);
    }, 0);

    return subjectAveragesSum / subjectsWithGrades.length;
  }

  getAssignmentAverage(assignment: any): number {
    if (!assignment.grades || assignment.grades.length === 0) return 0;
    const sum = assignment.grades.reduce((acc: number, grade: any) => acc + Number(grade.score || 0), 0);
    return sum / assignment.grades.length;
  }

  getUniqueSubjects(): number {
    return this.groupedAssignments.length;
  }

  getTotalGrades(): number {
    if (!this.assignments) return 0;
    return this.assignments.reduce((total, assignment) => {
      return total + (assignment.grades?.length || 0);
    }, 0);
  }

  getScoreClass(score: any): string {
    if (score === null || score === undefined || score === '') return '';
    const numScore = Number(score);
    if (numScore >= 90) return 'excellent';
    if (numScore >= 70) return 'good';
    if (numScore >= 60) return 'regular';
    return 'poor';
  }
}
