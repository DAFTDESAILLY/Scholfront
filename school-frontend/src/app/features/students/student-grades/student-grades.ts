import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { StudentAssignmentsService } from '../../../core/services/student-assignments.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-student-grades',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Calificaciones</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <table mat-table [dataSource]="assignments" class="mat-elevation-z8">
          <!-- Subject Column -->
          <ng-container matColumnDef="subject">
            <th mat-header-cell *matHeaderCellDef> Materia </th>
            <td mat-cell *matCellDef="let element"> {{element.group?.subject?.name || 'N/A'}} </td>
          </ng-container>

          <!-- Assignment Column -->
          <ng-container matColumnDef="assignment">
            <th mat-header-cell *matHeaderCellDef> Actividad </th>
            <td mat-cell *matCellDef="let element"> {{element.id}} </td> 
          </ng-container>

          <!-- Grade Column -->
          <ng-container matColumnDef="grade">
            <th mat-header-cell *matHeaderCellDef> Calificación </th>
            <td mat-cell *matCellDef="let element"> 
                <span *ngFor="let grade of element.grades">{{ grade.score }}</span>
                <span *ngIf="!element.grades?.length"> - </span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    table { width: 100%; margin-top: 1rem; }
    mat-card { margin: 1rem; }
  `]
})
export class StudentGradesComponent implements OnInit {
  @Input() studentId?: number;
  assignments: any[] = [];
  displayedColumns: string[] = ['subject', 'assignment', 'grade'];

  constructor(
    private studentAssignmentsService: StudentAssignmentsService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    if (!this.studentId) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) this.studentId = +id;
    }

    if (this.studentId) {
      this.loadGrades();
    }
  }

  loadGrades() {
    this.studentAssignmentsService.findByStudent(this.studentId!).subscribe(data => {
      this.assignments = data;
    });
  }
}
