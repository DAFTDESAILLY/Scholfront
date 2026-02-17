import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Student } from '../models/student.model';
import { StudentAssignment } from '../models/student-assignment.model';

@Injectable({
    providedIn: 'root'
})
export class StudentsService {
    private apiUrl = `${environment.apiUrl}/students`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Student[]> {
        return this.http.get<Student[]>(this.apiUrl);
    }

    getById(id: number): Observable<Student> {
        return this.http.get<Student>(`${this.apiUrl}/${id}`);
    }

    create(data: any): Observable<Student> {
        return this.http.post<Student>(this.apiUrl, data);
    }

    update(id: number, data: any): Observable<Student> {
        return this.http.patch<Student>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getStudentsByGroup(groupId: number): Observable<any[]> {
        console.log(`🔍 Buscando estudiantes para el grupo ID: ${groupId}`);
        
        // Obtenemos alumnos y asignaciones por separado y cruzamos datos
        const students$ = this.http.get<Student[]>(this.apiUrl);
        const assignments$ = this.http.get<StudentAssignment[]>(`${environment.apiUrl}/student-assignments`);

        return forkJoin([students$, assignments$]).pipe(
            map(([students, assignments]) => {
                console.log(`📊 Datos recibidos: ${students.length} estudiantes, ${assignments.length} asignaciones`);
                
                // Filtrar asignaciones del grupo
                const groupAssignments = assignments.filter(a => {
                    // Log para depurar por qué no hace match
                    // console.log(`Checking assignment ${a.id}: Group ${a.groupId} vs ${groupId}`);
                    return Number(a.groupId) === Number(groupId) && a.status === 'active';
                });
                
                console.log(`🎯 Asignaciones encontradas para el grupo ${groupId}: ${groupAssignments.length}`);
                
                if (groupAssignments.length === 0) {
                     // Intento de fallback: si no hay asignaciones, de todas formas devolver estudiantes 
                     // si el modo de depuración está activo o para pruebas.
                     // O tal vez el groupId no coincide.
                     console.warn('⚠️ No se encontraron asignaciones para este grupo.');
                }

                // Mapear a estudiantes con datos de asignación
                const result = groupAssignments.map(assignment => {
                    const student = students.find(s => Number(s.id) === Number(assignment.studentId));
                    if (!student) {
                        console.warn(`⚠️ Asignación ${assignment.id} apunta a estudiante ${assignment.studentId} que no existe en la lista de estudiantes.`);
                        return null;
                    }
                    
                    return {
                        ...student,
                        studentAssignmentId: assignment.id, // ID crítico para guardar notas
                        assignmentId: assignment.id,
                        groupId: assignment.groupId
                    };
                }).filter(s => s !== null);
                
                console.log(`✅ Estudiantes finales mapeados: ${result.length}`);
                return result;
            })
        );
    }

    search(query: string): Observable<Student[]> {
        return this.http.get<Student[]>(`${this.apiUrl}/search?q=${query}`);
    }
}
