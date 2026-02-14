import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
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
import { AttendanceService } from '../../../core/services/attendance.service';
import { SubjectsService } from '../../../core/services/subjects.service';
import { StudentsService } from '../../../core/services/students.service'; // In a real app, we'd get students by group via Subjects or Groups service
import { NotificationService } from '../../../core/services/notification.service';
import { Subject } from '../../../core/models/subject.model';
import { Student } from '../../../core/models/student.model';
import { Attendance } from '../../../core/models/attendance.model';

@Component({
    selector: 'app-attendance',
    standalone: true,
    imports: [
        CommonModule,
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
        MatRadioModule
    ],
    templateUrl: './attendance.component.html',
    styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {
    attendanceForm: FormGroup;
    subjects: Subject[] = [];
    students: Student[] = []; // This should ideally be loaded based on the selected subject's group
    attendanceData: any[] = [];
    displayedColumns: string[] = ['name', 'status', 'notes'];

    constructor(
        private fb: FormBuilder,
        private attendanceService: AttendanceService,
        private subjectsService: SubjectsService,
        private studentsService: StudentsService,
        private notificationService: NotificationService
    ) {
        this.attendanceForm = this.fb.group({
            subjectId: ['', Validators.required],
            date: [new Date(), Validators.required]
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
            // filters students by group associated with subject. 
            // For now, mocking with all students as we don't have the full relation setup in mock services efficiently
            this.studentsService.getAll()
                .pipe(
                    catchError(error => {
                        console.warn('No se pudieron cargar los estudiantes.');
                        return of([]);
                    })
                )
                .subscribe(data => {
                    this.students = data;
                    this.prepareAttendanceData();
                });
        }
    }

    prepareAttendanceData() {
        this.attendanceData = this.students.map(student => ({
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            status: 'present',
            notes: ''
        }));
    }

    saveAttendance() {
        const { subjectId, date } = this.attendanceForm.value;
        const records = this.attendanceData.map(item => ({
            subjectId,
            date,
            studentId: item.studentId,
            status: item.status,
            notes: item.notes
        }));

        this.attendanceService.saveBatch(records).subscribe({
            next: () => {
                this.notificationService.success('Attendance saved successfully');
            },
            error: () => { }
        });
    }
}
