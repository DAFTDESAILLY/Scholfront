import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Assessment } from '../models/assessment.model';
import { Grade } from '../models/grade.model';

@Injectable({
    providedIn: 'root'
})
export class AssessmentsService {
    private apiUrl = `${environment.apiUrl}/assessments`;
    private gradesUrl = `${environment.apiUrl}/grades`;

    constructor(private http: HttpClient) { }

    // Assessments
    getAll(): Observable<Assessment[]> {
        return this.http.get<Assessment[]>(this.apiUrl);
    }

    getBySubject(subjectId: number): Observable<Assessment[]> {
        return this.http.get<Assessment[]>(`${this.apiUrl}?subjectId=${subjectId}`);
    }

    create(data: any): Observable<Assessment> {
        return this.http.post<Assessment>(this.apiUrl, data);
    }

    update(id: number, data: any): Observable<Assessment> {
        return this.http.patch<Assessment>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Grades
    saveGrades(grades: any[]): Observable<any> {
        return this.http.post<any>(`${this.gradesUrl}/batch`, { grades });
    }

    getGradesByAssessment(assessmentId: number): Observable<Grade[]> {
        return this.http.get<Grade[]>(`${this.gradesUrl}?assessmentId=${assessmentId}`);
    }
}
