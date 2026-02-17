import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { catchError, of, forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EvaluationsService } from '../../../core/services/evaluations.service';
import { SubjectsService } from '../../../core/services/subjects.service';
import { StudentsService } from '../../../core/services/students.service';
import { StudentAssignmentsService } from '../../../core/services/student-assignments.service';
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
        MatProgressSpinnerModule
    ],
    templateUrl: './grading.component.html',
    styleUrls: ['./grading.component.scss']
})
export class GradingComponent implements OnInit {
    filterForm: FormGroup;
    subjects: Subject[] = [];
    evaluations: Evaluation[] = [];
    gradingData: any[] = [];
    displayedColumns: string[] = ['name', 'score', 'feedback', 'status'];
    isLoading: boolean = false;
    isSaving: boolean = false;

    constructor(
        private fb: FormBuilder,
        private evaluationsService: EvaluationsService,
        private subjectsService: SubjectsService,
        private studentsService: StudentsService,
        private studentAssignmentsService: StudentAssignmentsService,
        private notificationService: NotificationService
    ) {
        this.filterForm = this.fb.group({
            subjectId: ['', Validators.required],
            evaluationId: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadSubjects();

        this.filterForm.get('subjectId')?.valueChanges.subscribe(subjectId => {
            this.loadAssessments(subjectId);
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

    loadAssessments(subjectId: number) {
        this.evaluationsService.getBySubject(subjectId)
            .pipe(
                catchError(error => {
                    console.warn('No se pudieron cargar las evaluaciones.');
                    return of([]);
                })
            )
            .subscribe(data => this.evaluations = data);
    }

    onLoadGrades() {
        if (this.filterForm.valid) {
            const evaluationId = this.filterForm.get('evaluationId')?.value;
            this.isLoading = true;
            this.gradingData = []; // Reset data

            // Load students and existing grades in parallel
            forkJoin({
                students: this.studentsService.getAll().pipe(
                    catchError(error => {
                        console.error('Error loading students:', error);
                        return of([]);
                    })
                ),
                grades: this.evaluationsService.getGradesByEvaluation(evaluationId).pipe(
                    catchError(error => {
                        console.warn('No existing grades found:', error);
                        return of([]);
                    })
                )
            }).subscribe({
                next: ({ students, grades }) => {
                    this.isLoading = false;

                    if (students.length === 0) {
                        this.notificationService.warning('No se encontraron estudiantes registrados.');
                        return;
                    }

                    // Create a map of existing grades by studentAssignmentId for quick lookup
                    const gradesMap = new Map(grades.map(grade => [grade.studentAssignmentId, grade]));

                    // Map students with their grades
                    // Note: In the current implementation, we don't have the group context,
                    // so we're mapping by studentId. In a complete implementation, we would
                    // fetch student assignments for the relevant group.
                    this.gradingData = students.map(student => {
                        // Try to find existing grade by matching studentAssignmentId with studentId
                        // This is a temporary workaround until proper group context is added
                        const existingGrade = Array.from(gradesMap.values()).find(
                            grade => grade.studentAssignmentId === student.id
                        );
                        
                        return {
                            studentId: student.id,
                            studentAssignmentId: existingGrade?.studentAssignmentId || student.id,
                            studentName: student.fullName,
                            score: existingGrade?.score || 0,
                            feedback: existingGrade?.feedback || '',
                            hasExistingGrade: !!existingGrade
                        };
                    });

                    this.notificationService.success(
                        `${students.length} estudiantes cargados. ${grades.length} calificaciones existentes.`
                    );
                },
                error: (error) => {
                    this.isLoading = false;
                    console.error('Error loading data:', error);
                    this.notificationService.error('Error al cargar los datos. Verifique la conexión.');
                }
            });
        } else {
            this.notificationService.warning('Por favor seleccione una materia y una evaluación.');
        }
    }

    saveGrades() {
        // Validate that there is at least one grade with a score > 0
        const gradesWithScores = this.gradingData.filter(item => item.score > 0);
        if (gradesWithScores.length === 0) {
            this.notificationService.warning('Por favor ingrese al menos una calificación antes de guardar.');
            return;
        }

        this.isSaving = true;
        const evaluationItemId = this.filterForm.get('evaluationId')?.value;
        
        // Map to the correct field names expected by backend
        // Only send grades with score > 0 to match validation
        const grades = gradesWithScores.map(item => ({
            evaluationItemId,
            studentAssignmentId: item.studentAssignmentId,
            score: item.score,
            feedback: item.feedback || ''
        }));

        console.log('📤 Guardando calificaciones:', { grades });

        this.evaluationsService.saveGrades(grades).subscribe({
            next: () => {
                this.isSaving = false;
                // Mark all saved grades
                this.gradingData.forEach(item => {
                    if (item.score > 0) {
                        item.hasExistingGrade = true;
                    }
                });
                this.notificationService.success('Calificaciones guardadas exitosamente');
            },
            error: (err) => {
                this.isSaving = false;
                console.error('❌ Error guardando calificaciones:', err);
                console.error('❌ Detalles del error:', err.error);

                let errorMsg = 'Error al guardar calificaciones';
                if (err.error?.message) {
                    errorMsg = `Error: ${err.error.message}`;
                    console.error('❌ Mensaje del backend:', err.error.message);
                }

                this.notificationService.error(errorMsg);
            }
        });
    }
}
