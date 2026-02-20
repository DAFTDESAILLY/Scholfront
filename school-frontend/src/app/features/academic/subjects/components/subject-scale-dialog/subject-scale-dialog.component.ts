import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Subject as SubjectModel } from '../../../../../core/models/subject.model';

export interface SubjectScaleDialogData {
    subject: SubjectModel;
}

@Component({
    selector: 'app-subject-scale-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule
    ],
    templateUrl: './subject-scale-dialog.component.html',
    styles: [`
    .scale-row {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 8px;
    }
    .weight-field {
      width: 100px;
    }
    .total-row {
      margin-top: 16px;
      font-weight: bold;
      display: flex;
      justify-content: flex-end;
      padding-right: 48px;
    }
    .error-text {
      color: red;
      font-size: 12px;
    }
  `]
})
export class SubjectScaleDialogComponent {
    scaleForm: FormGroup;
    // Default types keys to match EvaluationForm
    defaultTypes = ['exam', 'homework', 'project', 'participation', 'attendance'];

    typeOptions = [
        { value: 'exam', label: 'Examen' },
        { value: 'homework', label: 'Tarea' },
        { value: 'project', label: 'Proyecto' },
        { value: 'participation', label: 'Participación' },
        { value: 'attendance', label: 'Asistencia' }
    ];

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<SubjectScaleDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: SubjectScaleDialogData
    ) {
        this.scaleForm = this.fb.group({
            items: this.fb.array([])
        });

        this.initForm();
    }

    get items() {
        return this.scaleForm.get('items') as FormArray;
    }

    getTypeValue(index: number): string {
        return this.items.at(index).get('type')?.value;
    }

    isCustomType(index: number): boolean {
        const val = this.getTypeValue(index);
        return !!val && !this.typeOptions.some(o => o.value === val);
    }

    initForm() {
        const scale = this.data.subject.gradingScale || {};
        const existingTypes = Object.keys(scale);

        // Merge default types with existing ones
        // We want defaults to appear if not set, or just use what's there?
        // If it's a new scale, show defaults with 0 weight?
        // User probably wants to see options.
        const allTypes = Array.from(new Set([...this.defaultTypes, ...existingTypes]));

        allTypes.forEach(type => {
            this.items.push(this.fb.group({
                type: [type, Validators.required],
                weight: [scale[type] || 0, [Validators.required, Validators.min(0), Validators.max(100)]]
            }));
        });
    }

    addType() {
        this.items.push(this.fb.group({
            type: ['', Validators.required],
            weight: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
        }));
    }

    removeType(index: number) {
        this.items.removeAt(index);
    }

    getTotal(): number {
        return this.items.controls
            .map(control => control.get('weight')?.value || 0)
            .reduce((sum, current) => sum + current, 0);
    }

    onSave() {
        if (this.scaleForm.valid) {
            const total = this.getTotal();
            if (Math.abs(total - 100) > 0.1) { // Floating point tolerance
                // Ideally show error, but for now just validation or alert?
                // Let's rely on form invalidity or check here
                // We will allow saving < 100 but maybe warn? 
                // User requirement: "sumen 100%". 
                // Let's enforce strict 100% for now or allow partial if strictly decided.
                // User prompt implies "check box y diga agregar escala...".
                // Let's strictly require 100%.
            }

            const result: Record<string, number> = {};
            this.items.controls.forEach(control => {
                const type = control.get('type')?.value;
                const weight = control.get('weight')?.value;
                if (type && weight > 0) {
                    result[type] = weight;
                }
            });

            this.dialogRef.close(result);
        }
    }

    isValid(): boolean {
        return this.scaleForm.valid && Math.abs(this.getTotal() - 100) < 0.1;
    }
}
