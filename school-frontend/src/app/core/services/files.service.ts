import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SchoolFile } from '../models/school-file.model';

@Injectable({
    providedIn: 'root'
})
export class FilesService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/files`;

    uploadFile(file: File, category?: string): Observable<SchoolFile> {
        const formData = new FormData();
        formData.append('file', file);
        if (category) formData.append('category', category);

        return this.http.post<SchoolFile>(this.apiUrl, formData);
    }

    getFiles(category?: string): Observable<SchoolFile[]> {
        const url = category ? `${this.apiUrl}?category=${category}` : this.apiUrl;
        return this.http.get<SchoolFile[]>(url);
    }

    getFile(id: number): Observable<SchoolFile> {
        return this.http.get<SchoolFile>(`${this.apiUrl}/${id}`);
    }

    downloadFile(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${id}/download`, {
            responseType: 'blob'
        });
    }

    deleteFile(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
