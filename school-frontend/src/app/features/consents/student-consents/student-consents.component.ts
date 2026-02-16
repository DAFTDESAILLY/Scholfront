import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { ConsentsService } from '../../../core/services/consents.service';
import { StudentConsent } from '../../../core/models/consent.model';
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

    studentId!: number;
    consents: StudentConsent[] = [];
    displayedColumns: string[] = ['consentType', 'grantedBy', 'grantedAt', 'expiresAt', 'status', 'actions'];
    isLoading = false;

    ngOnInit(): void {
        this.studentId = Number(this.route.snapshot.paramMap.get('studentId'));
        this.loadConsents();
    }

    loadConsents(): void {
        this.isLoading = true;
        this.consentsService.getStudentConsents(this.studentId)
            .pipe(
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
                error: (err) => {
                    console.error('Error loading consents:', err);
                    this.isLoading = false;
                }
            });
    }

    getConsentStatus(consent: StudentConsent): string {
        if (consent.isRevoked) return 'revoked';
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

    revokeConsent(consent: StudentConsent): void {
        if (confirm('¿Estás seguro de revocar este consentimiento?')) {
            this.consentsService.revokeConsent(consent.id, 'Admin', 'Revocado desde interfaz').subscribe({
                next: () => this.loadConsents(),
                error: (err) => console.error('Error revoking consent:', err)
            });
        }
    }

    deleteConsent(id: number): void {
        if (confirm('¿Estás seguro de eliminar este consentimiento?')) {
            this.consentsService.deleteConsent(id).subscribe({
                next: () => this.loadConsents(),
                error: (err) => console.error('Error deleting consent:', err)
            });
        }
    }
}
