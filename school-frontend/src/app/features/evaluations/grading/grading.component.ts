
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EvaluationsService } from '../../../core/services/evaluations.service';
import { SubjectsService } from '../../../core/services/subjects.service';
import { StudentsService } from '../../../core/services/students.service';
import { GradesService } from '../../../core/services/grades.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Subject } from '../../../core/models/subject.model';
import { Evaluation } from '../../../core/models/evaluation.model';
import { HelpIconComponent } from '../../../shared/components/help-icon/help-icon.component';

@Component({
    selector: 'app-grading',
    standalone: true,
    imports: [
        CommonModule,
        HelpIconComponent,
        ReactiveFormsModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatTableModule,
        MatInputModule,
        MatIconModule,
        MatChipsModule,
        MatSnackBarModule
    ],
    templateUrl: './grading.component.html',
    styleUrls: ['./grading.component.scss']
})
export class GradingComponent implements OnInit {
    filterForm: FormGroup;
    subjects: Subject[] = [];
    evaluations: Evaluation[] = [];
    gradingData: any[] = [];
    displayedColumns: string[] = ['name', 'score', 'feedback'];
    students: any[] = [];
    selectedEvaluationItem: any;
    selectedGroupId: number | null = null;

    constructor(
        private fb: FormBuilder,
        private evaluationsService: EvaluationsService,
        private subjectsService: SubjectsService,
        private studentsService: StudentsService,
        private gradesService: GradesService,
        private notificationService: NotificationService,
        private snackBar: MatSnackBar
    ) {
        this.filterForm = this.fb.group({
            subjectId: ['', Validators.required],
            evaluationId: ['', Validators.required],
            groupId: ['']
        });
    }


    ngOnInit() {
        this.loadSubjects();

        this.filterForm.get('subjectId')?.valueChanges.subscribe(subjectId => {
            this.loadEvaluations(subjectId);

            // Auto-select group based on subject
            const selectedSubject = this.subjects.find(s => s.id === Number(subjectId));
            if (selectedSubject && selectedSubject.groupId) {
                this.selectedGroupId = selectedSubject.groupId;
                // Update form control if it exists, though we might not need it visible
                this.filterForm.patchValue({ groupId: selectedSubject.groupId }, { emitEvent: false });
                this.loadStudents();
            } else if (selectedSubject) {
                console.warn('Subject has no groupId:', selectedSubject);
            }
        });

        this.filterForm.get('groupId')?.valueChanges.subscribe(groupId => {
             if (groupId) {
                 this.selectedGroupId = groupId;
                 this.loadStudents();
             }
        });
    }

    loadSubjects() {
        this.subjectsService.getAll()
            .pipe(
                catchError(error => {
                    console.warn('No se pudieron cargar las materias. Backend no disponible.');
                    return of([]);
                })
            )
            .subscribe(data => this.subjects = data);
    }

    loadEvaluations(subjectId: number) {
        this.evaluationsService.getBySubject(subjectId)
            .pipe(
                catchError(error => {
                    console.warn('No se pudieron cargar las evaluaciones.');
                    return of([]);
                })
            )
            .subscribe(data => this.evaluations = data);
    }

    /* Existing onLoadGrades logic preserved but maybe not used by new features */


    loadStudents() {
        let request$;
        
        if (this.selectedGroupId) {
             console.log('🔄 Fetching students for group:', this.selectedGroupId);
             request$ = this.studentsService.getStudentsByGroup(this.selectedGroupId);
        } else {
             // Fallback: try to find groupId from subjectId selector
             const subjectId = this.filterForm.get('subjectId')?.value;
             // Loose comparison because form value might be string
             const subject = this.subjects.find(s => s.id == subjectId);
             
             if (subject && subject.groupId) {
                 this.selectedGroupId = subject.groupId;
                 console.log('🔄 Inferring group from subject:', subject.groupId);
                 request$ = this.studentsService.getStudentsByGroup(subject.groupId);
             } else {
                 console.warn('⚠️ No group context found. Fetching all students (might lack assignmentId).');
                 request$ = this.studentsService.getAll();
             }
        }

        request$.subscribe({
          next: (students: any[]) => {
            if (!students) students = [];
            
            // If we got 0 students via assignments, try fallback to ALL students for debugging
            // This helps confirm if students exist but just aren't assigned
            if (students.length === 0 && this.selectedGroupId) {
                console.warn('⚠️ No active assignments found. Checking if ANY students exist...');
                this.studentsService.getAll().subscribe(all => {
                    if (all.length > 0) {
                        this.snackBar.open(`⚠️ Alerta: Hay ${all.length} estudiantes en sistema pero 0 en este grupo. Asigne estudiantes primero.`, 'Cerrar', { duration: 8000 });
                    }
                });
            }

            this.students = students.map(s => ({
              ...s,
              grade: null,      // Campo para capturar calificación
              score: null,      // Alias para la vista
              feedback: '',     // Campo para capturar retroalimentación
              assignmentId: s.studentAssignmentId || s.assignmentId || s.id,
              studentName: s.fullName || (s.firstName ? `${s.firstName} ${s.lastName}` : 'Estudiante sin nombre') // Mapeo robusto
            }));
             this.gradingData = this.students;
             
             if (this.students.length === 0) {
                 // Message already handled above or by snackbar
             } else {
                 console.log(`✅ ${this.students.length} Estudiantes cargados`);
             }
          },
          error: (err: any) => {
            console.error('❌ Error cargando estudiantes:', err);
            this.snackBar.open('Error al cargar estudiantes', 'OK', { duration: 3000 });
          }
        });
    }

    
      saveGrades() {
        // Filtrar solo estudiantes con calificación ingresada (usando 'score' que es lo que enlaza la vista)
        const gradesToSave = this.students
          .filter(s => s.score !== null && s.score !== undefined && s.score !== '')
          .map(student => ({
            studentAssignmentId: student.assignmentId,  // ✅ Incluir ID de asignación
            evaluationItemId: this.selectedEvaluationItem ? this.selectedEvaluationItem.id : this.filterForm.get('evaluationId')?.value,
            score: parseFloat(student.score),
            feedback: student.feedback || ''
          }));
    
        if (gradesToSave.length === 0) {
          this.snackBar.open('No hay calificaciones para guardar', 'OK', { duration: 3000 });
          return;
        }
    
        // Validar antes de enviar
        const invalid = gradesToSave.filter(g => !g.studentAssignmentId);
        if (invalid.length > 0) {
          console.error('❌ Calificaciones sin assignmentId:', invalid);
          this.snackBar.open('Error: Faltan datos de asignación', 'OK', { duration: 3000 });
          return;
        }
    
        console.log('📤 Guardando calificaciones:', gradesToSave);
    
        this.gradesService.saveBatch(gradesToSave).subscribe({
          next: (response) => {
            console.log('✅ Respuesta del servidor:', response);
            this.snackBar.open(
              `${response.length} calificaciones guardadas exitosamente`, 
              'OK', 
              { duration: 3000 }
            );
            
            // Recargar calificaciones para reflejar cambios
            this.loadStudents();
          },
          error: (err) => {
            console.error('❌ Error guardando calificaciones:', err);
            this.snackBar.open(
              'Error al guardar calificaciones', 
              'OK', 
              { duration: 3000 }
            );
          }
        });
      }



    onLoadGrades() {
       this.loadStudents();
    }

    // Métodos para estadísticas
    getAverageScore(): number {
        const validScores = this.students.filter(s => s.score !== null && s.score !== undefined && s.score !== '');
        if (validScores.length === 0) return 0;
        const sum = validScores.reduce((acc, s) => acc + parseFloat(s.score), 0);
        return Math.round((sum / validScores.length) * 10) / 10;
    }

    getGradedCount(): number {
        return this.students.filter(s => s.score !== null && s.score !== undefined && s.score !== '').length;
    }

    getPendingCount(): number {
        return this.students.length - this.getGradedCount();
    }

    getHighestScore(): number {
        const validScores = this.students.filter(s => s.score !== null && s.score !== undefined && s.score !== '');
        if (validScores.length === 0) return 0;
        return Math.max(...validScores.map(s => parseFloat(s.score)));
    }

    // Validación visual de calificaciones
    getScoreClass(score: any): string {
        if (score === null || score === undefined || score === '') return '';
        const numScore = parseFloat(score);
        if (numScore >= 90) return 'excellent';
        if (numScore >= 70) return 'good';
        if (numScore >= 60) return 'regular';
        return 'poor';
    }

    getSelectedEvaluationName(): string {
        const evalId = this.filterForm.get('evaluationId')?.value;
        const evaluation = this.evaluations.find(e => e.id === evalId);
        return evaluation ? evaluation.name : '';
    }

    getSelectedSubjectName(): string {
        const subjectId = this.filterForm.get('subjectId')?.value;
        const subject = this.subjects.find(s => s.id === subjectId);
        return subject ? subject.name : '';
    }
}
