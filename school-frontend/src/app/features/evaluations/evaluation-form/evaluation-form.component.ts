import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { EvaluationsService } from '../../../core/services/evaluations.service';
import { SubjectsService } from '../../../core/services/subjects.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Subject } from '../../../core/models/subject.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-evaluation-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule
    ],
    templateUrl: './evaluation-form.component.html',
    styleUrls: ['./evaluation-form.component.scss']
})
export class EvaluationFormComponent implements OnInit {
    evaluationForm: FormGroup;
    subjects: Subject[] = [];
    isEditMode = false;
    evaluationId: number | null = null;

    constructor(
        private fb: FormBuilder,
        private evaluationsService: EvaluationsService,
        private subjectsService: SubjectsService,
        private notificationService: NotificationService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.evaluationForm = this.fb.group({
            name: ['', Validators.required],
            subjectId: ['', Validators.required],
            type: ['exam', Validators.required],
            maxScore: [100, [Validators.required, Validators.min(0)]],
            weight: [100, [Validators.required, Validators.min(0), Validators.max(100)]],
            dueDate: [new Date(), Validators.required],
            description: ['']
        });
    }

    ngOnInit() {
        this.loadSubjects();

        this.route.paramMap.pipe(
            switchMap(params => {
                const id = params.get('id');
                if (id) {
                    this.isEditMode = true;
                    this.evaluationId = +id;
                    return this.evaluationsService.getAll(); // Ideally getById, but mocking with getAll filter
                }
                return of([]);
            })
        ).subscribe(evaluations => {
            if (this.isEditMode && this.evaluationId) {
                const evaluation = evaluations.find(e => e.id === this.evaluationId);
                if (evaluation) {
                    this.evaluationForm.patchValue(evaluation);
                }
            }
        });
    }

    loadSubjects() {
        this.subjectsService.getAll().subscribe({
            next: (data) => this.subjects = data,
            error: (err) => console.error('Error loading subjects', err)
        });
    }

    onSubmit() {
        if (this.evaluationForm.valid) {
            const formData = this.evaluationForm.value;

            // ✅ DEBUG - Ver qué se está enviando
            console.log('📤 EVALUATIONS - Datos enviados:', formData);
            console.log('📤 EVALUATIONS - JSON:', JSON.stringify(formData));

            const operation = this.isEditMode
                ? this.evaluationsService.update(this.evaluationId!, formData)
                : this.evaluationsService.create(formData);

            operation.subscribe({
                next: () => {
                    this.notificationService.success('Evaluación guardada exitosamente');
                    this.router.navigate(['/evaluations']);
                },
                error: (err) => {
                    console.error('❌ Error saving evaluation', err);
                    console.error('❌ Error details:', err.error);

                    // ✅ AGREGAR ESTO - Ver los mensajes específicos
                    if (err.error?.message && Array.isArray(err.error.message)) {
                        console.error('❌ Mensajes de validación:', err.error.message);
                        err.error.message.forEach((msg: any, index: number) => {
                            // ✅ CAMBIAR ESTO
                            console.error(`  ${index + 1}.`, JSON.stringify(msg));
                        });
                    }

                    this.notificationService.error('Error al guardar evaluación');
                }
            });
        }
    }


}
