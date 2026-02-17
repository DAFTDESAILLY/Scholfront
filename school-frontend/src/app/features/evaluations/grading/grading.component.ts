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
        MatInputModule
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
            const subjectId = this.filterForm.get('subjectId')?.value;
            // TODO: Add loading indicator
            this.gradingData = []; // Reset data

            // Get the selected subject to find the groupId
            const selectedSubject = this.subjects.find(s => s.id === subjectId);
            if (!selectedSubject) {
                this.notificationService.error('No se pudo encontrar la materia seleccionada.');
                return;
            }

            const groupId = selectedSubject.groupId;

            // Get student assignments for the group
            this.studentAssignmentsService.getAssignmentsByGroup(groupId)
                .pipe(
                    catchError(error => {
                        console.error('Error loading student assignments:', error);
                        this.notificationService.error('No se pudieron cargar las asignaciones de estudiantes.');
                        return of([]);
                    })
                )
                .subscribe(assignments => {
                    if (assignments.length === 0) {
                        this.notificationService.warning('No hay estudiantes asignados a este grupo.');
                        return;
                    }

                    // Map assignments to grading data
                    this.gradingData = assignments
                        .filter(assignment => !assignment.unassignedAt) // Only active assignments
                        .map(assignment => ({
                            studentAssignmentId: assignment.id,
                            studentId: assignment.studentId, // Keep for reference/debugging
                            studentName: assignment.student?.fullName || 'Nombre no disponible',
                            score: 0,
                            feedback: ''
                        }));

                    this.notificationService.success(`${this.gradingData.length} estudiantes cargados.`);
                });
        } else {
            this.notificationService.warning('Por favor seleccione una materia y una evaluación.');
        }
    }

    saveGrades() {
        const evaluationId = this.filterForm.get('evaluationId')?.value;
        const grades = this.gradingData.map(item => ({
            evaluationItemId: evaluationId,
            studentAssignmentId: item.studentAssignmentId,
            score: item.score,
            feedback: item.feedback || ''
        }));

        console.log('📤 Guardando calificaciones:', { grades });

        this.evaluationsService.saveGrades(grades).subscribe({
            next: () => {
                this.notificationService.success('Calificaciones guardadas exitosamente');
            },
            error: (err) => {
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
