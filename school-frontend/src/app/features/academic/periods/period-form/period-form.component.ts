import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { PeriodsService } from '../../../../core/services/periods.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ContextsService } from '../../../../core/services/contexts.service';
import { Context } from '../../../../core/models/context.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-period-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule
    ],
    templateUrl: './period-form.component.html',
    styleUrls: ['./period-form.component.scss']
})
export class PeriodFormComponent implements OnInit {
    periodForm: FormGroup;
    isEditMode = false;
    periodId: number | null = null;
    contexts: Context[] = [];

    private fb = inject(FormBuilder);
    private periodsService = inject(PeriodsService);
    private contextsService = inject(ContextsService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private notificationService = inject(NotificationService);

    constructor() {
        this.periodForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            type: ['semester', Validators.required],
            status: ['active', Validators.required],
            contextId: ['', Validators.required]
        });

        // 🟢 Auto-calcular fecha fin cuando cambia tipo o fecha inicio
        this.periodForm.get('startDate')?.valueChanges.subscribe(() => this.calculateEndDate());
        this.periodForm.get('type')?.valueChanges.subscribe(() => this.calculateEndDate());
    }

    ngOnInit(): void {
        this.loadContexts();

        this.route.paramMap.pipe(
            switchMap(params => {
                const id = params.get('id');
                if (id) {
                    this.isEditMode = true;
                    this.periodId = +id;
                    return this.periodsService.getById(this.periodId);
                }
                return of(null);
            })
        ).subscribe(period => {
            if (period) {
                this.periodForm.patchValue({
                    name: period.name,
                    startDate: period.startDate,
                    endDate: period.endDate,
                    type: period.type,
                    status: period.status,
                    contextId: period.contextId
                });
            }
        });
    }

    loadContexts() {
        this.contextsService.getAll().subscribe({
            next: (data) => this.contexts = data,
            error: (err) => console.error('Error loading contexts', err)
        });
    }

    calculateEndDate() {
        const startDate = this.periodForm.get('startDate')?.value;
        const type = this.periodForm.get('type')?.value;

        if (startDate && type) {
            const date = new Date(startDate);
            let monthsToAdd = 0;

            switch (type) {
                case 'semester': // Semestre -> 6 meses
                    monthsToAdd = 6;
                    break;
                case 'trimester': // Cuatrimestre -> 4 meses (ajuste común)
                    monthsToAdd = 4;
                    break;
                case 'quarter': // Trimestre -> 3 meses
                    monthsToAdd = 3;
                    break;
                case 'year': // Anual -> 1 año
                    monthsToAdd = 12;
                    break;
            }

            if (monthsToAdd > 0) {
                date.setMonth(date.getMonth() + monthsToAdd);
                // Restar un día para que cierre justo antes del sig periodo
                date.setDate(date.getDate() - 1);
                this.periodForm.patchValue({ endDate: date }, { emitEvent: false });
            }
        }
    }

    onSubmit() {
        if (this.periodForm.valid) {
            // ✅ Convertir contextId a número
            const periodData = {
                ...this.periodForm.value,
                contextId: +this.periodForm.value.contextId  // Convertir string → number
            };

            console.log('📤 Datos enviados al backend:', periodData);

            const operation = this.isEditMode
                ? this.periodsService.update(this.periodId!, periodData)
                : this.periodsService.create(periodData);

            operation.subscribe({
                next: () => {
                    this.notificationService.success(`Período ${this.isEditMode ? 'actualizado' : 'creado'} exitosamente`);
                    this.router.navigate(['/periods']);
                },
                error: (err) => {
                    console.error('❌ Error completo:', err);
                    console.error('❌ Detalles del error:', err.error);
                    this.notificationService.error('Error al guardar período');
                }
            });
        } else {
            console.error('❌ Formulario inválido:', this.periodForm.errors);
            this.notificationService.error('Por favor completa todos los campos');
        }
    }
}
