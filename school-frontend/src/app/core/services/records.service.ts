import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SchoolFile } from '../models/school-file.model';

@Injectable({
    providedIn: 'root'
})
export class RecordsService {
    private apiUrl = `${environment.apiUrl}/files`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<SchoolFile[]> {
        return this.http.get<SchoolFile[]>(this.apiUrl);
    }

    getByStudent(studentId: number): Observable<SchoolFile[]> {
        return this.http.get<SchoolFile[]>(`${this.apiUrl}?studentId=${studentId}`);
    }

    upload(file: File, metadata: any): Observable<SchoolFile> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('studentId', metadata.studentId);
        formData.append('contextId', metadata.contextId);

        return this.http.post<SchoolFile>(`${this.apiUrl}/upload`, formData);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
