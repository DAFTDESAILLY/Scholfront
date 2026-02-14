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
import { SubjectsService } from '../../../../core/services/subjects.service';
import { Subject } from '../../../../core/models/subject.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-subject-list',
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
    templateUrl: './subject-list.component.html',
    styleUrls: ['./subject-list.component.scss']
})
export class SubjectListComponent implements OnInit {
    displayedColumns: string[] = ['name', 'status', 'actions'];
    dataSource!: MatTableDataSource<Subject>;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private subjectsService: SubjectsService,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.loadSubjects();
    }

    loadSubjects() {
        this.subjectsService.getAll().subscribe({
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
    }

    deleteSubject(id: number) {
        if (confirm('Are you sure you want to delete this subject?')) {
            this.subjectsService.delete(id).subscribe({
                next: () => {
                    this.notificationService.success('Subject deleted successfully');
                    this.loadSubjects();
                },
                error: () => { }
            });
        }
    }
}
