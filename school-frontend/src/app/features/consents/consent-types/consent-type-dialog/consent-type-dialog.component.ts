import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConsentType } from '../../../../core/models/consent.model';

@Component({
    selector: 'app-consent-type-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatCheckboxModule
    ],
    template: `
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Nuevo' }} Tipo de Consentimiento</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="name" placeholder="Ej. Excursión">
          <mat-error *ngIf="form.get('name')?.hasError('required')">El nombre es requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
            <mat-label>Tipo de Registro</mat-label>
            <mat-select formControlName="recordType">
                <mat-option value="conducta">Conducta</mat-option>
                <mat-option value="tutoría">Tutoría</mat-option>
                <mat-option value="médico">Médico</mat-option>
                <mat-option value="cognitivo">Cognitivo</mat-option>
            </mat-select>
        </mat-form-field>

        <div class="checkbox-container">
            <mat-checkbox formControlName="isActive">Activo</mat-checkbox>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">Guardar</button>
    </mat-dialog-actions>
  `,
    styles: [`
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 400px;
      padding-top: 1rem;
    }
    .full-width {
      width: 100%;
    }
    .checkbox-container {
        margin-top: 0.5rem;
    }
  `]
})
export class ConsentTypeDialogComponent implements OnInit {
    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<ConsentTypeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConsentType | null
    ) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            recordType: ['conducta', Validators.required],
            isActive: [true]
        });
    }

    ngOnInit(): void {
        if (this.data) {
            this.form.patchValue(this.data);
        }
    }

    save(): void {
        if (this.form.valid) {
            this.dialogRef.close(this.form.value);
        }
    }
}
