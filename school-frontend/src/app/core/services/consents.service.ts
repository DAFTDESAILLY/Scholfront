import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StudentShareConsent } from '../models/consent.model';

@Injectable({
    providedIn: 'root'
})
export class ConsentsService {
    private apiUrl = `${environment.apiUrl}/consents`;

    constructor(private http: HttpClient) { }

    findAll(): Observable<StudentShareConsent[]> {
        return this.http.get<StudentShareConsent[]>(this.apiUrl);
    }

    findOne(id: number): Observable<StudentShareConsent> {
        return this.http.get<StudentShareConsent>(`${this.apiUrl}/${id}`);
    }

    create(consent: any): Observable<StudentShareConsent> {
        return this.http.post<StudentShareConsent>(this.apiUrl, consent);
    }

    update(id: number, consent: any): Observable<StudentShareConsent> {
        return this.http.patch<StudentShareConsent>(`${this.apiUrl}/${id}`, consent);
    }

    deleteConsent(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getStudentConsents(studentId: number): Observable<StudentShareConsent[]> {
        return this.http.get<StudentShareConsent[]>(this.apiUrl).pipe(
            map(consents => consents.filter(c => c.studentId === studentId))
        );
    }

    private consentTypes: any[] = [
        { id: 1, name: 'Conducta', description: 'Registro de conducta', isActive: true, recordType: 'conducta' },
        { id: 2, name: 'Tutoría', description: 'Sesiones de tutoría', isActive: true, recordType: 'tutoría' },
        { id: 3, name: 'Médico', description: 'Historial médico', isActive: true, recordType: 'médico' },
        { id: 4, name: 'Cognitivo', description: 'Evaluaciones cognitivas', isActive: true, recordType: 'cognitivo' }
    ];

    getConsentTypes(): Observable<any[]> {
        return of(this.consentTypes);
    }

    createConsentType(type: any): Observable<any> {
        const newType = {
            ...type,
            id: this.consentTypes.length + 1,
            isActive: true
        };
        this.consentTypes.push(newType);
        return of(newType);
    }

    updateConsentType(id: number, type: any): Observable<any> {
        const index = this.consentTypes.findIndex(t => t.id === id);
        if (index !== -1) {
            this.consentTypes[index] = { ...this.consentTypes[index], ...type };
            return of(this.consentTypes[index]);
        }
        return of(null);
    }

    revokeConsent(id: number, revokedBy: string, reason: string): Observable<StudentShareConsent> {
        return this.update(id, { isActive: false, revokedAt: new Date(), notes: reason });
    }
}
