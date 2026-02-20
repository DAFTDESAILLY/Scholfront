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
import { SubjectsService } from '../../../../core/services/subjects.service';
import { Subject } from '../../../../core/models/subject.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { HelpIconComponent } from '../../../../shared/components/help-icon/help-icon.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SubjectScaleDialogComponent } from '../components/subject-scale-dialog/subject-scale-dialog.component';

@Component({
    selector: 'app-subject-list',
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
    templateUrl: './subject-list.component.html',
    styleUrls: ['./subject-list.component.scss']
})
export class SubjectListComponent implements OnInit {
    displayedColumns: string[] = ['subject', 'teacher', 'status', 'actions'];
    dataSource!: MatTableDataSource<Subject>;
    allSubjects: Subject[] = [];
    selectedStatus: string = 'all';

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private subjectsService: SubjectsService,
        private notificationService: NotificationService,
        private dialog: MatDialog
    ) { }

    openScaleDialog(subject: Subject) {
        const dialogRef = this.dialog.open(SubjectScaleDialogComponent, {
            width: '500px',
            data: { subject }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.subjectsService.update(subject.id, { gradingScale: result }).subscribe({
                    next: () => {
                        this.notificationService.success('Escala actualizada correctamente');
                        this.loadSubjects();
                    },
                    error: (err) => {
                        console.error('Error updating scale:', err);
                        this.notificationService.error('Error al actualizar escala');
                    }
                });
            }
        });
    }

    ngOnInit() {
        this.loadSubjects();
    }

    loadSubjects() {
        this.subjectsService.getAll().subscribe({
            next: (data) => {
                console.log('📚 Materias cargadas:', data);
                this.allSubjects = data;
                this.dataSource = new MatTableDataSource(data);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            error: (err) => {
                console.error('❌ Error cargando materias:', err);
                this.notificationService.error('Error al cargar materias');
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
            this.dataSource.data = this.allSubjects;
        } else {
            this.dataSource.data = this.allSubjects.filter(s => s.status === status);
        }
    }

    refreshData() {
        this.notificationService.success('Actualizando datos...');
        this.loadSubjects();
    }

    getTotalSubjects(): number {
        return this.allSubjects.length;
    }

    getActiveSubjects(): number {
        return this.allSubjects.filter(s => s.status === 'active').length;
    }

    getArchivedSubjects(): number {
        return this.allSubjects.filter(s => s.status === 'archived').length;
    }

    deleteSubject(id: number) {
        if (confirm('¿Estás seguro de eliminar esta materia?')) {
            this.subjectsService.delete(id).subscribe({
                next: () => {
                    this.notificationService.success('Materia eliminada exitosamente');
                    this.loadSubjects();
                },
                error: (err) => {
                    console.error('❌ Error eliminando materia:', err);
                    this.notificationService.error('Error al eliminar materia');
                }
            });
        }
    }
}
