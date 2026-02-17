import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
        // Backend doesn't support filtering by subjectId yet, so we fetch all and filter client-side
        return this.http.get<Evaluation[]>(this.apiUrl).pipe(
            map(evaluations => evaluations.filter(e => Number(e.subjectId) === Number(subjectId)))
        );
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

    getGradesByEvaluation(evaluationId: number): Observable<Grade[]> {
        return this.http.get<Grade[]>(`${this.gradesUrl}?evaluationId=${evaluationId}`);
    }


}