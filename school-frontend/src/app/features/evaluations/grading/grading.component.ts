
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { catchError, of, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
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
        MatSnackBarModule,
        MatButtonToggleModule,
        MatProgressSpinnerModule,
        MatTooltipModule
    ],
    templateUrl: './grading.component.html',
    styleUrls: ['./grading.component.scss']
})
export class GradingComponent implements OnInit {
    filterForm: FormGroup;
    subjects: Subject[] = [];
    evaluations: Evaluation[] = [];
    gradingData: any[] = [];
    displayedColumns: string[] = ['name', 'status', 'score', 'feedback'];
    students: any[] = [];
    selectedEvaluationItem: any;
    selectedGroupId: number | null = null;

    // Vista Global
    currentView: 'grading' | 'global' | 'final' = 'grading';
    globalGradesData: any[] = [];
    globalDisplayedColumns: string[] = ['student', 'evaluations', 'average', 'highest', 'lowest', 'total', 'actions'];

    // Vista Final
    finalGradesData: any[] = [];
    finalDisplayedColumns: string[] = ['student', 'tasks', 'exams', 'projects', 'attendance', 'average', 'performance', 'status'];
    selectedSubjectForFinal: any = null;
    loadingGlobal = false;
    globalFiltersForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private evaluationsService: EvaluationsService,
        private subjectsService: SubjectsService,
        private studentsService: StudentsService,
        private gradesService: GradesService,
        private notificationService: NotificationService,
        private snackBar: MatSnackBar,
        private router: Router
    ) {
        this.filterForm = this.fb.group({
            subjectId: ['', Validators.required],
            evaluationId: ['', Validators.required],
            groupId: ['']
        });

        this.globalFiltersForm = this.fb.group({
            subjectId: [''],
            evaluationId: ['']
        });
    }


    ngOnInit() {
        this.loadSubjects();

        this.filterForm.get('subjectId')?.valueChanges.subscribe(subjectId => {
            this.loadEvaluations(subjectId);
            // Limpiar datos al cambiar de materia
            this.students = [];
            this.gradingData = [];

            // Auto-select group based on subject
            const selectedSubject = this.subjects.find(s => s.id === Number(subjectId));
            if (selectedSubject && selectedSubject.groupId) {
                this.selectedGroupId = selectedSubject.groupId;
                // Update form control if it exists, though we might not need it visible
                this.filterForm.patchValue({ groupId: selectedSubject.groupId }, { emitEvent: false });
            } else if (selectedSubject) {
                console.warn('Subject has no groupId:', selectedSubject);
            }
        });

        this.filterForm.get('evaluationId')?.valueChanges.subscribe(evaluationId => {
            if (evaluationId && this.students.length > 0) {
                // Recargar calificaciones cuando cambie la evaluación
                console.log('📝 Evaluación cambiada a:', evaluationId);
                this.loadExistingGrades();
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
                    status: 'pending', // Estado: pending, graded, not-submitted
                    notSubmitted: false, // Flag para marcar como no entregado
                    assignmentId: s.studentAssignmentId || s.assignmentId || s.id,
                    studentName: s.fullName || (s.firstName ? `${s.firstName} ${s.lastName}` : 'Estudiante sin nombre') // Mapeo robusto
                }));
                this.gradingData = this.students;

                if (this.students.length === 0) {
                    // Message already handled above or by snackbar
                } else {
                    console.log(`✅ ${this.students.length} Estudiantes cargados`);
                    // Cargar calificaciones existentes después de cargar estudiantes
                    this.loadExistingGrades();
                }
            },
            error: (err: any) => {
                console.error('❌ Error cargando estudiantes:', err);
                this.snackBar.open('Error al cargar estudiantes', 'OK', { duration: 3000 });
            }
        });
    }

    loadExistingGrades() {
        const evaluationId = this.filterForm.get('evaluationId')?.value;
        if (!evaluationId) return;

        console.log('🔄 Cargando calificaciones existentes para evaluación:', evaluationId);
        this.gradesService.getByEvaluationItem(evaluationId).subscribe({
            next: (grades: any[]) => {
                console.log('📊 Calificaciones recibidas del backend:', grades);
                console.log('📋 Evaluación seleccionada ID:', evaluationId);

                // Filtrar calificaciones SOLO de esta evaluación específica
                const filteredGrades = grades.filter(g =>
                    g.evaluationItemId === Number(evaluationId) ||
                    g.evaluationItem?.id === Number(evaluationId)
                );

                console.log('✅ Calificaciones filtradas para esta evaluación:', filteredGrades);

                // Mapear calificaciones a estudiantes
                this.students.forEach(student => {
                    // Buscar calificación que coincida con el estudiante Y la evaluación
                    const existingGrade = filteredGrades.find(g => {
                        const matchesStudent = g.studentAssignmentId === student.assignmentId ||
                            g.studentAssignment?.id === student.assignmentId;
                        return matchesStudent;
                    });

                    if (existingGrade) {
                        student.score = existingGrade.score;
                        student.feedback = existingGrade.feedback || '';

                        // Determinar estado según la calificación
                        if (existingGrade.score === 0 || existingGrade.score === null) {
                            student.status = 'not-submitted';
                            student.notSubmitted = true;
                        } else {
                            student.status = 'graded';
                            student.notSubmitted = false;
                        }

                        console.log(`✅ Calificación cargada para ${student.studentName}: ${existingGrade.score} (EvalID: ${existingGrade.evaluationItemId})`);
                    } else {
                        // Resetear calificación si no existe para esta evaluación
                        student.score = null;
                        student.feedback = '';
                        student.status = 'pending';
                        student.notSubmitted = false;
                        console.log(`⏳ ${student.studentName}: Pendiente de calificar`);
                    }
                });
                this.gradingData = [...this.students]; // Forzar actualización de la vista
            },
            error: (err: any) => {
                console.warn('⚠️ No se pudieron cargar calificaciones existentes:', err);
                // Si hay error, marcar todos como pendientes
                this.students.forEach(student => {
                    student.score = null;
                    student.feedback = '';
                    student.status = 'pending';
                });
                this.gradingData = [...this.students];
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
        const validScores = this.students.filter(s => s.status === 'graded' && s.score !== null && s.score !== undefined && s.score !== '');
        if (validScores.length === 0) return 0;
        const sum = validScores.reduce((acc, s) => acc + parseFloat(s.score), 0);
        return Math.round((sum / validScores.length) * 10) / 10;
    }

    getGradedCount(): number {
        return this.students.filter(s => s.status === 'graded').length;
    }

    getPendingCount(): number {
        return this.students.filter(s => s.status === 'pending').length;
    }

    getNotSubmittedCount(): number {
        return this.students.filter(s => s.status === 'not-submitted').length;
    }

    getHighestScore(): number {
        const validScores = this.students.filter(s => s.status === 'graded' && s.score !== null && s.score !== undefined && s.score !== '');
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

    // Métodos para estados de calificación
    getStatusText(status: string): string {
        switch (status) {
            case 'graded':
                return 'Calificado';
            case 'pending':
                return 'Pendiente';
            case 'not-submitted':
                return 'No Entregó';
            default:
                return 'Pendiente';
        }
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'graded':
                return 'status-graded';
            case 'pending':
                return 'status-pending';
            case 'not-submitted':
                return 'status-not-submitted';
            default:
                return 'status-pending';
        }
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'graded':
                return 'check_circle';
            case 'pending':
                return 'pending';
            case 'not-submitted':
                return 'cancel';
            default:
                return 'pending';
        }
    }

    // Marcar o desmarcar como "No Entregó"
    toggleNotSubmitted(student: any) {
        if (student.notSubmitted) {
            // Si estaba marcado como no entregado, volver a pendiente
            student.notSubmitted = false;
            student.status = 'pending';
            student.score = null;
            student.feedback = '';
        } else {
            // Marcar como no entregado
            student.notSubmitted = true;
            student.status = 'not-submitted';
            student.score = 0;
            student.feedback = 'No entregó la evaluación';
        }
        this.gradingData = [...this.students]; // Forzar actualización
    }

    // Métodos para Vista Global
    onViewChange(view: 'grading' | 'global' | 'final') {
        this.currentView = view;
        if (view === 'global' && this.globalGradesData.length === 0) {
            this.loadGlobalGrades();
        } else if (view === 'final') {
            const subjectId = this.filterForm.get('subjectId')?.value;
            if (subjectId) {
                this.loadFinalGrades();
            }
        }
    }

    loadFinalGrades() {
        this.loadingGlobal = true;
        const subjectId = this.filterForm.get('subjectId')?.value;

        if (!subjectId) {
            this.loadingGlobal = false;
            this.snackBar.open('Selecciona una materia primero', 'OK', { duration: 3000 });
            return;
        }

        console.log('🔄 Cargando promedios finales para materia:', subjectId);
        
        // Cargar información de la materia para obtener la escala
        this.subjectsService.getById(subjectId).subscribe({
            next: (subject) => {
                this.selectedSubjectForFinal = subject;
                console.log('📚 Materia cargada:', subject);
                
                // Cargar todas las calificaciones y estudiantes para calcular promedios por tipo
                const requests = {
                    students: this.studentsService.getAll().pipe(catchError(() => of([]))),
                    grades: this.gradesService.getAll().pipe(catchError(() => of([])))
                };

                forkJoin(requests).subscribe({
                    next: (data) => {
                        const students = data.students;
                        const allGrades = data.grades;
                        
                        // Filtrar calificaciones por materia
                        const subjectGrades = allGrades.filter(g => 
                            g.evaluationItem && g.evaluationItem.subjectId === Number(subjectId)
                        );

                        this.finalGradesData = students.map(student => {
                            // Obtener todas las calificaciones del estudiante para esta materia
                            const studentGrades = subjectGrades.filter(g => {
                                // Comparar con el studentId del studentAssignment
                                const studentIdFromGrade = g.studentAssignment?.student?.id || g.studentAssignment?.studentId;
                                const matchesStudent = studentIdFromGrade === student.id;
                                return matchesStudent;
                            });

                            console.log(`📊 Estudiante: ${student.fullName}, Calificaciones encontradas: ${studentGrades.length}`);

                            // Calcular promedios por tipo de evaluación
                            const taskGrades = studentGrades.filter(g => 
                                g.evaluationItem?.type?.toLowerCase() === 'tarea'
                            ).map(g => Number(g.score)).filter(s => !isNaN(s) && s > 0);
                            
                            const examGrades = studentGrades.filter(g => 
                                g.evaluationItem?.type?.toLowerCase() === 'examen' || 
                                g.evaluationItem?.type?.toLowerCase() === 'exámen'
                            ).map(g => Number(g.score)).filter(s => !isNaN(s) && s > 0);
                            
                            const projectGrades = studentGrades.filter(g => 
                                g.evaluationItem?.type?.toLowerCase() === 'proyecto'
                            ).map(g => Number(g.score)).filter(s => !isNaN(s) && s > 0);
                            
                            const attendanceGrades = studentGrades.filter(g => 
                                g.evaluationItem?.type?.toLowerCase() === 'asistencia'
                            ).map(g => Number(g.score)).filter(s => !isNaN(s) && s > 0);

                            console.log(`  📝 Tareas: ${taskGrades.length}, Exámenes: ${examGrades.length}, Proyectos: ${projectGrades.length}, Asistencia: ${attendanceGrades.length}`);

                            // Calcular promedios
                            const tasksAverage = taskGrades.length > 0 
                                ? Math.round((taskGrades.reduce((a, b) => a + b, 0) / taskGrades.length) * 10) / 10 
                                : null;
                            
                            const examsAverage = examGrades.length > 0 
                                ? Math.round((examGrades.reduce((a, b) => a + b, 0) / examGrades.length) * 10) / 10 
                                : null;
                            
                            const projectsAverage = projectGrades.length > 0 
                                ? Math.round((projectGrades.reduce((a, b) => a + b, 0) / projectGrades.length) * 10) / 10 
                                : null;
                            
                            const attendanceAverage = attendanceGrades.length > 0 
                                ? Math.round((attendanceGrades.reduce((a, b) => a + b, 0) / attendanceGrades.length) * 10) / 10 
                                : null;

                            // Calcular promedio general
                            const allScores = studentGrades
                                .map(g => Number(g.score))
                                .filter(s => !isNaN(s) && s > 0);
                            
                            const average = allScores.length > 0 
                                ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10 
                                : 0;

                            // Calcular porcentaje de asistencia
                            const attendancePercentage = attendanceGrades.length > 0
                                ? Math.round((attendanceGrades.filter(g => g >= 90).length / attendanceGrades.length) * 100)
                                : 0;

                            return {
                                studentId: student.id,
                                studentName: student.fullName || 'Estudiante',
                                tasksAverage,
                                tasksCount: taskGrades.length,
                                examsAverage,
                                examsCount: examGrades.length,
                                projectsAverage,
                                projectsCount: projectGrades.length,
                                attendanceAverage,
                                attendancePercentage,
                                average
                            };
                        });

                        console.log('✅ Promedios finales calculados:', this.finalGradesData);
                        this.loadingGlobal = false;
                    },
                    error: (err) => {
                        console.error('❌ Error cargando datos:', err);
                        this.loadingGlobal = false;
                        this.finalGradesData = [];
                        this.snackBar.open('Error al cargar datos', 'OK', { duration: 3000 });
                    }
                });
            },
            error: (err) => {
                console.error('❌ Error cargando materia:', err);
                this.loadingGlobal = false;
            }
        });
    }

    loadGlobalGrades() {
        this.loadingGlobal = true;
        const subjectId = this.globalFiltersForm.get('subjectId')?.value;
        const evaluationId = this.globalFiltersForm.get('evaluationId')?.value;

        const requests = {
            students: this.studentsService.getAll().pipe(catchError(() => of([]))),
            grades: this.gradesService.getAll().pipe(catchError(() => of([])))
        };

        forkJoin(requests).subscribe({
            next: (data) => {
                const students = data.students;
                const grades = data.grades;

                const studentGrades = students.map(student => {
                    const studentGradesList = grades.filter(g => {
                        const matchesStudent = g.studentAssignmentId === student.id ||
                            (g.studentAssignment && g.studentAssignment.student && g.studentAssignment.student.id === student.id);
                        const matchesSubject = !subjectId || (g.evaluationItem && g.evaluationItem.subjectId === Number(subjectId));
                        const matchesEvaluation = !evaluationId || g.evaluationItemId === Number(evaluationId);

                        return matchesStudent && matchesSubject && matchesEvaluation;
                    });

                    const scores = studentGradesList
                        .map(g => Number(g.score))
                        .filter(s => !isNaN(s) && s !== null);

                    const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                    const highest = scores.length > 0 ? Math.max(...scores) : 0;
                    const lowest = scores.length > 0 ? Math.min(...scores) : 0;

                    return {
                        studentId: student.id,
                        studentName: student.fullName || 'Estudiante',
                        evaluationsCount: studentGradesList.length,
                        average: Math.round(average * 10) / 10,
                        highest,
                        lowest,
                        totalGrades: scores.length
                    };
                });

                this.globalGradesData = studentGrades;
                this.loadingGlobal = false;
            },
            error: () => {
                this.loadingGlobal = false;
                this.snackBar.open('Error al cargar datos globales', 'OK', { duration: 3000 });
            }
        });
    }

    getGlobalTotalStudents(): number {
        return this.globalGradesData.length;
    }

    getGlobalAverageScore(): number {
        if (this.globalGradesData.length === 0) return 0;
        const validAverages = this.globalGradesData.filter(s => s.average && !isNaN(s.average) && s.average > 0);
        if (validAverages.length === 0) return 0;
        const sum = validAverages.reduce((acc, s) => acc + s.average, 0);
        return Math.round((sum / validAverages.length) * 10) / 10;
    }

    getGlobalHighestScore(): number {
        if (this.globalGradesData.length === 0) return 0;
        const validScores = this.globalGradesData.filter(s => s.highest && !isNaN(s.highest) && s.highest > 0);
        if (validScores.length === 0) return 0;
        return Math.max(...validScores.map(s => s.highest));
    }

    getGlobalLowestScore(): number {
        if (this.globalGradesData.length === 0) return 0;
        const validScores = this.globalGradesData.filter(s => s.lowest && !isNaN(s.lowest) && s.lowest > 0);
        return validScores.length > 0 ? Math.min(...validScores.map(s => s.lowest)) : 0;
    }

    getAverageClass(average: number): string {
        if (!average || isNaN(average)) return '';
        if (average >= 90) return 'excellent';
        if (average >= 70) return 'good';
        if (average >= 60) return 'regular';
        return 'poor';
    }

    viewStudentDetail(studentId: number) {
        this.router.navigate(['/students', studentId]);
    }

    // Método para obtener el desempeño según la escala de la materia
    getPerformanceLevel(average: number): string {
        if (!this.selectedSubjectForFinal || !this.selectedSubjectForFinal.gradeScale) {
            // Sin escala, usar valores por defecto
            if (average >= 90) return 'Superior';
            if (average >= 80) return 'Alto';
            if (average >= 70) return 'Básico';
            if (average >= 60) return 'Bajo';
            return 'Insuficiente';
        }

        const scale = this.selectedSubjectForFinal.gradeScale;
        
        if (average >= scale.superiorMin) return scale.superiorLabel || 'Superior';
        if (average >= scale.highMin) return scale.highLabel || 'Alto';
        if (average >= scale.basicMin) return scale.basicLabel || 'Básico';
        if (average >= scale.lowMin) return scale.lowLabel || 'Bajo';
        return 'Insuficiente';
    }

    getPerformanceClass(average: number): string {
        const level = this.getPerformanceLevel(average);
        if (level.includes('Superior')) return 'superior';
        if (level.includes('Alto')) return 'alto';
        if (level.includes('Básico')) return 'basico';
        if (level.includes('Bajo')) return 'bajo';
        return 'insuficiente';
    }
}
