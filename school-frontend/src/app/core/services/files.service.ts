import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SchoolFile } from '../models/school-file.model';

@Injectable({
    providedIn: 'root'
})
export class FilesService {
    private apiUrl = `${environment.apiUrl}/files`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<SchoolFile[]> {
        return this.http.get<SchoolFile[]>(this.apiUrl);
    }

    upload(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.apiUrl}/upload`, formData);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
