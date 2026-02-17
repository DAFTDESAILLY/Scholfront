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
import { StudentAssignmentsService } from '../../../core/services/student-assignments.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Subject } from '../../../core/models/subject.model';
import { Evaluation } from '../../../core/models/evaluation.model';
import { HelpIconComponent } from '../../../shared/components/help-icon/help-icon.component';

interface GradingRow {
    studentId: number;
    studentName: string;
    studentAssignmentId: number;
    score: number;
    feedback: string;
    gradeId?: number; // ID de la calificación si ya existe
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
        MatProgressSpinnerModule
    ],
    templateUrl: './grading.component.html',
    styleUrls: ['./grading.component.scss']
})
export class GradingComponent implements OnInit {
    filterForm: FormGroup;
    subjects: Subject[] = [];
    evaluations: Evaluation[] = [];
    gradingData: GradingRow[] = [];
    displayedColumns: string[] = ['name', 'score', 'feedback'];
    isLoading = false;
    isSaving = false;

    constructor(
        private fb: FormBuilder,
        private evaluationsService: EvaluationsService,
        private subjectsService: SubjectsService,
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
            this.loadEvaluations(subjectId);
            // Reset evaluationId when subject changes
            this.filterForm.patchValue({ evaluationId: '' });
            this.gradingData = [];
        });
    }

    loadSubjects() {
        this.subjectsService.getAll()
            .pipe(
                catchError(error => {
                    console.warn('No se pudieron cargar las materias. Backend no disponible.');
                    this.notificationService.warning('No se pudieron cargar las materias');
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
                    this.notificationService.warning('No se pudieron cargar las evaluaciones');
                    return of([]);
                })
            )
            .subscribe(data => this.evaluations = data);
    }

    onLoadGrades() {
        if (this.filterForm.invalid) {
            this.notificationService.warning('Por favor seleccione una materia y una evaluación.');
            return;
        }

        const evaluationId = this.filterForm.get('evaluationId')?.value;
        const subjectId = this.filterForm.get('subjectId')?.value;

        this.isLoading = true;
        this.gradingData = [];

        // Get the selected evaluation to access its groupId
        const selectedEvaluation = this.evaluations.find(e => e.id === evaluationId);
        if (!selectedEvaluation) {
            this.notificationService.error('Evaluación no encontrada');
            this.isLoading = false;
            return;
        }

        // Get the selected subject to access its groupId
        const selectedSubject = this.subjects.find(s => s.id === subjectId);
        if (!selectedSubject) {
            this.notificationService.error('Materia no encontrada');
            this.isLoading = false;
            return;
        }

        // Use groupId from subject
        const groupId = selectedSubject.groupId;
        
        forkJoin({
            assignments: this.studentAssignmentsService.getAssignmentsByGroup(groupId)
                .pipe(catchError(() => of([]))),
            existingGrades: this.evaluationsService.getGradesByEvaluation(evaluationId)
                .pipe(catchError(() => of([])))
        }).subscribe({
            next: ({ assignments, existingGrades }) => {
                console.log('📥 Asignaciones cargadas:', assignments);
                console.log('📥 Calificaciones existentes:', existingGrades);

                if (assignments.length === 0) {
                    this.notificationService.warning('No se encontraron estudiantes asignados a este grupo.');
                    this.isLoading = false;
                    return;
                }

                // Crear mapa de calificaciones existentes por studentAssignmentId
                const gradesMap = new Map();
                existingGrades.forEach(grade => {
                    gradesMap.set(grade.studentAssignmentId, grade);
                });

                // Mapear asignaciones a filas de calificación
                this.gradingData = assignments
                    .filter(assignment => assignment.unassignedAt === null || assignment.unassignedAt === undefined)
                    .map(assignment => {
                        const existingGrade = gradesMap.get(assignment.id);
                        return {
                            studentId: assignment.studentId,
                            studentName: assignment.student?.fullName || 'Estudiante desconocido',
                            studentAssignmentId: assignment.id,
                            score: existingGrade?.score || 0,
                            feedback: existingGrade?.feedback || '',
                            gradeId: existingGrade?.id
                        };
                    });

                console.log('✅ Datos de calificación preparados:', this.gradingData);
                this.notificationService.success(`${this.gradingData.length} estudiantes cargados.`);
                this.isLoading = false;
            },
            error: (err) => {
                console.error('❌ Error cargando datos:', err);
                this.notificationService.error('Error al cargar estudiantes y calificaciones');
                this.isLoading = false;
            }
        });
    }

    saveGrades() {
        if (this.gradingData.length === 0) {
            this.notificationService.warning('No hay calificaciones para guardar');
            return;
        }

        // Validar que al menos una calificación tenga un score válido
        const hasValidScores = this.gradingData.some(row => row.score > 0);
        if (!hasValidScores) {
            this.notificationService.warning('Por favor ingrese al menos una calificación antes de guardar');
            return;
        }

        const evaluationId = this.filterForm.get('evaluationId')?.value;

        // Mapear al formato correcto que espera el backend
        const grades = this.gradingData.map(item => ({
            evaluationItemId: evaluationId,           // ✅ Nombre correcto
            studentAssignmentId: item.studentAssignmentId, // ✅ Nombre correcto
            score: item.score,
            feedback: item.feedback || ''
        }));

        console.log('📤 Guardando calificaciones:', grades);

        this.isSaving = true;
        this.evaluationsService.saveGrades(grades).subscribe({
            next: (result) => {
                console.log('✅ Respuesta del servidor:', result);
                this.notificationService.success('Calificaciones guardadas exitosamente');
                this.isSaving = false;
                
                // Recargar las calificaciones para reflejar los cambios
                this.onLoadGrades();
            },
            error: (err) => {
                console.error('❌ Error guardando calificaciones:', err);
                console.error('❌ Detalles del error:', err.error);

                let errorMsg = 'Error al guardar calificaciones';
                if (err.error?.message) {
                    errorMsg = `Error: ${err.error.message}`;
                } else if (err.status === 0) {
                    errorMsg = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
                } else if (err.status === 400) {
                    errorMsg = 'Datos inválidos. Verifica los campos.';
                } else if (err.status === 500) {
                    errorMsg = 'Error interno del servidor. Revisa los logs del backend.';
                }

                this.notificationService.error(errorMsg);
                this.isSaving = false;
            }
        });
    }
}
