import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentRecordsService } from '../../../core/services/records.service';
import { ConsentsService } from '../../../core/services/consents.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-student-records',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatListModule,
        MatIconModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        ReactiveFormsModule
    ],
    templateUrl: './student-records.component.html',
    styleUrls: ['./student-records.component.scss']
})
export class StudentRecordsComponent implements OnInit {
    @Input() studentId?: number;
    records: any[] = [];
    isCreating = false;
    recordForm: FormGroup;

    constructor(
        private recordsService: StudentRecordsService,
        private route: ActivatedRoute,
        private notificationService: NotificationService,
        private shareConsentsService: ConsentsService, // To get record types
        private fb: FormBuilder
    ) {
        this.recordForm = this.fb.group({
            type: ['', Validators.required],
            description: ['', Validators.required]
        });
    }

    ngOnInit() {
        if (!this.studentId) {
            const id = this.route.snapshot.paramMap.get('id');
            if (id) {
                this.studentId = +id;
            }
        }

        if (this.studentId) {
            this.loadRecords();
        }
    }

    loadRecords() {
        if (this.studentId) {
            this.recordsService.getByStudent(this.studentId).subscribe(data => this.records = data);
        }
    }

    createRecord() {
        if (this.recordForm.valid && this.studentId) {
            this.isCreating = true;
            const newRecord = {
                studentId: this.studentId,
                contextId: 1, // Default context
                ...this.recordForm.value
            };

            this.recordsService.create(newRecord).subscribe({
                next: (record) => {
                    this.notificationService.success('Registro creado exitosamente');
                    this.records.push(record);
                    this.recordForm.reset();
                    this.isCreating = false;
                },
                error: (err) => {
                    console.error('Error creating record:', err);
                    this.notificationService.error('Error al crear el registro');
                    this.isCreating = false;
                }
            });
        }
    }

    deleteRecord(record: any) {
        if (confirm('¿Estás seguro de eliminar este registro?')) {
            this.recordsService.delete(record.id).subscribe({
                next: () => {
                    this.notificationService.success('Registro eliminado');
                    this.records = this.records.filter(r => r.id !== record.id);
                },
                error: () => this.notificationService.error('Error al eliminar registro')
            });
        }
    }
}
