import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Attendance } from '../models/attendance.model';

@Injectable({
    providedIn: 'root'
})
export class AttendanceService {
    private apiUrl = `${environment.apiUrl}/attendance`;

    constructor(private http: HttpClient) { }

    saveBatch(attendanceData: any[]): Observable<any[]> {
        // Backend doesn't support batch, so we send individual requests
        const requests = attendanceData.map(record =>
            this.http.post<Attendance>(this.apiUrl, record)
        );
        return forkJoin(requests);
    }

    getBySubjectAndDate(subjectId: number, date: string): Observable<Attendance[]> {
        console.log(`📡 API Call: GET ${this.apiUrl}?subjectId=${subjectId}&date=${date}`);
        return this.http.get<Attendance[]>(`${this.apiUrl}?subjectId=${subjectId}&date=${date}`)
            .pipe(
                catchError(error => {
                    console.error('❌ Error en getBySubjectAndDate:', error);
                    return of([]);
                })
            );
    }

    getStudentAttendance(studentId: number, subjectId: number): Observable<Attendance[]> {
        const url = `${this.apiUrl}?studentId=${studentId}&subjectId=${subjectId}`;
        console.log(`📡 API Call: GET ${url}`);
        return this.http.get<Attendance[]>(url)
            .pipe(
                catchError(error => {
                    console.error(`❌ Error en getStudentAttendance (studentId=${studentId}, subjectId=${subjectId}):`, error);
                    // Devolver array vacío en lugar de propagar el error
                    return of([]);
                })
            );
    }
}
