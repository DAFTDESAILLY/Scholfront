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
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContextsService } from '../../../../core/services/contexts.service';
import { Context } from '../../../../core/models/context.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { HelpIconComponent } from '../../../../shared/components/help-icon/help-icon.component';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-context-list',
    standalone: true,
    imports: [
        CommonModule,
        HelpIconComponent,
        RouterLink,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatTooltipModule
    ],
    templateUrl: './context-list.component.html',
    styleUrls: ['./context-list.component.scss']
})
export class ContextListComponent implements OnInit {
    displayedColumns: string[] = ['name', 'level', 'institution', 'status', 'actions'];
    dataSource!: MatTableDataSource<Context>;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private contextsService: ContextsService,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.loadContexts();
    }

    loadContexts() {
        this.contextsService.getAll().subscribe({
            next: (data) => {
                this.dataSource = new MatTableDataSource(data);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            error: (err) => {
                // Error handled by interceptor
            }
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    deleteContext(id: number) {
        if (confirm('Are you sure you want to delete this context?')) {
            this.contextsService.delete(id).subscribe({
                next: () => {
                    this.notificationService.success('Context deleted successfully');
                    this.loadContexts();
                },
                error: () => {
                    // handled by interceptor
                }
            });
        }
    }
}
