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
        // Mock data for now as backend might not support this yet
        return of({
            totalStudents: 150,
            totalGroups: 12,
            totalSubjects: 45,
            activePeriods: 1
        });
        // return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
    }

    getRecentActivity(): Observable<RecentActivity[]> {
        return of([
            { id: 1, description: 'Attendance marked for Group 1-A', date: new Date(), type: 'success' },
            { id: 2, description: 'New student registered: John Doe', date: new Date(Date.now() - 3600000), type: 'info' },
            { id: 3, description: 'Math Exam grades published', date: new Date(Date.now() - 7200000), type: 'warning' }
        ]);
        // return this.http.get<RecentActivity[]>(`${this.apiUrl}/activity`);
    }
}
