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
import { MatIconModule } from '@angular/material/icon';
import { ContextsService } from '../../../../core/services/contexts.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-context-form',
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
        MatIconModule
    ],
    templateUrl: './context-form.component.html',
    styleUrls: ['./context-form.component.scss']
})
export class ContextFormComponent implements OnInit {
    contextForm: FormGroup;
    isEditMode = false;
    contextId: number | null = null;

    constructor(
        private fb: FormBuilder,
        private contextsService: ContextsService,
        private router: Router,
        private route: ActivatedRoute,
        private notificationService: NotificationService
    ) {
        this.contextForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            level: ['', Validators.required],
            institution: [''],
            status: ['active', Validators.required]
        });
    }

    ngOnInit() {
        this.route.paramMap.pipe(
            switchMap(params => {
                const id = params.get('id');
                if (id) {
                    this.isEditMode = true;
                    this.contextId = +id;
                    return this.contextsService.getById(this.contextId);
                }
                return of(null);
            })
        ).subscribe(context => {
            if (context) {
                this.contextForm.patchValue(context);
            }
        });
    }

    onSubmit() {
        if (this.contextForm.valid) {
            const operation = this.isEditMode
                ? this.contextsService.update(this.contextId!, this.contextForm.value)
                : this.contextsService.create(this.contextForm.value);

            operation.subscribe({
                next: () => {
                    this.notificationService.success(`Context ${this.isEditMode ? 'updated' : 'created'} successfully`);
                    this.router.navigate(['/contexts']);
                },
                error: (err) => {
                    // handled by interceptor
                }
            });
        }
    }
}
