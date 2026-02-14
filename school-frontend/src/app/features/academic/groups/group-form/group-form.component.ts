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
import { GroupsService } from '../../../../core/services/groups.service';
import { PeriodsService } from '../../../../core/services/periods.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AcademicPeriod } from '../../../../core/models/academic-period.model';

@Component({
    selector: 'app-group-form',
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
    templateUrl: './group-form.component.html',
    styleUrls: ['./group-form.component.scss']
})
export class GroupFormComponent implements OnInit {
    groupForm: FormGroup;
    isEditMode = false;
    groupId: number | null = null;
    periods: AcademicPeriod[] = [];

    constructor(
        private fb: FormBuilder,
        private groupsService: GroupsService,
        private periodsService: PeriodsService,
        private router: Router,
        private route: ActivatedRoute,
        private notificationService: NotificationService
    ) {
        this.groupForm = this.fb.group({
            name: ['', Validators.required],
            academicPeriodId: ['', Validators.required],
            status: ['active', Validators.required]
        });
    }

    ngOnInit() {
        this.loadPeriods();
        this.route.paramMap.pipe(
            switchMap(params => {
                const id = params.get('id');
                if (id) {
                    this.isEditMode = true;
                    this.groupId = +id;
                    return this.groupsService.getById(this.groupId);
                }
                return of(null);
            })
        ).subscribe(group => {
            if (group) {
                this.groupForm.patchValue(group);
            }
        });
    }

    loadPeriods() {
        this.periodsService.getAll().subscribe(data => {
            this.periods = data;
        });
    }

    onSubmit() {
        if (this.groupForm.valid) {
            const operation = this.isEditMode
                ? this.groupsService.update(this.groupId!, this.groupForm.value)
                : this.groupsService.create(this.groupForm.value);

            operation.subscribe({
                next: () => {
                    this.notificationService.success(`Group ${this.isEditMode ? 'updated' : 'created'} successfully`);
                    this.router.navigate(['/groups']);
                },
                error: () => { }
            });
        }
    }
}
