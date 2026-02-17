import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StudentAssignment } from '../models/student-assignment.model';

@Injectable({
    providedIn: 'root'
})
export class StudentAssignmentsService {
    private apiUrl = `${environment.apiUrl}/student-assignments`;

    constructor(private http: HttpClient) { }

    findAll(): Observable<StudentAssignment[]> {
        return this.http.get<StudentAssignment[]>(this.apiUrl);
    }

    findOne(id: number): Observable<StudentAssignment> {
        return this.http.get<StudentAssignment>(`${this.apiUrl}/${id}`);
    }

    findByStudent(studentId: number): Observable<StudentAssignment[]> {
        return this.http.get<StudentAssignment[]>(`${this.apiUrl}/student/${studentId}`);
    }

    create(assignment: any): Observable<StudentAssignment> {
        return this.http.post<StudentAssignment>(this.apiUrl, assignment);
    }

    update(id: number, assignment: any): Observable<StudentAssignment> {
        return this.http.patch<StudentAssignment>(`${this.apiUrl}/${id}`, assignment);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
