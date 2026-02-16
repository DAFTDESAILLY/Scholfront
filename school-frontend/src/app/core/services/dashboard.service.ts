import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
    totalStudents: number;
    totalGroups: number;
    totalSubjects: number;
    activePeriods: number;
}

export interface RecentActivity {
    id: number;
    description: string;
    date: Date;
    type: 'info' | 'warning' | 'success';
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.apiUrl}/dashboard`;

    constructor(private http: HttpClient) { }

    getStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
    }

    getRecentActivity(): Observable<RecentActivity[]> {
        return this.http.get<RecentActivity[]>(`${this.apiUrl}/activity`);
    }
}
