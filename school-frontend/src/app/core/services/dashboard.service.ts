import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StudentsService } from './students.service';
import { GroupsService } from './groups.service';
import { SubjectsService } from './subjects.service';
import { PeriodsService } from './periods.service';
import { StudentAssignmentsService } from './student-assignments.service';
import { AuthService } from './auth.service';

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
        private periodsService: PeriodsService,
        private studentAssignmentsService: StudentAssignmentsService,
        private authService: AuthService
    ) { }

    getStats(): Observable<DashboardStats> {
        // Obtener el usuario actual
        const currentUser = this.authService.getCurrentUser();

        console.log('🔍 Usuario actual para dashboard:', currentUser);

        if (!currentUser) {
            console.warn('⚠️ No hay usuario logueado, mostrando stats vacíos');
            return of({
                totalStudents: 0,
                totalGroups: 0,
                totalSubjects: 0,
                activePeriods: 0
            });
        }

        // Obtener todos los datos necesarios
        return forkJoin({
            subjects: this.subjectsService.getAll().pipe(catchError(() => of([]))),
            groups: this.groupsService.getAll().pipe(catchError(() => of([]))),
            assignments: this.studentAssignmentsService.findAll().pipe(catchError(() => of([]))),
            periods: this.periodsService.getAll().pipe(catchError(() => of([]))),
            students: this.studentsService.getAll().pipe(catchError(() => of([])))
        }).pipe(
            map(data => {
                console.log('📊 Datos crudos recibidos:', {
                    subjects: data.subjects.length,
                    groups: data.groups.length,
                    assignments: data.assignments.length,
                    periods: data.periods.length
                });

                // Check for admin role
                const isAdmin = currentUser.role === 'admin' || currentUser.email === 'admin@mail.com'; // Fallback check

                if (isAdmin) {
                    console.log('👑 Usuario es ADMINISTRADOR - Mostrando estadísticas globales');

                    // Filter active periods
                    const activePeriods = data.periods.filter(p => p.status === 'active').length;

                    // Count unique students across all assignments (or fetch all students if available/needed)
                    // For now using assignments as proxy for active students in groups
                    const uniqueStudentIds = [...new Set(data.assignments.map(a => a.studentId))];

                    return {
                        totalStudents: data.students.length, // Use actual total students from DB
                        totalGroups: data.groups.length,
                        totalSubjects: data.subjects.length,
                        activePeriods: activePeriods
                    };
                }

                // TEACHER LOGIC (Default)
                console.log('👨‍🏫 Usuario es PROFESOR - Filtrando por asignación');

                // 1. Filtrar materias del profesor actual
                const mySubjects = data.subjects.filter(s => {
                    const matches = s.teacherId === currentUser.id ||
                        s.teacherId === Number(currentUser.id) ||
                        String(s.teacherId) === String(currentUser.id);
                    return matches;
                });

                console.log(`👨‍🏫 Materias del profesor (teacherId=${currentUser.id}):`, mySubjects.length);

                // 2. Obtener IDs únicos de grupos de esas materias
                const myGroupIds = [...new Set(mySubjects.map(s => s.groupId))];
                console.log('🏫 IDs de grupos del profesor:', myGroupIds);

                // 3. Filtrar grupos del profesor
                const myGroups = data.groups.filter(g => myGroupIds.includes(g.id));
                console.log(`📚 Grupos filtrados:`, myGroups.length);

                // 4. Filtrar estudiantes asignados a esos grupos (via student-assignments)
                const myStudentAssignments = data.assignments.filter(a =>
                    myGroupIds.includes(a.groupId) && a.status === 'active'
                );

                // Obtener IDs únicos de estudiantes
                const uniqueStudentIds = [...new Set(myStudentAssignments.map(a => a.studentId))];
                console.log(`👥 Estudiantes únicos en grupos del profesor:`, uniqueStudentIds.length);

                // 5. Períodos activos (estos son globales generalmente)
                const activePeriods = data.periods.filter(p => p.status === 'active').length;

                const stats = {
                    totalStudents: uniqueStudentIds.length,
                    totalGroups: myGroups.length,
                    totalSubjects: mySubjects.length,
                    activePeriods: activePeriods
                };

                console.log('✅ Estadísticas calculadas para el usuario:', stats);

                return stats;
            })
        );
    }

    getRecentActivity(): Observable<RecentActivity[]> {
        // Mock activity for now as there's no centralized activity log yet
        return of([
            { id: 1, description: 'System initialized', date: new Date(), type: 'info' }
        ]);
    }
}
