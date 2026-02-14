import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Context } from '../models/context.model';

@Injectable({
    providedIn: 'root'
})
export class ContextsService {
    private apiUrl = `${environment.apiUrl}/contexts`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Context[]> {
        return this.http.get<Context[]>(this.apiUrl);
    }

    getById(id: number): Observable<Context> {
        return this.http.get<Context>(`${this.apiUrl}/${id}`);
    }

    create(data: any): Observable<Context> {
        return this.http.post<Context>(this.apiUrl, data);
    }

    update(id: number, data: any): Observable<Context> {
        return this.http.patch<Context>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    checkNameExists(name: string): Observable<boolean> {
        return this.http.post<boolean>(`${this.apiUrl}/check-name`, { name });
    }
}
