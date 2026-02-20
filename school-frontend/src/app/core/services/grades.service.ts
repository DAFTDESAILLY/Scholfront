import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Grade } from '../models/grade.model';

@Injectable({
  providedIn: 'root'
})
export class GradesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  saveBatch(grades: any[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/grades/batch`, grades);
  }

  getByEvaluationItem(evaluationItemId: number): Observable<Grade[]> {
    return this.http.get<Grade[]>(`${this.apiUrl}/grades/evaluation-item/${evaluationItemId}`);
  }

  getAll(): Observable<Grade[]> {
    return this.http.get<Grade[]>(`${this.apiUrl}/grades`);
  }

  getSubjectAverages(subjectId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/grades/subject/${subjectId}/averages`);
  }
}
