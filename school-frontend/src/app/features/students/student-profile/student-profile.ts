import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StudentsService } from '../../../core/services/students.service';
import { StudentGradesComponent } from '../student-grades/student-grades';
import { StudentRecordsComponent } from '../../records/student-records/student-records.component';
import { StudentConsentsComponent } from '../../consents/student-consents/student-consents.component';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    StudentGradesComponent,
    StudentRecordsComponent,
    StudentConsentsComponent
  ],
  template: `
    <div class="profile-container" *ngIf="student">
      <div class="profile-header">
        <h1>{{ student.fullName }}</h1>
        <div class="subtitle">
            <span class="badget">ID: {{ student.id }}</span>
            <span class="badget">Matrícula: {{ student.enrollmentId || 'N/A' }}</span>
        </div>
      </div>

      <mat-tab-group>
        <mat-tab label="General">
            <mat-card class="info-card">
                <mat-card-header>
                    <mat-card-title>Información Personal</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Nombre Completo</label>
                            <p>{{ student.fullName }}</p>
                        </div>
                        <div class="info-item">
                            <label>Email</label>
                            <p>{{ student.email || 'N/A' }}</p>
                        </div>
                         <div class="info-item">
                            <label>Fecha de Nacimiento</label>
                            <p>{{ student.birthDate | date }}</p>
                        </div>
                        <div class="info-item">
                            <label>Dirección</label>
                            <p>{{ student.address || 'N/A' }}</p>
                        </div>
                        <div class="info-item">
                            <label>Teléfono Padres</label>
                            <p>{{ student.parentPhone || 'N/A' }}</p>
                        </div>
                    </div>
                </mat-card-content>
            </mat-card>
        </mat-tab>

        <mat-tab label="Calificaciones">
            <app-student-grades [studentId]="student.id"></app-student-grades>
        </mat-tab>

        <mat-tab label="Expediente">
            <app-student-records [studentId]="student.id"></app-student-records>
        </mat-tab>

        <mat-tab label="Consentimientos">
            <app-student-consents [studentId]="student.id"></app-student-consents>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .profile-container { padding: 20px; }
    .profile-header { margin-bottom: 20px; }
    .subtitle { display: flex; gap: 10px; margin-top: 5px; color: gray; }
    .info-card { margin: 20px; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-top: 15px; }
    .info-item label { font-weight: bold; color: gray; display: block; margin-bottom: 5px; }
    .info-item p { margin: 0; font-size: 1.1em; }
  `]
})
export class StudentProfileComponent implements OnInit {
  student: any = null;

  constructor(
    private route: ActivatedRoute,
    private studentsService: StudentsService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.studentsService.getById(+id).subscribe(student => {
        this.student = student;
      });
    }
  }
}
