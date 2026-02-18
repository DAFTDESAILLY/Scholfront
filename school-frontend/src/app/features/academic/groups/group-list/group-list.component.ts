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
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GroupsService } from '../../../../core/services/groups.service';
import { Group } from '../../../../core/models/group.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { HelpIconComponent } from '../../../../shared/components/help-icon/help-icon.component';
import { StudentEnrollmentDialogComponent } from '../student-enrollment-dialog/student-enrollment-dialog.component';

@Component({
    selector: 'app-group-list',
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
        MatSelectModule,
        MatChipsModule,
        MatCardModule,
        MatDialogModule
    ],
    templateUrl: './group-list.component.html',
    styleUrls: ['./group-list.component.scss']
})
export class GroupListComponent implements OnInit {
    displayedColumns: string[] = ['group', 'subject', 'status', 'actions'];
    dataSource!: MatTableDataSource<Group>;
    allGroups: Group[] = [];
    selectedStatus: string = 'all';

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private groupsService: GroupsService,
        private notificationService: NotificationService,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.loadGroups();
    }

    loadGroups() {
        this.groupsService.getAll().subscribe({
            next: (data) => {
                console.log('👥 Grupos cargados:', data);
                this.allGroups = data;
                this.dataSource = new MatTableDataSource(data);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            error: (err) => {
                console.error('❌ Error cargando grupos:', err);
                this.notificationService.error('Error al cargar grupos');
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

    clearFilter(input: HTMLInputElement) {
        input.value = '';
        this.dataSource.filter = '';
    }

    filterByStatus(status: string) {
        this.selectedStatus = status;
        if (status === 'all') {
            this.dataSource.data = this.allGroups;
        } else {
            this.dataSource.data = this.allGroups.filter(g => g.status === status);
        }
    }

    refreshData() {
        this.notificationService.success('Actualizando datos...');
        this.loadGroups();
    }

    getTotalGroups(): number {
        return this.allGroups.length;
    }

    getActiveGroups(): number {
        return this.allGroups.filter(g => g.status === 'active').length;
    }

    getArchivedGroups(): number {
        return this.allGroups.filter(g => g.status === 'archived').length;
    }

    deleteGroup(id: number) {
        if (confirm('¿Estás seguro de eliminar este grupo?')) {
            this.groupsService.delete(id).subscribe({
                next: () => {
                    this.notificationService.success('Grupo eliminado exitosamente');
                    this.loadGroups();
                },
                error: (err) => {
                    console.error('❌ Error eliminando grupo:', err);
                    this.notificationService.error('Error al eliminar grupo');
                }
            });
        }
    }

    openEnrollmentDialog(group: Group) {
        const dialogRef = this.dialog.open(StudentEnrollmentDialogComponent, {
            width: '600px',
            data: {
                groupId: group.id,
                groupName: group.name
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Refresh data if needed, or just let user continue
                console.log('Enrollment completed');
            }
        });
    }
}
