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
import { SubjectsService } from '../../../../core/services/subjects.service';
import { GroupsService } from '../../../../core/services/groups.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Group } from '../../../../core/models/group.model';

@Component({
    selector: 'app-subject-form',
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
        MatFormFieldModule
    ],
    templateUrl: './subject-form.component.html',
    styleUrls: ['./subject-form.component.scss']
})
export class SubjectFormComponent implements OnInit {
    subjectForm: FormGroup;
    isEditMode = false;
    subjectId: number | null = null;
    groups: Group[] = [];

    constructor(
        private fb: FormBuilder,
        private subjectsService: SubjectsService,
        private groupsService: GroupsService,
        private router: Router,
        private route: ActivatedRoute,
        private notificationService: NotificationService
    ) {
        this.subjectForm = this.fb.group({
            name: ['', Validators.required],
            groupId: ['', Validators.required],
            status: ['active', Validators.required]
        });
    }

    ngOnInit() {
        this.loadGroups();
        this.route.paramMap.pipe(
            switchMap(params => {
                const id = params.get('id');
                if (id) {
                    this.isEditMode = true;
                    this.subjectId = +id;
                    return this.subjectsService.getById(this.subjectId);
                }
                return of(null);
            })
        ).subscribe(subject => {
            if (subject) {
                this.subjectForm.patchValue(subject);
            }
        });
    }

    loadGroups() {
        this.groupsService.getAll().subscribe(data => {
            this.groups = data;
        });
    }

    onSubmit() {
        if (this.subjectForm.valid) {
            const operation = this.isEditMode
                ? this.subjectsService.update(this.subjectId!, this.subjectForm.value)
                : this.subjectsService.create(this.subjectForm.value);

            operation.subscribe({
                next: () => {
                    this.notificationService.success(`Subject ${this.isEditMode ? 'updated' : 'created'} successfully`);
                    this.router.navigate(['/subjects']);
                },
                error: () => { }
            });
        }
    }
}
