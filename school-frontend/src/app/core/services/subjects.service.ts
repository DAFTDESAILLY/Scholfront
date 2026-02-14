import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Subject } from '../models/subject.model';

@Injectable({
    providedIn: 'root'
})
export class SubjectsService {
    private apiUrl = `${environment.apiUrl}/subjects`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Subject[]> {
        return this.http.get<Subject[]>(this.apiUrl);
    }

    getById(id: number): Observable<Subject> {
        return this.http.get<Subject>(`${this.apiUrl}/${id}`);
    }

    create(data: any): Observable<Subject> {
        return this.http.post<Subject>(this.apiUrl, data);
    }

    update(id: number, data: any): Observable<Subject> {
        return this.http.patch<Subject>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getByGroup(groupId: number): Observable<Subject[]> {
        return this.http.get<Subject[]>(`${this.apiUrl}?groupId=${groupId}`);
    }
}
