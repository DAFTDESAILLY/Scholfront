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

    getConsentTypes(): Observable<any[]> {
        return of([
            { id: 1, name: 'Conducta', description: 'Registro de conducta', isActive: true },
            { id: 2, name: 'Tutoría', description: 'Sesiones de tutoría', isActive: true },
            { id: 3, name: 'Médico', description: 'Historial médico', isActive: true },
            { id: 4, name: 'Cognitivo', description: 'Evaluaciones cognitivas', isActive: true }
        ]);
    }

    revokeConsent(id: number, revokedBy: string, reason: string): Observable<StudentShareConsent> {
        return this.update(id, { isActive: false, revokedAt: new Date(), notes: reason });
    }
}
