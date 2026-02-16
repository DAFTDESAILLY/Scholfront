import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AcademicPeriod } from '../models/academic-period.model';

@Injectable({
    providedIn: 'root'
})
export class PeriodsService {
    private apiUrl = `${environment.apiUrl}/academic-periods`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<AcademicPeriod[]> {
        return this.http.get<AcademicPeriod[]>(this.apiUrl);
    }

    getById(id: number): Observable<AcademicPeriod> {
        return this.http.get<AcademicPeriod>(`${this.apiUrl}/${id}`);
    }

    create(data: any): Observable<AcademicPeriod> {
        return this.http.post<AcademicPeriod>(this.apiUrl, data);
    }

    update(id: number, data: any): Observable<AcademicPeriod> {
        return this.http.patch<AcademicPeriod>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getByContext(contextId: number): Observable<AcademicPeriod[]> {
        return this.http.get<AcademicPeriod[]>(`${this.apiUrl}?contextId=${contextId}`);
    }
}
