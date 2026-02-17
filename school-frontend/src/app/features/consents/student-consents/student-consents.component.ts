import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { ConsentsService } from '../../../core/services/consents.service';
import { StudentShareConsent } from '../../../core/models/consent.model';
import { catchError, of } from 'rxjs';

@Component({
    selector: 'app-student-consents',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatCardModule
    ],
    templateUrl: './student-consents.component.html',
    styleUrls: ['./student-consents.component.scss']
})
export class StudentConsentsComponent implements OnInit {
    private consentsService = inject(ConsentsService);
    private route = inject(ActivatedRoute);

    @Input() studentId?: number;
    consents: StudentShareConsent[] = [];
    displayedColumns: string[] = ['consentType', 'grantedBy', 'grantedAt', 'expiresAt', 'status', 'actions'];
    isLoading = false;

    ngOnInit(): void {
        if (!this.studentId) {
            const id = this.route.snapshot.paramMap.get('studentId') || this.route.snapshot.paramMap.get('id');
            if (id) {
                this.studentId = +id;
            }
        }

        if (this.studentId) {
            this.loadConsents();
        }
    }

    loadConsents(): void {
        this.isLoading = true;
        if (this.studentId) {
            this.consentsService.getStudentConsents(this.studentId).pipe(
                catchError(error => {
                    console.warn('No se pudieron cargar los consentimientos. Backend no disponible.');
                    return of([]);
                })
            )
                .subscribe({
                    next: (consents) => {
                        this.consents = consents;
                        this.isLoading = false;
                    },
                    error: (err: any) => {
                        console.error('Error loading consents:', err);
                        this.isLoading = false;
                    }
                });
        }
    }

    getConsentStatus(consent: StudentShareConsent): string {
        if (!consent.isActive) return 'revoked'; // Simplified
        if (consent.revokedAt) return 'revoked';
        if (consent.expiresAt && new Date(consent.expiresAt) < new Date()) return 'expired';
        return 'active';
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'active': return 'primary';
            case 'revoked': return 'warn';
            case 'expired': return 'accent';
            default: return '';
        }
    }

    revokeConsent(consent: StudentShareConsent): void {
        if (confirm('¿Estás seguro de revocar este consentimiento?')) {
            this.consentsService.revokeConsent(consent.id, 'Admin', 'Revocado desde interfaz').subscribe({
                next: () => this.loadConsents(),
                error: (err: any) => console.error('Error revoking consent:', err)
            });
        }
    }

    deleteConsent(id: number): void {
        if (confirm('¿Estás seguro de eliminar este consentimiento?')) {
            this.consentsService.deleteConsent(id).subscribe({
                next: () => this.loadConsents(),
                error: (err: any) => console.error('Error deleting consent:', err)
            });
        }
    }
}
