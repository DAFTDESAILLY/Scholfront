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
import { GroupsService } from '../../../../core/services/groups.service';
import { Group } from '../../../../core/models/group.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-group-list',
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
    templateUrl: './group-list.component.html',
    styleUrls: ['./group-list.component.scss']
})
export class GroupListComponent implements OnInit {
    displayedColumns: string[] = ['name', 'status', 'actions'];
    dataSource!: MatTableDataSource<Group>;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private groupsService: GroupsService,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.loadGroups();
    }

    loadGroups() {
        this.groupsService.getAll().subscribe({
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

    deleteGroup(id: number) {
        if (confirm('Are you sure you want to delete this group?')) {
            this.groupsService.delete(id).subscribe({
                next: () => {
                    this.notificationService.success('Group deleted successfully');
                    this.loadGroups();
                },
                error: () => { }
            });
        }
    }
}
