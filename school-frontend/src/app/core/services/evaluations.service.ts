import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Evaluation } from '../models/evaluation.model';
import { Grade } from '../models/grade.model';

@Injectable({
    providedIn: 'root'
})
export class EvaluationsService {
    private apiUrl = `${environment.apiUrl}/evaluations`;
    private gradesUrl = `${environment.apiUrl}/grades`;

    constructor(private http: HttpClient) { }

    // Evaluations
    getAll(): Observable<Evaluation[]> {
        return this.http.get<Evaluation[]>(this.apiUrl);
    }

    getBySubject(subjectId: number): Observable<Evaluation[]> {
        return this.http.get<Evaluation[]>(`${this.apiUrl}?subjectId=${subjectId}`);
    }

    create(data: any): Observable<Evaluation> {
        return this.http.post<Evaluation>(this.apiUrl, data);
    }

    update(id: number, data: any): Observable<Evaluation> {
        return this.http.patch<Evaluation>(`${this.apiUrl}/${id}`, data);
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

    getGradesByEvaluation(evaluationItemId: number): Observable<Grade[]> {
        return this.http.get<Grade[]>(`${this.gradesUrl}?evaluationItemId=${evaluationItemId}`);
    }
}
