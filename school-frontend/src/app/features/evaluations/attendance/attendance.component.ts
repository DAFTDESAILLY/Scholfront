import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of, forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AttendanceService } from '../../../core/services/attendance.service';
import { SubjectsService } from '../../../core/services/subjects.service';
import { StudentsService } from '../../../core/services/students.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Subject } from '../../../core/models/subject.model';
import { Student } from '../../../core/models/student.model';
import { Attendance } from '../../../core/models/attendance.model';
import { HelpIconComponent } from '../../../shared/components/help-icon/help-icon.component';

@Component({
    selector: 'app-attendance',
    standalone: true,
    imports: [
        CommonModule,
        HelpIconComponent,
        ReactiveFormsModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatTableModule,
        MatInputModule,
        MatIconModule,
        MatRadioModule,
        MatChipsModule,
        MatTooltipModule,
        MatButtonToggleModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './attendance.component.html',
    styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {
    attendanceForm: FormGroup;
    globalFiltersForm: FormGroup;
    subjects: Subject[] = [];
    students: any[] = [];
    attendanceData: any[] = [];
    displayedColumns: string[] = ['name', 'status', 'notes'];
    
    // Vista global
    currentView: 'register' | 'global' = 'register';
    globalAttendanceData: any[] = [];
    globalDisplayedColumns: string[] = ['student', 'total', 'present', 'absent', 'late', 'excused', 'percentage', 'actions'];
    loadingGlobal = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private attendanceService: AttendanceService,
        private subjectsService: SubjectsService,
        private studentsService: StudentsService,
        private notificationService: NotificationService
    ) {
        this.attendanceForm = this.fb.group({
            subjectId: ['', Validators.required],
            date: [new Date(), Validators.required]
        });

        // Formulario para filtros globales
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Últimos 30 días por defecto

        this.globalFiltersForm = this.fb.group({
            subjectId: [null],
            startDate: [startDate],
            endDate: [endDate]
        });
    }

    ngOnInit() {
        this.loadSubjects();
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

    onLoadStudents() {
        if (this.attendanceForm.valid) {
            const subjectId = this.attendanceForm.get('subjectId')?.value;
            const subject = this.subjects.find(s => s.id === Number(subjectId));

            if (subject && subject.groupId) {
                console.log(`Searching students for Group ID: ${subject.groupId} (Subject: ${subject.name})`);
                this.studentsService.getStudentsByGroup(subject.groupId)
                    .pipe(
                        catchError(error => {
                            console.warn('No se pudieron cargar los estudiantes.', error);
                            this.notificationService.error('Error al cargar estudiantes');
                            return of([]);
                        })
                    )
                    .subscribe(data => {
                        this.students = data;
                        this.prepareAttendanceData();
                    });
            } else {
                console.warn('Subject has no group ID', subject);
                this.notificationService.error('La materia seleccionada no tiene un grupo asignado.');
            }
        }
    }

    prepareAttendanceData() {
        this.attendanceData = this.students.map(student => ({
            studentId: student.id,
            studentName: student.fullName,
            status: 'present',
            notes: ''
        }));
    }

    saveAttendance() {
        const { subjectId, date } = this.attendanceForm.value;
        const formattedDate = new Date(date).toISOString().split('T')[0];

        console.log('Saving attendance for:', { subjectId: Number(subjectId), date: formattedDate });

        const records = this.attendanceData.map(item => ({
            subjectId: Number(subjectId),
            date: formattedDate,
            studentId: Number(item.studentId),
            status: item.status,
            notes: item.notes || ''
        }));

        console.log('Sending records:', records);

        this.attendanceService.saveBatch(records).subscribe({
            next: (response) => {
                console.log('Batch response:', response);
                this.notificationService.success('Asistencia guardada exitosamente');
            },
            error: (err) => {
                console.error('Error saving attendance:', err);
                this.notificationService.error('Error al guardar asistencia');
            }
        });
    }

    // Métodos para estadísticas
    getPresentCount(): number {
        return this.attendanceData.filter(a => a.status === 'present').length;
    }

    getAbsentCount(): number {
        return this.attendanceData.filter(a => a.status === 'absent').length;
    }

    getLateCount(): number {
        return this.attendanceData.filter(a => a.status === 'late').length;
    }

    getExcusedCount(): number {
        return this.attendanceData.filter(a => a.status === 'excused').length;
    }

    getTotalStudents(): number {
        return this.attendanceData.length;
    }

    // Métodos para marcar todos con el mismo estado
    markAllPresent() {
        this.attendanceData.forEach(item => item.status = 'present');
    }

    markAllAbsent() {
        this.attendanceData.forEach(item => item.status = 'absent');
    }

    // Obtener nombre de materia seleccionada
    getSelectedSubjectName(): string {
        const subjectId = this.attendanceForm.get('subjectId')?.value;
        const subject = this.subjects.find(s => s.id === subjectId);
        return subject ? subject.name : '';
    }

    // Métodos para la vista global
    onViewChange() {
        if (this.currentView === 'global' && this.globalAttendanceData.length === 0) {
            // Cargar datos automáticamente al cambiar a vista global
            this.loadGlobalAttendance();
        }
    }

    loadGlobalAttendance() {
        this.loadingGlobal = true;
        this.globalAttendanceData = [];

        console.log('📊 Cargando asistencia global...');

        // Obtener todos los estudiantes
        this.studentsService.getAll().subscribe({
            next: (students) => {
                console.log(`👥 ${students.length} estudiantes encontrados`);

                if (students.length === 0) {
                    this.loadingGlobal = false;
                    this.notificationService.info('No hay estudiantes registrados');
                    return;
                }

                // Para cada estudiante, obtener sus asistencias
                const studentRequests = students.map(student => {
                    const requests = this.subjects.map(subject =>
                        this.attendanceService.getStudentAttendance(student.id, subject.id)
                    );
                    
                    return forkJoin(requests).pipe(
                        catchError(error => {
                            console.error(`Error obteniendo asistencias de estudiante ${student.id}:`, error);
                            return of([]);
                        })
                    );
                });

                forkJoin(studentRequests).subscribe({
                    next: (allResults) => {
                        console.log('📥 Resultados recibidos para todos los estudiantes');

                        students.forEach((student, index) => {
                            const studentAttendances: any[] = [];
                            const results = allResults[index];

                            // Aplanar resultados de todas las materias
                            results.forEach((subjectAttendances: any) => {
                                if (Array.isArray(subjectAttendances)) {
                                    subjectAttendances.forEach((att: any) => {
                                        // Verificar que la asistencia pertenece a este estudiante
                                        const attStudentId = att.studentId || 
                                                           (att.studentAssignment && att.studentAssignment.studentId) ||
                                                           (att.studentAssignment && att.studentAssignment.student && att.studentAssignment.student.id);
                                        
                                        if (Number(attStudentId) === Number(student.id)) {
                                            studentAttendances.push(att);
                                        }
                                    });
                                }
                            });

                            // Aplicar filtros de fecha si están definidos
                            const startDate = this.globalFiltersForm.get('startDate')?.value;
                            const endDate = this.globalFiltersForm.get('endDate')?.value;
                            const subjectId = this.globalFiltersForm.get('subjectId')?.value;

                            let filteredAttendances = studentAttendances;

                            if (startDate) {
                                filteredAttendances = filteredAttendances.filter(att =>
                                    new Date(att.date) >= new Date(startDate)
                                );
                            }

                            if (endDate) {
                                filteredAttendances = filteredAttendances.filter(att =>
                                    new Date(att.date) <= new Date(endDate)
                                );
                            }

                            if (subjectId) {
                                filteredAttendances = filteredAttendances.filter(att =>
                                    Number(att.subjectId) === Number(subjectId)
                                );
                            }

                            // Calcular estadísticas
                            const totalRecords = filteredAttendances.length;
                            const presentCount = filteredAttendances.filter(a => a.status === 'present').length;
                            const absentCount = filteredAttendances.filter(a => a.status === 'absent').length;
                            const lateCount = filteredAttendances.filter(a => a.status === 'late').length;
                            const excusedCount = filteredAttendances.filter(a => a.status === 'excused').length;
                            const attendancePercentage = totalRecords > 0 
                                ? ((presentCount + lateCount) / totalRecords) * 100 
                                : 0;

                            // Solo agregar si tiene registros
                            if (totalRecords > 0) {
                                this.globalAttendanceData.push({
                                    studentId: student.id,
                                    studentName: student.fullName,
                                    totalRecords,
                                    presentCount,
                                    absentCount,
                                    lateCount,
                                    excusedCount,
                                    attendancePercentage: Math.round(attendancePercentage)
                                });
                            }
                        });

                        // Ordenar por nombre
                        this.globalAttendanceData.sort((a, b) => 
                            a.studentName.localeCompare(b.studentName)
                        );

                        console.log(`✅ Vista global cargada: ${this.globalAttendanceData.length} estudiantes con registros`);
                        this.loadingGlobal = false;

                        if (this.globalAttendanceData.length === 0) {
                            this.notificationService.info('No hay registros de asistencia en el período seleccionado');
                        }
                    },
                    error: (error) => {
                        console.error('Error al cargar asistencias globales:', error);
                        this.notificationService.error('Error al cargar datos');
                        this.loadingGlobal = false;
                    }
                });
            },
            error: (error) => {
                console.error('Error al cargar estudiantes:', error);
                this.notificationService.error('Error al cargar estudiantes');
                this.loadingGlobal = false;
            }
        });
    }

    // Métodos de estadísticas globales
    getGlobalStudentsCount(): number {
        return this.globalAttendanceData.length;
    }

    getGlobalPresentCount(): number {
        return this.globalAttendanceData.reduce((sum, student) => sum + student.presentCount, 0);
    }

    getGlobalAbsentCount(): number {
        return this.globalAttendanceData.reduce((sum, student) => sum + student.absentCount, 0);
    }

    getGlobalLateCount(): number {
        return this.globalAttendanceData.reduce((sum, student) => sum + student.lateCount, 0);
    }

    getPercentageClass(percentage: number): string {
        if (percentage >= 90) return 'excellent';
        if (percentage >= 75) return 'good';
        if (percentage >= 60) return 'regular';
        return 'poor';
    }

    viewStudentDetail(studentId: number) {
        this.router.navigate(['/students', studentId]);
    }
}
