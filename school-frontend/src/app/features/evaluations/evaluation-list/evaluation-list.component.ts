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
    subjects: Subject[] = [];
    filterForm: FormGroup;
    displayedColumns: string[] = ['name', 'type', 'subject', 'maxScore', 'weight', 'dueDate', 'actions'];

    constructor(
        private evaluationsService: EvaluationsService,
        private subjectsService: SubjectsService,
        private notificationService: NotificationService,
        private fb: FormBuilder
    ) {
        this.filterForm = this.fb.group({
            subjectId: ['']
        });
    }

    ngOnInit() {
        this.loadSubjects();
        this.loadEvaluations();

        this.filterForm.get('subjectId')?.valueChanges.subscribe(subjectId => {
            if (subjectId) {
                this.loadEvaluationsBySubject(subjectId);
            } else {
                this.loadEvaluations();
            }
        });
    }

    loadSubjects() {
        this.subjectsService.getAll().subscribe({
            next: (data) => this.subjects = data,
            error: (err) => console.error('Error loading subjects', err)
        });
    }

    loadEvaluations() {
        this.evaluationsService.getAll().subscribe({
            next: (data) => this.evaluations = data,
            error: (err) => {
                console.error('Error loading evaluations', err);
                this.notificationService.error('Error al cargar evaluaciones');
            }
        });
    }

    loadEvaluationsBySubject(subjectId: number) {
        this.evaluationsService.getBySubject(subjectId).subscribe({
            next: (data) => this.evaluations = data,
            error: (err) => {
                console.error('Error loading evaluations by subject', err);
                this.notificationService.error('Error al cargar evaluaciones de la materia');
            }
        });
    }

    deleteEvaluation(id: number) {
        if (confirm('¿Estás seguro de eliminar esta evaluación? Esto borrará todas las calificaciones asociadas.')) {
            this.evaluationsService.delete(id).subscribe({
                next: () => {
                    this.notificationService.success('Evaluación eliminada correctamente');
                    const currentSubject = this.filterForm.get('subjectId')?.value;
                    if (currentSubject) {
                        this.loadEvaluationsBySubject(currentSubject);
                    } else {
                        this.loadEvaluations();
                    }
                },
                error: (err) => {
                    console.error('Error deleting evaluation', err);
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
