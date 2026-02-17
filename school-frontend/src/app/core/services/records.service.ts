import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class StudentRecordsService {
    private apiUrl = `${environment.apiUrl}/student-records`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    getByStudent(studentId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}?studentId=${studentId}`);
    }

    create(record: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, record);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
