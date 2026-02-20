import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StudentsService } from '../../../core/services/students.service';
import { StudentGradesComponent } from '../student-grades/student-grades';
import { StudentRecordsComponent } from '../../records/student-records/student-records.component';
import { StudentConsentsComponent } from '../../consents/student-consents/student-consents.component';
import { StudentAttendanceComponent } from '../student-attendance/student-attendance.component';

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
    StudentConsentsComponent,
    StudentAttendanceComponent
  ],
  templateUrl: './student-profile.html',
  styleUrls: ['./student-profile.scss']
})
export class StudentProfileComponent implements OnInit {
  student: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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

  editStudent() {
    if (this.student?.id) {
      this.router.navigate(['/students', this.student.id, 'edit']);
    }
  }

  goBack() {
    this.router.navigate(['/students']);
  }
}
