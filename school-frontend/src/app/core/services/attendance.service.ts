import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Attendance } from '../models/attendance.model';

@Injectable({
    providedIn: 'root'
})
export class AttendanceService {
    private apiUrl = `${environment.apiUrl}/attendance`;

    constructor(private http: HttpClient) { }

    saveBatch(attendanceData: any[]): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/batch`, { attendance: attendanceData });
    }

    getBySubjectAndDate(subjectId: number, date: string): Observable<Attendance[]> {
        return this.http.get<Attendance[]>(`${this.apiUrl}?subjectId=${subjectId}&date=${date}`);
    }

    getStudentAttendance(studentId: number, subjectId: number): Observable<Attendance[]> {
        return this.http.get<Attendance[]>(`${this.apiUrl}?studentId=${studentId}&subjectId=${subjectId}`);
    }
}
