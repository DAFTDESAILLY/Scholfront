import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { StudentsService } from '../../../core/services/students.service';
import { NotificationService } from '../../../core/services/notification.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-student-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        MatCardModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatOptionModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    templateUrl: './student-form.component.html',
    styleUrls: ['./student-form.component.scss']
})
export class StudentFormComponent implements OnInit {
    studentForm: FormGroup;
    isEditMode = false;
    studentId: number | null = null;

    constructor(
        private fb: FormBuilder,
        private studentsService: StudentsService,
        private router: Router,
        private route: ActivatedRoute,
        private notificationService: NotificationService
    ) {
        this.studentForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.email]],
            studentId: [''],
            phone: [''],
            address: [''],
            dateOfBirth: [''],
            status: ['active', Validators.required]
        });
    }

    ngOnInit() {
        this.route.paramMap.pipe(
            switchMap(params => {
                const id = params.get('id');
                if (id) {
                    this.isEditMode = true;
                    this.studentId = +id;
                    return this.studentsService.getById(this.studentId);
                }
                return of(null);
            })
        ).subscribe(student => {
            if (student) {
                // Split fullName into firstName and lastName
                const nameParts = student.fullName.split(' ');
                const lastName = nameParts.length > 1 ? nameParts.pop() : '';
                const firstName = nameParts.join(' ');

                this.studentForm.patchValue({
                    ...student,
                    firstName: firstName,
                    lastName: lastName
                });
            }
        });
    }

    onSubmit() {
        if (this.studentForm.valid) {
            const formData = { ...this.studentForm.value };
            formData.fullName = `${formData.firstName} ${formData.lastName}`.trim();
            // Remove individual name fields as backend expects fullName
            delete formData.firstName;
            delete formData.lastName;

            const operation = this.isEditMode
                ? this.studentsService.update(this.studentId!, formData)
                : this.studentsService.create(formData);

            operation.subscribe({
                next: () => {
                    this.notificationService.success(`Student ${this.isEditMode ? 'updated' : 'created'} successfully`);
                    this.router.navigate(['/students']);
                },
                error: (error) => {
                    console.error('Error creating/updating student:', error);
                    // Log detailed error from backend if available
                    if (error.error) {
                        console.error('Backend validation details:', error.error);
                        // Optional: Show specific error message to user
                        this.notificationService.error(`Error: ${JSON.stringify(error.error) || 'Failed to save student'}`);
                    } else {
                        this.notificationService.error('Failed to save student. Please check the form data.');
                    }
                }
            });
        }
    }
}
