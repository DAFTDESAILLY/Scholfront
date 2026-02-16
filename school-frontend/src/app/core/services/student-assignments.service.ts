import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StudentAssignment, StudentAssignmentHistory } from '../models/student-assignment.model';

@Injectable({
    providedIn: 'root'
})
export class StudentAssignmentsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/student-assignments`;

    // Assignments
    getAssignmentsByStudent(studentId: number): Observable<StudentAssignment[]> {
        return this.http.get<StudentAssignment[]>(`${this.apiUrl}/student/${studentId}`);
    }

    getAssignmentsByGroup(groupId: number): Observable<StudentAssignment[]> {
        return this.http.get<StudentAssignment[]>(`${this.apiUrl}/group/${groupId}`);
    }

    assignStudent(data: {
        studentId: number;
        groupId: number;
        notes?: string;
    }): Observable<StudentAssignment> {
        return this.http.post<StudentAssignment>(this.apiUrl, data);
    }

    unassignStudent(assignmentId: number, reason?: string): Observable<StudentAssignment> {
        return this.http.patch<StudentAssignment>(`${this.apiUrl}/${assignmentId}/unassign`, {
            reason
        });
    }

    transferStudent(assignmentId: number, newGroupId: number, notes?: string): Observable<StudentAssignment> {
        return this.http.patch<StudentAssignment>(`${this.apiUrl}/${assignmentId}/transfer`, {
            newGroupId,
            notes
        });
    }

    getAssignmentHistory(assignmentId: number): Observable<StudentAssignmentHistory[]> {
        return this.http.get<StudentAssignmentHistory[]>(`${this.apiUrl}/${assignmentId}/history`);
    }

    deleteAssignment(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
