# REQUERIMIENTOS TÉCNICOS - CORRECCIONES FRONTEND

**Proyecto:** School Management System  
**Fecha:** 16 de febrero de 2026  
**Versión:** 1.0  
**Objetivo:** Acoplar frontend con backend eliminando discrepancias detectadas

---

## 📋 ÍNDICE
1. [Cambios Obligatorios](#1-cambios-obligatorios)
2. [Funcionalidades Faltantes a Implementar](#2-funcionalidades-faltantes-a-implementar)
3. [Refactorización de Nomenclatura](#3-refactorización-de-nomenclatura)
4. [Verificaciones de Endpoints](#4-verificaciones-de-endpoints)
5. [Plan de Implementación](#5-plan-de-implementación)

---

## 1. CAMBIOS OBLIGATORIOS

### 1.1 Renombrar "Assessments" → "Evaluations"

**Problema detectado:**
- Frontend usa término "assessments"
- Backend usa término "evaluations"
- Causa confusión en endpoints y comunicación API

#### Archivos a modificar:

##### A) Renombrar modelo
```
ANTES: src/app/core/models/assessment.model.ts
DESPUÉS: src/app/core/models/evaluation.model.ts
```

**Contenido a actualizar:**
```typescript
// Cambiar nombre de interfaz/clase
export interface Assessment { ... }
// Por:
export interface Evaluation { ... }
```

##### B) Renombrar servicio
```
ANTES: src/app/core/services/assessments.service.ts
DESPUÉS: src/app/core/services/evaluations.service.ts
```

**Actualizar:**
- Nombre de clase: `AssessmentsService` → `EvaluationsService`
- Endpoints: `/assessments` → `/evaluations`
- Imports en todos los componentes que lo usen

##### C) Renombrar carpeta de features
```
ANTES: src/app/features/assessments/
DESPUÉS: src/app/features/evaluations/
```

##### D) Actualizar archivo de rutas
```
ANTES: src/app/features/assessments/assessments.routes.ts
DESPUÉS: src/app/features/evaluations/evaluations.routes.ts
```

**Actualizar contenido:**
```typescript
// ANTES:
export const ASSESSMENTS_ROUTES: Routes = [
  { path: 'attendance', component: AttendanceComponent },
  { path: 'grading', component: GradingComponent }
];

// DESPUÉS:
export const EVALUATIONS_ROUTES: Routes = [
  { path: 'attendance', component: AttendanceComponent },
  { path: 'grading', component: GradingComponent }
];
```

##### E) Actualizar rutas principales
**Archivo:** `src/app/app.routes.ts`

```typescript
// ANTES:
{ 
  path: 'assessments', 
  loadChildren: () => import('./features/assessments/assessments.routes')
}

// DESPUÉS:
{ 
  path: 'evaluations', 
  loadChildren: () => import('./features/evaluations/evaluations.routes')
}
```

##### F) Actualizar sidebar
**Archivo:** `src/app/layout/sidebar/sidebar.component.ts`

```typescript
navItems = [
  { label: 'Tablero', icon: 'dashboard', route: '/dashboard' },
  { label: 'Académico', icon: 'school', route: '/contexts' },
  { label: 'Estudiantes', icon: 'people', route: '/students' },
  
  // ANTES:
  { label: 'Asistencia', icon: 'event_available', route: '/assessments/attendance' },
  { label: 'Calificaciones', icon: 'grade', route: '/assessments/grading' },
  
  // DESPUÉS:
  { label: 'Asistencia', icon: 'event_available', route: '/evaluations/attendance' },
  { label: 'Calificaciones', icon: 'grade', route: '/evaluations/grading' },
  
  { label: 'Registros', icon: 'description', route: '/records' }
];
```

---

## 2. FUNCIONALIDADES FALTANTES A IMPLEMENTAR

### 2.1 Módulo de Consentimientos (Consents)

**Contexto:**
Backend tiene módulo completo de consentimientos de estudiantes para compartir información. Frontend no tiene implementación.

#### 2.1.1 Crear Modelo
**Archivo nuevo:** `src/app/core/models/consent.model.ts`

```typescript
export interface ConsentType {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentConsent {
  id: number;
  studentId: number;
  consentTypeId: number;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  revokedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones
  student?: any; // Importar Student model
  consentType?: ConsentType;
}
```

#### 2.1.2 Crear Servicio
**Archivo nuevo:** `src/app/core/services/consents.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StudentConsent, ConsentType } from '../models/consent.model';

@Injectable({
  providedIn: 'root'
})
export class ConsentsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/consents`;

  // Consent Types
  getConsentTypes(): Observable<ConsentType[]> {
    return this.http.get<ConsentType[]>(`${this.apiUrl}/types`);
  }

  createConsentType(data: Partial<ConsentType>): Observable<ConsentType> {
    return this.http.post<ConsentType>(`${this.apiUrl}/types`, data);
  }

  updateConsentType(id: number, data: Partial<ConsentType>): Observable<ConsentType> {
    return this.http.patch<ConsentType>(`${this.apiUrl}/types/${id}`, data);
  }

  deleteConsentType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/types/${id}`);
  }

  // Student Consents
  getStudentConsents(studentId: number): Observable<StudentConsent[]> {
    return this.http.get<StudentConsent[]>(`${this.apiUrl}/student/${studentId}`);
  }

  createConsent(data: Partial<StudentConsent>): Observable<StudentConsent> {
    return this.http.post<StudentConsent>(this.apiUrl, data);
  }

  revokeConsent(id: number, revokedBy: string, notes?: string): Observable<StudentConsent> {
    return this.http.patch<StudentConsent>(`${this.apiUrl}/${id}/revoke`, {
      revokedBy,
      notes
    });
  }

  deleteConsent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

#### 2.1.3 Crear Componentes

##### A) Lista de Consentimientos
**Estructura de carpetas:**
```
src/app/features/consents/
├── consents.routes.ts
├── consent-types/
│   ├── consent-types.component.ts
│   ├── consent-types.component.html
│   └── consent-types.component.scss
└── student-consents/
    ├── student-consents.component.ts
    ├── student-consents.component.html
    └── student-consents.component.scss
```

**Archivo:** `src/app/features/consents/consents.routes.ts`
```typescript
import { Routes } from '@angular/router';
import { ConsentTypesComponent } from './consent-types/consent-types.component';
import { StudentConsentsComponent } from './student-consents/student-consents.component';

export const CONSENTS_ROUTES: Routes = [
  { path: 'types', component: ConsentTypesComponent },
  { path: 'student/:studentId', component: StudentConsentsComponent },
  { path: '', redirectTo: 'types', pathMatch: 'full' }
];
```

##### B) Componente de Tipos de Consentimiento
**Archivo:** `src/app/features/consents/consent-types/consent-types.component.ts`

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConsentsService } from '../../../core/services/consents.service';
import { ConsentType } from '../../../core/models/consent.model';

@Component({
  selector: 'app-consent-types',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './consent-types.component.html',
  styleUrls: ['./consent-types.component.scss']
})
export class ConsentTypesComponent implements OnInit {
  private consentsService = inject(ConsentsService);
  private dialog = inject(MatDialog);

  consentTypes: ConsentType[] = [];
  displayedColumns: string[] = ['name', 'description', 'isActive', 'actions'];
  isLoading = false;

  ngOnInit(): void {
    this.loadConsentTypes();
  }

  loadConsentTypes(): void {
    this.isLoading = true;
    this.consentsService.getConsentTypes().subscribe({
      next: (types) => {
        this.consentTypes = types;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading consent types:', err);
        this.isLoading = false;
      }
    });
  }

  openCreateDialog(): void {
    // TODO: Implementar dialog de creación
  }

  openEditDialog(consentType: ConsentType): void {
    // TODO: Implementar dialog de edición
  }

  deleteConsentType(id: number): void {
    if (confirm('¿Estás seguro de eliminar este tipo de consentimiento?')) {
      this.consentsService.deleteConsentType(id).subscribe({
        next: () => this.loadConsentTypes(),
        error: (err) => console.error('Error deleting consent type:', err)
      });
    }
  }
}
```

**Archivo:** `src/app/features/consents/consent-types/consent-types.component.html`

```html
<div class="container">
  <div class="header">
    <h1>Tipos de Consentimiento</h1>
    <button mat-raised-button color="primary" (click)="openCreateDialog()">
      <mat-icon>add</mat-icon>
      Nuevo Tipo
    </button>
  </div>

  <table mat-table [dataSource]="consentTypes" class="mat-elevation-z2">
    <!-- Name Column -->
    <ng-container matColumnDef="name">
      <th mat-header-cell *matHeaderCellDef>Nombre</th>
      <td mat-cell *matCellDef="let type">{{ type.name }}</td>
    </ng-container>

    <!-- Description Column -->
    <ng-container matColumnDef="description">
      <th mat-header-cell *matHeaderCellDef>Descripción</th>
      <td mat-cell *matCellDef="let type">{{ type.description }}</td>
    </ng-container>

    <!-- Active Column -->
    <ng-container matColumnDef="isActive">
      <th mat-header-cell *matHeaderCellDef>Activo</th>
      <td mat-cell *matCellDef="let type">
        <mat-icon [color]="type.isActive ? 'primary' : 'warn'">
          {{ type.isActive ? 'check_circle' : 'cancel' }}
        </mat-icon>
      </td>
    </ng-container>

    <!-- Actions Column -->
    <ng-container matColumnDef="actions">
      <th mat-header-cell *matHeaderCellDef>Acciones</th>
      <td mat-cell *matCellDef="let type">
        <button mat-icon-button (click)="openEditDialog(type)">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-icon-button color="warn" (click)="deleteConsentType(type.id)">
          <mat-icon>delete</mat-icon>
        </button>
      </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
  </table>
</div>
```

##### C) Componente de Consentimientos por Estudiante
**Archivo:** `src/app/features/consents/student-consents/student-consents.component.ts`

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ConsentsService } from '../../../core/services/consents.service';
import { StudentConsent } from '../../../core/models/consent.model';

@Component({
  selector: 'app-student-consents',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './student-consents.component.html',
  styleUrls: ['./student-consents.component.scss']
})
export class StudentConsentsComponent implements OnInit {
  private consentsService = inject(ConsentsService);
  private route = inject(ActivatedRoute);

  studentId!: number;
  consents: StudentConsent[] = [];
  displayedColumns: string[] = ['consentType', 'grantedBy', 'grantedAt', 'expiresAt', 'status', 'actions'];
  isLoading = false;

  ngOnInit(): void {
    this.studentId = Number(this.route.snapshot.paramMap.get('studentId'));
    this.loadConsents();
  }

  loadConsents(): void {
    this.isLoading = true;
    this.consentsService.getStudentConsents(this.studentId).subscribe({
      next: (consents) => {
        this.consents = consents;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading consents:', err);
        this.isLoading = false;
      }
    });
  }

  revokeConsent(consent: StudentConsent): void {
    if (confirm('¿Estás seguro de revocar este consentimiento?')) {
      this.consentsService.revokeConsent(consent.id, 'Admin', 'Revocado desde interfaz').subscribe({
        next: () => this.loadConsents(),
        error: (err) => console.error('Error revoking consent:', err)
      });
    }
  }

  deleteConsent(id: number): void {
    if (confirm('¿Estás seguro de eliminar este consentimiento?')) {
      this.consentsService.deleteConsent(id).subscribe({
        next: () => this.loadConsents(),
        error: (err) => console.error('Error deleting consent:', err)
      });
    }
  }
}
```

#### 2.1.4 Agregar a Rutas Principales
**Archivo:** `src/app/app.routes.ts`

```typescript
// Agregar esta ruta:
{
  path: 'consents',
  loadChildren: () => import('./features/consents/consents.routes').then(m => m.CONSENTS_ROUTES),
  canActivate: [authGuard]
}
```

#### 2.1.5 Agregar a Sidebar
**Archivo:** `src/app/layout/sidebar/sidebar.component.ts`

```typescript
navItems = [
  { label: 'Tablero', icon: 'dashboard', route: '/dashboard' },
  { label: 'Académico', icon: 'school', route: '/contexts' },
  { label: 'Estudiantes', icon: 'people', route: '/students' },
  { label: 'Asistencia', icon: 'event_available', route: '/evaluations/attendance' },
  { label: 'Calificaciones', icon: 'grade', route: '/evaluations/grading' },
  { label: 'Registros', icon: 'description', route: '/records' },
  
  // NUEVO:
  { label: 'Consentimientos', icon: 'privacy_tip', route: '/consents' }
];
```

---

### 2.2 Módulo de Asignaciones de Estudiantes (Student Assignments)

**Contexto:**
Backend tiene módulo para asignar estudiantes a grupos con historial. Frontend no tiene implementación.

#### 2.2.1 Crear Modelo
**Archivo nuevo:** `src/app/core/models/student-assignment.model.ts`

```typescript
export interface StudentAssignment {
  id: number;
  studentId: number;
  groupId: number;
  assignedAt: Date;
  unassignedAt?: Date;
  reason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones
  student?: any; // Student model
  group?: any;   // Group model
}

export interface StudentAssignmentHistory {
  id: number;
  assignmentId: number;
  action: 'assigned' | 'unassigned' | 'transferred';
  fromGroupId?: number;
  toGroupId?: number;
  performedBy: string;
  performedAt: Date;
  notes?: string;
  
  // Relaciones
  assignment?: StudentAssignment;
}
```

#### 2.2.2 Crear Servicio
**Archivo nuevo:** `src/app/core/services/student-assignments.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StudentAssignment, StudentAssignmentHistory } from '../models/student-assignment.model';

@Injectable({
  providedIn: 'root'
})
export class StudentAssignmentsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/student-assignments`;

  // Assignments
  getAssignmentsByStudent(studentId: number): Observable<StudentAssignment[]> {
    return this.http.get<StudentAssignment[]>(`${this.apiUrl}/student/${studentId}`);
  }

  getAssignmentsByGroup(groupId: number): Observable<StudentAssignment[]> {
    return this.http.get<StudentAssignment[]>(`${this.apiUrl}/group/${groupId}`);
  }

  assignStudent(data: {
    studentId: number;
    groupId: number;
    notes?: string;
  }): Observable<StudentAssignment> {
    return this.http.post<StudentAssignment>(this.apiUrl, data);
  }

  unassignStudent(assignmentId: number, reason?: string): Observable<StudentAssignment> {
    return this.http.patch<StudentAssignment>(`${this.apiUrl}/${assignmentId}/unassign`, {
      reason
    });
  }

  transferStudent(assignmentId: number, newGroupId: number, notes?: string): Observable<StudentAssignment> {
    return this.http.patch<StudentAssignment>(`${this.apiUrl}/${assignmentId}/transfer`, {
      newGroupId,
      notes
    });
  }

  getAssignmentHistory(assignmentId: number): Observable<StudentAssignmentHistory[]> {
    return this.http.get<StudentAssignmentHistory[]>(`${this.apiUrl}/${assignmentId}/history`);
  }

  deleteAssignment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

#### 2.2.3 Integrar en Componente de Grupos Existente
**Archivo:** `src/app/features/academic/groups/group-form/group-form.component.ts`

**Agregar sección para asignar estudiantes al crear/editar grupo:**

```typescript
// En el componente existente, agregar:
import { StudentAssignmentsService } from '../../../../core/services/student-assignments.service';

// En la clase:
private assignmentsService = inject(StudentAssignmentsService);
selectedStudents: number[] = [];

assignStudentsToGroup(groupId: number): void {
  this.selectedStudents.forEach(studentId => {
    this.assignmentsService.assignStudent({
      studentId,
      groupId,
      notes: 'Asignado al crear/editar grupo'
    }).subscribe({
      next: () => console.log(`Estudiante ${studentId} asignado`),
      error: (err) => console.error('Error asignando estudiante:', err)
    });
  });
}
```

#### 2.2.4 Crear Vista de Asignaciones en Estudiante
**Archivo:** `src/app/features/students/student-form/student-form.component.ts`

**Agregar tab de asignaciones:**

```typescript
// Importar servicio
import { StudentAssignmentsService } from '../../../core/services/student-assignments.service';

// En la clase:
private assignmentsService = inject(StudentAssignmentsService);
studentAssignments: StudentAssignment[] = [];

loadAssignments(): void {
  if (this.studentId) {
    this.assignmentsService.getAssignmentsByStudent(this.studentId).subscribe({
      next: (assignments) => {
        this.studentAssignments = assignments;
      },
      error: (err) => console.error('Error loading assignments:', err)
    });
  }
}
```

---

## 3. REFACTORIZACIÓN DE NOMENCLATURA

### 3.1 Buscar y Reemplazar Global

**Herramienta:** VS Code Search & Replace (Ctrl+Shift+H)

#### Reemplazos necesarios:

1. **En archivos TypeScript (.ts):**
```
Buscar: AssessmentsService
Reemplazar por: EvaluationsService

Buscar: assessment
Reemplazar por: evaluation
(Verificar contexto - solo en referencias a evaluaciones)

Buscar: /assessments
Reemplazar por: /evaluations
```

2. **En archivos HTML (.html):**
```
Buscar: assessments
Reemplazar por: evaluations
```

3. **En archivos de rutas:**
```
Buscar: ASSESSMENTS_ROUTES
Reemplazar por: EVALUATIONS_ROUTES
```

### 3.2 Actualizar Imports

**Verificar que todos los imports se actualicen:**

```typescript
// ANTES:
import { AssessmentsService } from '../services/assessments.service';

// DESPUÉS:
import { EvaluationsService } from '../services/evaluations.service';
```

---

## 4. VERIFICACIONES DE ENDPOINTS

### 4.1 Tabla de Endpoints Backend vs Frontend

| Funcionalidad | Endpoint Backend | Servicio Frontend | Estado |
|---------------|------------------|-------------------|--------|
| Auth | `/auth` | `auth.service.ts` | ✅ OK |
| Users | `/users` | N/A | ✅ OK (backend only) |
| Contexts | `/contexts` | `contexts.service.ts` | ✅ OK |
| Periods | `/academic-periods` | `periods.service.ts` | ⚠️ Verificar |
| Groups | `/groups` | `groups.service.ts` | ✅ OK |
| Subjects | `/subjects` | `subjects.service.ts` | ✅ OK |
| Students | `/students` | `students.service.ts` | ✅ OK |
| Attendance | `/attendance` | `attendance.service.ts` | ✅ OK |
| Grades | `/grades` | N/A en servicio propio | ⚠️ Verificar |
| Evaluations | `/evaluations` | ❌ `assessments.service.ts` | 🔴 **CAMBIAR** |
| Student Records | `/student-records` | `records.service.ts` | ⚠️ Verificar |
| Files | `/files` | N/A | ⚠️ Crear servicio |
| Consents | `/consents` | ❌ No existe | 🔴 **CREAR** |
| Assignments | `/student-assignments` | ❌ No existe | 🔴 **CREAR** |
| Dashboard | `/dashboard` | `dashboard.service.ts` | ✅ OK |

### 4.2 Verificar Servicio de Períodos
**Archivo:** `src/app/core/services/periods.service.ts`

**Verificar que use el endpoint correcto:**
```typescript
private apiUrl = `${environment.apiUrl}/academic-periods`; // ✅ Correcto
// NO usar: /periods
```

### 4.3 Verificar Servicio de Records
**Archivo:** `src/app/core/services/records.service.ts`

**Verificar endpoint:**
```typescript
private apiUrl = `${environment.apiUrl}/student-records`; // ✅ Correcto
// NO usar: /records
```

### 4.4 Crear Servicio de Files (si no existe)

**Si falta, crear:** `src/app/core/services/files.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SchoolFile {
  id: number;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  uploadedBy: number;
  category?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/files`;

  uploadFile(file: File, category?: string): Observable<SchoolFile> {
    const formData = new FormData();
    formData.append('file', file);
    if (category) formData.append('category', category);
    
    return this.http.post<SchoolFile>(this.apiUrl, formData);
  }

  getFiles(category?: string): Observable<SchoolFile[]> {
    const url = category ? `${this.apiUrl}?category=${category}` : this.apiUrl;
    return this.http.get<SchoolFile[]>(url);
  }

  getFile(id: number): Observable<SchoolFile> {
    return this.http.get<SchoolFile>(`${this.apiUrl}/${id}`);
  }

  downloadFile(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  deleteFile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

---

## 5. PLAN DE IMPLEMENTACIÓN

### Fase 1: Correcciones Críticas (1-2 días)
**Prioridad:** 🔴 ALTA

1. ✅ Renombrar "assessments" → "evaluations"
   - Modelos
   - Servicios
   - Componentes
   - Rutas
   - Sidebar

2. ✅ Verificar todos los endpoints
   - Corregir discrepancias
   - Validar con Postman/API testing

### Fase 2: Funcionalidades Faltantes (3-5 días)
**Prioridad:** 🟡 MEDIA

1. ✅ Implementar módulo de Consentimientos
   - Modelo
   - Servicio
   - Componentes (tipos + estudiante)
   - Integración en rutas

2. ✅ Implementar módulo de Asignaciones
   - Modelo
   - Servicio
   - Integración en grupos existentes
   - Vista en detalle de estudiante

3. ✅ Crear/Verificar servicio de Files
   - Implementar si falta
   - Integrar en file-management component

### Fase 3: Testing y Validación (1-2 días)
**Prioridad:** 🟢 NORMAL

1. ✅ Testing de integración
   - Probar cada endpoint con backend real
   - Verificar flujos completos

2. ✅ Validación de UI/UX
   - Verificar navegación
   - Comprobar mensajes de error
   - Validar formularios

3. ✅ Documentación
   - Actualizar README
   - Documentar nuevas funcionalidades

---

## 6. CHECKLIST DE VERIFICACIÓN

### Pre-implementación
- [ ] Backup del código actual
- [ ] Crear rama de desarrollo: `feature/frontend-corrections`
- [ ] Configurar ambiente de pruebas con backend

### Durante implementación
- [ ] Renombrar assessments → evaluations
- [ ] Actualizar todos los imports
- [ ] Verificar compilación sin errores
- [ ] Crear modelo de consents
- [ ] Crear servicio de consents
- [ ] Crear componentes de consents
- [ ] Crear modelo de student-assignments
- [ ] Crear servicio de student-assignments
- [ ] Integrar assignments en grupos/estudiantes
- [ ] Verificar/crear servicio de files
- [ ] Actualizar sidebar con nuevas opciones
- [ ] Actualizar app.routes.ts

### Post-implementación
- [ ] Pruebas de endpoints con backend
- [ ] Pruebas de navegación frontend
- [ ] Revisión de consola (sin errores)
- [ ] Validación de formularios
- [ ] Testing de casos extremos
- [ ] Merge a develop/main
- [ ] Deploy a staging

---

## 7. NOTAS ADICIONALES

### 7.1 Consideraciones de Seguridad
- Validar permisos antes de revocar consentimientos
- Implementar confirmación doble para eliminaciones
- Registrar todas las acciones de asignación/des-asignación

### 7.2 Performance
- Implementar paginación en listas largas
- Considerar lazy loading para módulos grandes
- Cachear tipos de consentimiento (no cambian frecuentemente)

### 7.3 UX/UI
- Agregar tooltips explicativos en consentimientos
- Mostrar historial visual en asignaciones
- Implementar breadcrumbs para navegación
- Agregar filtros en tablas

---

## 8. CONTACTO Y SOPORTE

**Desarrollador responsable:** [TU NOMBRE]  
**Fecha límite:** [DEFINIR]  
**Revisión de código:** [DEFINIR REVISOR]

---

**Versión del documento:** 1.0  
**Última actualización:** 16 de febrero de 2026
