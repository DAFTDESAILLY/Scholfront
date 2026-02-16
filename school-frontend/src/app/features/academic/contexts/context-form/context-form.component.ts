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
import { AuthService } from '../../../../core/services/auth.service';
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
        private authService: AuthService,  // ✅ Agregar AuthService
        private router: Router,
        private route: ActivatedRoute,
        private notificationService: NotificationService
    ) {
        // ✅ CORREGIDO - Solo campos permitidos por el DTO
        this.contextForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            level: ['', Validators.required]
            // institution y status eliminados
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
                this.contextForm.patchValue({
                    name: context.name,
                    level: context.level
                });
            }
        });
    }

    onSubmit() {
        if (this.contextForm.invalid) {
            this.notificationService.error('Por favor completa todos los campos');
            return;
        }

        // ✅ Debug adicional
        const token = localStorage.getItem('access_token');
        console.log('Token existe:', !!token);

        const currentUser = this.authService.getCurrentUser();
        console.log('Current user:', currentUser);

        if (!currentUser || !currentUser.id) {
            console.error('No hay usuario logueado');
            this.notificationService.error('Usuario no autenticado');
            this.router.navigate(['/auth/login']);
            return;
        }

        const contextData = {
            name: this.contextForm.value.name,
            level: this.contextForm.value.level,
            userId: currentUser.id
        };

        console.log('Enviando datos:', contextData);

        const operation = this.isEditMode
            ? this.contextsService.update(this.contextId!, contextData)
            : this.contextsService.create(contextData);

        operation.subscribe({
            next: () => {
                this.notificationService.success(`Contexto ${this.isEditMode ? 'actualizado' : 'creado'} exitosamente`);
                this.router.navigate(['/contexts']);
            },
            error: (err) => {
                console.error('Error completo:', err);
                if (err.error?.message) {
                    console.error('Mensaje del servidor:', err.error.message);
                }
                this.notificationService.error('Error al guardar el contexto');
            }
        });
    }
}