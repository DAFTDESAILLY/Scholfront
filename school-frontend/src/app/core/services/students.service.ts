import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Student } from '../models/student.model';

@Injectable({
    providedIn: 'root'
})
export class StudentsService {
    private apiUrl = `${environment.apiUrl}/students`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Student[]> {
        return this.http.get<Student[]>(this.apiUrl);
    }

    getById(id: number): Observable<Student> {
        return this.http.get<Student>(`${this.apiUrl}/${id}`);
    }

    create(data: any): Observable<Student> {
        return this.http.post<Student>(this.apiUrl, data);
    }

    update(id: number, data: any): Observable<Student> {
        return this.http.patch<Student>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    search(query: string): Observable<Student[]> {
        return this.http.get<Student[]>(`${this.apiUrl}/search?q=${query}`);
    }
}
