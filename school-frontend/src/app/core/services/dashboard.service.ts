import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StudentsService } from './students.service';
import { GroupsService } from './groups.service';
import { SubjectsService } from './subjects.service';
import { PeriodsService } from './periods.service';

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

    constructor(
        private http: HttpClient,
        private studentsService: StudentsService,
        private groupsService: GroupsService,
        private subjectsService: SubjectsService,
        private periodsService: PeriodsService
    ) { }

    getStats(): Observable<DashboardStats> {
        // Backend endpoint might be missing, so we calculate stats from other services
        return forkJoin({
            students: this.studentsService.getAll().pipe(catchError(() => of([]))),
            groups: this.groupsService.getAll().pipe(catchError(() => of([]))),
            subjects: this.subjectsService.getAll().pipe(catchError(() => of([]))),
            periods: this.periodsService.getAll().pipe(catchError(() => of([])))
        }).pipe(
            map(data => ({
                totalStudents: data.students.length,
                totalGroups: data.groups.length,
                totalSubjects: data.subjects.length,
                activePeriods: data.periods.filter(p => p.status === 'active').length
            }))
        );
    }

    getRecentActivity(): Observable<RecentActivity[]> {
        // Mock activity for now as there's no centralized activity log yet
        return of([
            { id: 1, description: 'System initialized', date: new Date(), type: 'info' }
        ]);
    }
}
