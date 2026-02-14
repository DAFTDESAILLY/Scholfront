import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Group } from '../models/group.model';

@Injectable({
    providedIn: 'root'
})
export class GroupsService {
    private apiUrl = `${environment.apiUrl}/groups`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Group[]> {
        return this.http.get<Group[]>(this.apiUrl);
    }

    getById(id: number): Observable<Group> {
        return this.http.get<Group>(`${this.apiUrl}/${id}`);
    }

    create(data: any): Observable<Group> {
        return this.http.post<Group>(this.apiUrl, data);
    }

    update(id: number, data: any): Observable<Group> {
        return this.http.patch<Group>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getByPeriod(periodId: number): Observable<Group[]> {
        return this.http.get<Group[]>(`${this.apiUrl}?academicPeriodId=${periodId}`);
    }
}
