import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConsentsService } from '../../../core/services/consents.service';
import { ConsentType } from '../../../core/models/consent.model';
import { catchError, of } from 'rxjs';
import { HelpIconComponent } from '../../../shared/components/help-icon/help-icon.component';

@Component({
    selector: 'app-consent-types',
    standalone: true,
    imports: [
        CommonModule,
        HelpIconComponent,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatDialogModule
    ],
    templateUrl: './consent-types.component.html',
    styleUrls: ['./consent-types.component.scss']
})
export class ConsentTypesComponent implements OnInit {
    private consentsService = inject(ConsentsService);
    private dialog = inject(MatDialog);

    consentTypes: ConsentType[] = [];
    displayedColumns: string[] = ['name', 'description', 'isActive', 'actions'];
    isLoading = false;

    ngOnInit(): void {
        this.loadConsentTypes();
    }

    loadConsentTypes(): void {
        this.isLoading = true;
        this.consentsService.getConsentTypes()
            .pipe(
                catchError(error => {
                    console.warn('No se pudieron cargar los tipos de consentimiento. Backend no disponible.');
                    return of([]);
                })
            )
            .subscribe({
                next: (types: any[]) => { // Fixed implicit any
                    this.consentTypes = types;
                    this.isLoading = false;
                },
                error: (err: any) => { // Fixed implicit any
                    console.error('Error loading consent types:', err);
                    this.isLoading = false;
                }
            });
    }

    openCreateDialog(): void {
        // TODO: Implementar dialog de creación
        console.log('Create dialog not yet implemented');
    }

    openEditDialog(consentType: ConsentType): void {
        // TODO: Implementar dialog de edición
        console.log('Edit dialog not yet implemented for type:', consentType);
    }

    // deleteConsentType removed as types are static
}
