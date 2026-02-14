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
import { AssessmentsService } from '../../../core/services/assessments.service';
import { SubjectsService } from '../../../core/services/subjects.service';
import { StudentsService } from '../../../core/services/students.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Subject } from '../../../core/models/subject.model';
import { Assessment } from '../../../core/models/assessment.model';

@Component({
    selector: 'app-grading',
    standalone: true,
    imports: [
        CommonModule,
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
    assessments: Assessment[] = [];
    gradingData: any[] = [];
    displayedColumns: string[] = ['name', 'score', 'feedback'];

    constructor(
        private fb: FormBuilder,
        private assessmentsService: AssessmentsService,
        private subjectsService: SubjectsService,
        private studentsService: StudentsService,
        private notificationService: NotificationService
    ) {
        this.filterForm = this.fb.group({
            subjectId: ['', Validators.required],
            assessmentId: ['', Validators.required]
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
        this.assessmentsService.getBySubject(subjectId)
            .pipe(
                catchError(error => {
                    console.warn('No se pudieron cargar las evaluaciones.');
                    return of([]);
                })
            )
            .subscribe(data => this.assessments = data);
    }

    onLoadGrades() {
        if (this.filterForm.valid) {
            const assessmentId = this.filterForm.get('assessmentId')?.value;
            // Load all students for now (mock)
            this.studentsService.getAll()
                .pipe(
                    catchError(error => {
                        console.warn('No se pudieron cargar los estudiantes.');
                        return of([]);
                    })
                )
                .subscribe(students => {
                    // Here we would merge with existing grades if any
                    this.gradingData = students.map(student => ({
                        studentId: student.id,
                        studentName: `${student.firstName} ${student.lastName}`,
                        score: 0,
                        feedback: ''
                    }));
                });
        }
    }

    saveGrades() {
        const assessmentId = this.filterForm.get('assessmentId')?.value;
        const grades = this.gradingData.map(item => ({
            assessmentId,
            studentId: item.studentId,
            score: item.score,
            feedback: item.feedback
        }));

        this.assessmentsService.saveGrades(grades).subscribe({
            next: () => {
                this.notificationService.success('Grades saved successfully');
            },
            error: () => { }
        });
    }
}
