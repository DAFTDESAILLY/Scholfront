import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { EvaluationsService } from '../../../core/services/evaluations.service';
import { SubjectsService } from '../../../core/services/subjects.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Evaluation } from '../../../core/models/evaluation.model';
import { Subject } from '../../../core/models/subject.model';
import { HelpIconComponent } from '../../../shared/components/help-icon/help-icon.component';

@Component({
    selector: 'app-evaluation-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatChipsModule,
        HelpIconComponent
    ],
    templateUrl: './evaluation-list.component.html',
    styleUrls: ['./evaluation-list.component.scss']
})
export class EvaluationListComponent implements OnInit {
    evaluations: Evaluation[] = [];
    filteredEvaluations: Evaluation[] = [];
    subjects: Subject[] = [];
    filterForm: FormGroup;
    displayedColumns: string[] = ['evaluation', 'type', 'subject', 'status', 'scoring', 'dueDate', 'actions'];
    textFilter: string = '';

    constructor(
        private evaluationsService: EvaluationsService,
        private subjectsService: SubjectsService,
        private notificationService: NotificationService,
        private fb: FormBuilder
    ) {
        this.filterForm = this.fb.group({
            subjectId: [''],
            type: ['']
        });
    }

    ngOnInit() {
        this.loadSubjects();
        this.loadEvaluations();

        this.filterForm.valueChanges.subscribe(() => {
            this.applyFilters();
        });
    }

    loadSubjects() {
        this.subjectsService.getAll().subscribe({
            next: (data) => this.subjects = data,
            error: (err) => {
                console.error('❌ Error loading subjects', err);
                this.notificationService.error('Error al cargar materias');
            }
        });
    }

    loadEvaluations() {
        this.evaluationsService.getAll().subscribe({
            next: (data) => {
                console.log('📝 Evaluaciones cargadas:', data);
                this.evaluations = data;
                this.applyFilters();
            },
            error: (err) => {
                console.error('❌ Error loading evaluations', err);
                this.notificationService.error('Error al cargar evaluaciones');
            }
        });
    }

    applyFilters() {
        let filtered = [...this.evaluations];

        // Filtro por materia
        const subjectId = this.filterForm.get('subjectId')?.value;
        if (subjectId) {
            filtered = filtered.filter(e => e.subjectId === Number(subjectId));
        }

        // Filtro por tipo
        const type = this.filterForm.get('type')?.value;
        if (type) {
            filtered = filtered.filter(e => e.type === type);
        }

        // Filtro por texto
        if (this.textFilter) {
            const searchTerm = this.textFilter.toLowerCase();
            filtered = filtered.filter(e =>
                e.name.toLowerCase().includes(searchTerm)
            );
        }

        this.filteredEvaluations = filtered;
    }

    applyTextFilter(event: Event) {
        this.textFilter = (event.target as HTMLInputElement).value.trim();
        this.applyFilters();
    }

    clearTextFilter(input: HTMLInputElement) {
        input.value = '';
        this.textFilter = '';
        this.applyFilters();
    }

    refreshData() {
        this.notificationService.success('Actualizando datos...');
        this.loadEvaluations();
    }

    getTotalEvaluations(): number {
        return this.evaluations.length;
    }

    getEvaluationsByType(type: string): number {
        return this.evaluations.filter(e => e.type === type).length;
    }

    getTypeIcon(type: string): string {
        const icons: { [key: string]: string } = {
            'exam': 'quiz',
            'homework': 'description',
            'project': 'work',
            'participation': 'record_voice_over'
        };
        return icons[type] || 'assignment';
    }

    isOverdue(dueDate: Date): boolean {
        return new Date(dueDate) < new Date();
    }

    deleteEvaluation(id: number) {
        if (confirm('¿Estás seguro de eliminar esta evaluación? Esto borrará todas las calificaciones asociadas.')) {
            this.evaluationsService.delete(id).subscribe({
                next: () => {
                    this.notificationService.success('Evaluación eliminada correctamente');
                    this.loadEvaluations();
                },
                error: (err) => {
                    console.error('❌ Error deleting evaluation', err);
                    this.notificationService.error('Error al eliminar la evaluación');
                }
            });
        }
    }

    getTypeLabel(type: string): string {
        const types: { [key: string]: string } = {
            'exam': 'Examen',
            'homework': 'Tarea',
            'project': 'Proyecto',
            'participation': 'Participación'
        };
        return types[type] || type;
    }

    getSubjectName(subjectId: number): string {
        const subject = this.subjects.find(s => s.id === subjectId);
        return subject ? subject.name : 'Desconocida';
    }
}
