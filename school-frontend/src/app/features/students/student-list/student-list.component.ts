import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { StudentsService } from '../../../core/services/students.service';
import { Student } from '../../../core/models/student.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-student-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule
    ],
    templateUrl: './student-list.component.html',
    styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit {
    displayedColumns: string[] = ['studentId', 'name', 'email', 'status', 'actions'];
    dataSource!: MatTableDataSource<Student>;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private studentsService: StudentsService,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.loadStudents();
    }

    loadStudents() {
        this.studentsService.getAll().subscribe({
            next: (data) => {
                this.dataSource = new MatTableDataSource(data);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            error: () => { }
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    deleteStudent(id: number) {
        if (confirm('Are you sure you want to delete this student?')) {
            this.studentsService.delete(id).subscribe({
                next: () => {
                    this.notificationService.success('Student deleted successfully');
                    this.loadStudents();
                },
                error: () => { }
            });
        }
    }
}
