import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { StudentsService } from '../../../../core/services/students.service';
import { StudentAssignmentsService } from '../../../../core/services/student-assignments.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { forkJoin } from 'rxjs';
import { Student } from '../../../../core/models/student.model';

@Component({
    selector: 'app-student-enrollment-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatListModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatCheckboxModule,
        FormsModule,
        ReactiveFormsModule
    ],
    template: `
        <h2 mat-dialog-title>Inscribir Estudiantes: {{ data.groupName }}</h2>
        
        <mat-dialog-content class="enrollment-content">
            <mat-form-field appearance="outline" class="search-field">
                <mat-label>Buscar estudiante</mat-label>
                <mat-icon matPrefix>search</mat-icon>
                <input matInput [formControl]="searchControl" placeholder="Nombre o ID">
            </mat-form-field>

            <div class="students-list-container">
                <div *ngIf="loading" class="loading-spinner">
                    Cargando estudiantes...
                </div>
                
                <h3 *ngIf="!loading">Estudiantes Disponibles</h3>
                
                <mat-selection-list #studentsList *ngIf="!loading">
                    <mat-list-option *ngFor="let student of filteredStudents" 
                                     [value]="student.id"
                                     [selected]="isEnrolled(student.id)"
                                     [disabled]="isEnrolled(student.id)"
                                     (click)="toggleSelection(student.id)">
                        <div class="student-item">
                            <span class="student-name">{{ student.fullName }}</span>
                            <span class="student-info">
                                <span class="student-id">ID: {{ student.id }}</span>
                                <span class="status-badge" *ngIf="isEnrolled(student.id)">Inscrito</span>
                            </span>
                        </div>
                    </mat-list-option>
                </mat-selection-list>
                
                <div *ngIf="!loading && filteredStudents.length === 0" class="no-results">
                    No se encontraron estudiantes
                </div>
            </div>
            
            <div class="summary" *ngIf="selectedIds.size > 0">
                <p>{{ selectedIds.size }} estudiantes seleccionados para inscribir</p>
            </div>
        </mat-dialog-content>
        
        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Cancelar</button>
            <button mat-raised-button color="primary" 
                    [disabled]="selectedIds.size === 0 || processing"
                    (click)="enrollSelected()">
                {{ processing ? 'Procesando...' : 'Inscribir' }}
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        .enrollment-content {
            min-width: 500px;
            max-height: 70vh;
            display: flex;
            flex-direction: column;
        }
        
        .search-field {
            width: 100%;
            margin-bottom: 1rem;
        }
        
        .students-list-container {
            flex: 1;
            overflow-y: auto;
            border: 1px solid rgba(0,0,0,0.1);
            border-radius: 4px;
        }
        
        .student-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
        }
        
        .student-name {
            font-weight: 500;
        }
        
        .student-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .student-id {
            color: #777;
            font-size: 0.85rem;
        }
        
        .status-badge {
            background-color: #e0f2f1;
            color: #00695c;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.75rem;
        }
        
        .summary {
            margin-top: 1rem;
            font-weight: 500;
            color: var(--primary-color);
        }
        
        .no-results, .loading-spinner {
            padding: 2rem;
            text-align: center;
            color: #777;
        }
    `]
})
export class StudentEnrollmentDialogComponent implements OnInit {
    allStudents: Student[] = [];
    filteredStudents: Student[] = [];
    existingEnrollments: number[] = [];
    searchControl = new FormControl('');

    selectedIds = new Set<number>();
    loading = true;
    processing = false;

    constructor(
        public dialogRef: MatDialogRef<StudentEnrollmentDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { groupId: number, groupName: string },
        private studentsService: StudentsService,
        private assignmentsService: StudentAssignmentsService,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.loadData();

        this.searchControl.valueChanges.subscribe(value => {
            this.filterStudents(value || '');
        });
    }

    loadData() {
        this.loading = true;

        forkJoin({
            allStudents: this.studentsService.getAll(),
            enrolledStudents: this.studentsService.getStudentsByGroup(this.data.groupId)
        }).subscribe({
            next: (response) => {
                this.allStudents = response.allStudents.filter(s => s.status === 'active');
                this.existingEnrollments = response.enrolledStudents.map(s => s.id);
                this.filterStudents('');
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading data', err);
                this.notificationService.error('Error al cargar datos');
                this.loading = false;
            }
        });
    }

    filterStudents(query: string) {
        const q = query.toLowerCase();
        this.filteredStudents = this.allStudents.filter(s =>
            s.fullName.toLowerCase().includes(q) ||
            s.id.toString().includes(q) ||
            (s.enrollmentId && s.enrollmentId.toLowerCase().includes(q))
        );
    }

    isEnrolled(studentId: number): boolean {
        return this.existingEnrollments.includes(studentId);
    }

    toggleSelection(studentId: number) {
        if (this.isEnrolled(studentId)) return;

        if (this.selectedIds.has(studentId)) {
            this.selectedIds.delete(studentId);
        } else {
            this.selectedIds.add(studentId);
        }
    }

    enrollSelected() {
        if (this.selectedIds.size === 0) return;

        this.processing = true;
        const requests = Array.from(this.selectedIds).map(studentId => {
            return this.assignmentsService.create({
                studentId: studentId,
                groupId: this.data.groupId,
                status: 'active'
            });
        });

        forkJoin(requests).subscribe({
            next: () => {
                this.notificationService.success(`${requests.length} estudiantes inscritos correctamente`);
                this.dialogRef.close(true); // Return true to indicate success
            },
            error: (err) => {
                console.error('Error enrolling students', err);
                this.notificationService.error('Error al inscribir estudiantes');
                this.processing = false;
            }
        });
    }
}
