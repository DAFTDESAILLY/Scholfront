import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StudentConsent, ConsentType } from '../models/consent.model';

@Injectable({
    providedIn: 'root'
})
export class ConsentsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/consents`;

    // Consent Types
    getConsentTypes(): Observable<ConsentType[]> {
        return this.http.get<ConsentType[]>(`${this.apiUrl}/types`);
    }

    createConsentType(data: Partial<ConsentType>): Observable<ConsentType> {
        return this.http.post<ConsentType>(`${this.apiUrl}/types`, data);
    }

    updateConsentType(id: number, data: Partial<ConsentType>): Observable<ConsentType> {
        return this.http.patch<ConsentType>(`${this.apiUrl}/types/${id}`, data);
    }

    deleteConsentType(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/types/${id}`);
    }

    // Student Consents
    getStudentConsents(studentId: number): Observable<StudentConsent[]> {
        return this.http.get<StudentConsent[]>(`${this.apiUrl}/student/${studentId}`);
    }

    createConsent(data: Partial<StudentConsent>): Observable<StudentConsent> {
        return this.http.post<StudentConsent>(this.apiUrl, data);
    }

    revokeConsent(id: number, revokedBy: string, notes?: string): Observable<StudentConsent> {
        return this.http.patch<StudentConsent>(`${this.apiUrl}/${id}/revoke`, {
            revokedBy,
            notes
        });
    }

    deleteConsent(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
