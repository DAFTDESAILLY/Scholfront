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
import { MatIconModule } from '@angular/material/icon';
import { EvaluationsService } from '../../../core/services/evaluations.service';
import { SubjectsService } from '../../../core/services/subjects.service';
import { StudentsService } from '../../../core/services/students.service';
import { StudentAssignmentsService } from '../../../core/services/student-assignments.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Subject } from '../../../core/models/subject.model';
import { Evaluation } from '../../../core/models/evaluation.model';
import { HelpIconComponent } from '../../../shared/components/help-icon/help-icon.component';

interface GradingDataRow {
    studentId: number;
    studentAssignmentId: number;
    studentName: string;
    score: number;
    feedback: string;
    hasGrade: boolean;
}

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
        MatProgressSpinnerModule,
        MatIconModule
    ],
    templateUrl: './grading.component.html',
    styleUrls: ['./grading.component.scss']
})
export class GradingComponent implements OnInit {
    filterForm: FormGroup;
    subjects: Subject[] = [];
    evaluations: Evaluation[] = [];
    gradingData: GradingDataRow[] = [];
    displayedColumns: string[] = ['name', 'score', 'feedback', 'status'];
    isLoading = false;
    isSaving = false;

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
        if (!this.filterForm.valid) {
            this.notificationService.warning('Por favor seleccione una materia y una evaluación.');
            return;
        }

        const evaluationId = this.filterForm.get('evaluationId')?.value;
        const subjectId = this.filterForm.get('subjectId')?.value;

        console.log('🔄 Cargando calificaciones para evaluación:', evaluationId);
        
        this.isLoading = true;
        this.gradingData = [];

        // Get the selected evaluation to find its groupId
        const selectedEvaluation = this.evaluations.find(e => e.id === evaluationId);
        if (!selectedEvaluation) {
            console.error('❌ Evaluación no encontrada');
            this.notificationService.error('Evaluación no encontrada.');
            this.isLoading = false;
            return;
        }

        console.log('📚 Evaluación seleccionada:', selectedEvaluation);

        // We need to get the groupId from the subject or evaluation
        // For now, we'll load all students and try to find their assignments
        forkJoin({
            students: this.studentsService.getAll().pipe(
                catchError(error => {
                    console.error('❌ Error loading students:', error);
                    return of([]);
                })
            ),
            grades: this.evaluationsService.getGradesByEvaluation(evaluationId).pipe(
                catchError(error => {
                    console.warn('⚠️ No se pudieron cargar calificaciones existentes:', error);
                    return of([]);
                })
            )
        }).subscribe({
            next: ({ students, grades }) => {
                console.log(`👥 Estudiantes cargados: ${students.length}`);
                console.log(`📊 Calificaciones existentes: ${grades.length}`);

                if (students.length === 0) {
                    this.notificationService.warning('No se encontraron estudiantes registrados.');
                    this.isLoading = false;
                    return;
                }

                // Now we need to get student assignments for each student
                // We'll create a map of studentId -> studentAssignmentId
                const assignmentRequests = students.map(student =>
                    this.studentAssignmentsService.getAssignmentsByStudent(student.id).pipe(
                        catchError(error => {
                            console.warn(`⚠️ No se pudieron cargar asignaciones para estudiante ${student.id}:`, error);
                            return of([]);
                        })
                    )
                );

                forkJoin(assignmentRequests).subscribe({
                    next: (assignmentsArrays) => {
                        console.log('📋 Asignaciones cargadas para todos los estudiantes');

                        // Create a map of studentId -> active assignment
                        const studentAssignmentMap = new Map<number, { id: number; studentId: number }>();
                        
                        students.forEach((student, index) => {
                            const assignments = assignmentsArrays[index];
                            // Filter for active assignments only (unassignedAt === null)
                            const activeAssignment = assignments.find(a => a.unassignedAt === null);
                            if (activeAssignment) {
                                studentAssignmentMap.set(student.id, activeAssignment);
                            }
                        });

                        console.log(`✅ Estudiantes con asignaciones activas: ${studentAssignmentMap.size}`);

                        // Build grading data
                        this.gradingData = students
                            .filter(student => studentAssignmentMap.has(student.id))
                            .map(student => {
                                const assignment = studentAssignmentMap.get(student.id)!;
                                // Check if grade exists by studentId or by potential studentAssignmentId field
                                const existingGrade = grades.find(g => {
                                    // Backend might return grades with studentId or with studentAssignmentId
                                    const gradeData = g as any;
                                    return g.studentId === student.id || 
                                           (gradeData.studentAssignmentId && gradeData.studentAssignmentId === assignment.id);
                                });

                                return {
                                    studentId: student.id,
                                    studentAssignmentId: assignment.id,
                                    studentName: student.fullName,
                                    score: existingGrade ? existingGrade.score : 0,
                                    feedback: existingGrade ? (existingGrade.feedback || '') : '',
                                    hasGrade: !!existingGrade
                                };
                            });

                        console.log(`📝 Datos de calificación preparados: ${this.gradingData.length} estudiantes`);
                        
                        if (this.gradingData.length === 0) {
                            this.notificationService.warning('No hay estudiantes asignados a grupos activos.');
                        } else {
                            this.notificationService.success(`${this.gradingData.length} estudiantes cargados.`);
                        }
                        
                        this.isLoading = false;
                    },
                    error: (error) => {
                        console.error('❌ Error al cargar asignaciones:', error);
                        this.notificationService.error('Error al cargar asignaciones de estudiantes.');
                        this.isLoading = false;
                    }
                });
            },
            error: (error) => {
                console.error('❌ Error al cargar datos iniciales:', error);
                this.notificationService.error('Error al cargar datos. Verifique la conexión.');
                this.isLoading = false;
            }
        });
    }

    saveGrades() {
        // Validate that we have data to save
        if (this.gradingData.length === 0) {
            this.notificationService.warning('No hay datos para guardar. Por favor cargue las calificaciones primero.');
            return;
        }

        // Validate that at least one grade has been entered (score > 0)
        const hasValidGrades = this.gradingData.some(item => item.score > 0);
        if (!hasValidGrades) {
            this.notificationService.warning('Debe ingresar al menos una calificación con puntuación mayor a 0.');
            return;
        }

        const evaluationId = this.filterForm.get('evaluationId')?.value;
        
        // Map to correct field names: evaluationItemId and studentAssignmentId
        const grades = this.gradingData.map(item => ({
            evaluationItemId: evaluationId,
            studentAssignmentId: item.studentAssignmentId,
            score: item.score,
            feedback: item.feedback || ''
        }));

        console.log('📤 Guardando calificaciones con campos correctos:', { grades });

        this.isSaving = true;

        this.evaluationsService.saveGrades(grades).subscribe({
            next: () => {
                console.log('✅ Calificaciones guardadas exitosamente');
                this.notificationService.success('Calificaciones guardadas exitosamente');
                this.isSaving = false;
                
                // Reload grades after successful save
                console.log('🔄 Recargando calificaciones...');
                this.onLoadGrades();
            },
            error: (err) => {
                console.error('❌ Error guardando calificaciones:', err);
                console.error('❌ Detalles del error:', err.error);

                let errorMsg = 'Error al guardar calificaciones';
                if (err.error?.message) {
                    errorMsg = `Error: ${err.error.message}`;
                    console.error('❌ Mensaje del backend:', err.error.message);
                } else if (err.status === 400) {
                    errorMsg = 'Error de validación. Verifique que los datos sean correctos.';
                } else if (err.status === 404) {
                    errorMsg = 'Recurso no encontrado. Verifique que la evaluación exista.';
                } else if (err.status === 500) {
                    errorMsg = 'Error del servidor. Intente nuevamente más tarde.';
                }

                this.notificationService.error(errorMsg);
                this.isSaving = false;
            }
        });
    }
}
