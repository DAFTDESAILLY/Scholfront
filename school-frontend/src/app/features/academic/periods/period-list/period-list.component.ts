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
import { PeriodsService } from '../../../../core/services/periods.service';
import { AcademicPeriod } from '../../../../core/models/academic-period.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-period-list',
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
        MatFormFieldModule,
        DatePipe
    ],
    templateUrl: './period-list.component.html',
    styleUrls: ['./period-list.component.scss']
})
export class PeriodListComponent implements OnInit {
    displayedColumns: string[] = ['type', 'startDate', 'endDate', 'status', 'actions'];
    dataSource!: MatTableDataSource<AcademicPeriod>;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private periodsService: PeriodsService,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.loadPeriods();
    }

    loadPeriods() {
        this.periodsService.getAll().subscribe({
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

    deletePeriod(id: number) {
        if (confirm('Are you sure you want to delete this period?')) {
            this.periodsService.delete(id).subscribe({
                next: () => {
                    this.notificationService.success('Period deleted successfully');
                    this.loadPeriods();
                },
                error: () => { }
            });
        }
    }
}
