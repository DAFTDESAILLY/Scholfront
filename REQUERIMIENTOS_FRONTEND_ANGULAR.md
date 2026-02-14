# 📱 REQUERIMIENTOS FRONTEND ANGULAR
## Sistema de Gestión Escolar - V1

---

## 0. ESTADO DEL DOCUMENTO

**VERSIÓN:** 1.0  
**FECHA:** Febrero 2026  
**BASE:** Backend NestJS + TypeORM (V1 CONGELADO)

---

## 1. STACK TÉCNICO

### 1.1 Core
- **Framework:** Angular 17+ (Standalone Components)
- **Lenguaje:** TypeScript 5.x
- **Estado:** NgRx 17+ o Signals (decidir según complejidad)
- **Routing:** Angular Router con lazy loading
- **HTTP:** HttpClient con interceptores

### 1.2 UI/UX
- **Librería UI:** Angular Material 17+ (principal)
- **Iconos:** Material Icons
- **Formularios:** Reactive Forms
- **Validación:** Angular Validators + custom validators
- **Notificaciones:** Angular Material Snackbar
- **Tablas:** Material Table con paginación, sorting, filtros

### 1.3 Herramientas
- **Build:** Angular CLI
- **Linting:** ESLint + Prettier
- **Testing:** Jasmine + Karma (unitarios) / Cypress (E2E)
- **State Management:** NgRx Store + Effects (recomendado para este alcance)
- **Formularios dinámicos:** Template-driven NO, solo Reactive Forms

---

## 2. ARQUITECTURA

### 2.1 Estructura de carpetas

```
src/
├── app/
│   ├── core/                      # Servicios singleton, guards, interceptors
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── period-active.guard.ts
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── error.interceptor.ts
│   │   │   └── loading.interceptor.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── storage.service.ts
│   │   │   └── notification.service.ts
│   │   └── models/
│   │       ├── user.model.ts
│   │       ├── api-response.model.ts
│   │       └── index.ts
│   │
│   ├── shared/                    # Componentes/pipes/directivas reutilizables
│   │   ├── components/
│   │   │   ├── confirmation-dialog/
│   │   │   ├── loading-spinner/
│   │   │   ├── empty-state/
│   │   │   └── status-badge/
│   │   ├── pipes/
│   │   │   ├── date-format.pipe.ts
│   │   │   └── status-label.pipe.ts
│   │   └── directives/
│   │       └── autofocus.directive.ts
│   │
│   ├── features/                  # Módulos funcionales (lazy loaded)
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── auth-routing.module.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboard.component.ts
│   │   │   └── dashboard-routing.module.ts
│   │   │
│   │   ├── academic/
│   │   │   ├── contexts/
│   │   │   ├── periods/
│   │   │   ├── groups/
│   │   │   └── subjects/
│   │   │
│   │   ├── students/
│   │   │   ├── student-list/
│   │   │   ├── student-form/
│   │   │   ├── student-detail/
│   │   │   └── students-routing.module.ts
│   │   │
│   │   ├── assignments/
│   │   │   └── ...
│   │   │
│   │   ├── assessments/
│   │   │   ├── attendance/
│   │   │   ├── evaluations/
│   │   │   └── grades/
│   │   │
│   │   ├── records/
│   │   │   └── student-records/
│   │   │
│   │   ├── files/
│   │   │   └── ...
│   │   │
│   │   └── consents/
│   │       └── ...
│   │
│   ├── layout/                    # Componentes de layout
│   │   ├── navbar/
│   │   ├── sidebar/
│   │   └── footer/
│   │
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── styles/
│       ├── _variables.scss
│       ├── _mixins.scss
│       └── _material-theme.scss
│
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

### 2.2 Estrategia de módulos

**Lazy Loading obligatorio para:**
- Todas las features (academic, students, assessments, records, files)
- No cargar nada que no se use inmediatamente

**Eager Loading solo para:**
- Core module
- Shared module
- Layout

---

## 3. AUTENTICACIÓN Y SEGURIDAD

### 3.1 Flujo de autenticación

**Endpoints backend:**
- `POST /auth/register`
- `POST /auth/login` → retorna `{ access_token, refresh_token }`
- `POST /auth/refresh` → retorna nuevo `access_token`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

**Implementación frontend:**

```typescript
// auth.service.ts
login(email: string, password: string): Observable<AuthResponse>
logout(): void
refreshToken(): Observable<string>
isAuthenticated(): boolean
```

### 3.2 Almacenamiento de tokens

- **Access Token:** `localStorage` o `sessionStorage` (decidir según UX)
- **Refresh Token:** Secure httpOnly cookie (manejado por backend) o `localStorage` cifrado

**Interceptor:**
- Agregar `Authorization: Bearer {token}` en cada request
- Si response 401 → intentar refresh
- Si refresh falla → logout + redirect a `/login`

### 3.3 Guards

**AuthGuard:**
```typescript
canActivate(): boolean {
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
}
```

**PeriodActiveGuard:**
- Validar que el periodo actual NO esté archivado
- Bloquear edición si el periodo está archivado
- Mostrar banner informativo si solo lectura

---

## 4. GESTIÓN DE ESTADO

### 4.1 NgRx Store (recomendado)

**Store principal:**

```typescript
AppState {
  auth: AuthState,
  contexts: ContextsState,
  periods: PeriodsState,
  groups: GroupsState,
  students: StudentsState,
  assignments: AssignmentsState,
  attendance: AttendanceState,
  grades: GradesState,
  records: RecordsState,
  ui: UIState
}
```

**UIState para:**
- Loading global
- Errores globales
- Sidebar collapsed/expanded
- Tema dark/light (opcional V2)

### 4.2 Effects

- Cada módulo feature tiene sus propios effects
- Manejo de side effects (HTTP calls)
- Notificaciones de éxito/error

### 4.3 Selectors

- Memoización de datos derivados
- Ejemplo: `selectActiveStudentsInGroup(groupId)`

---

## 5. MODELOS E INTERFACES

### 5.1 Interfaces principales

```typescript
// user.model.ts
export interface User {
  id: number;
  email: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// context.model.ts
export interface Context {
  id: number;
  userId: number;
  name: string;
  level: string;
  institution?: string;
  status: 'active' | 'archived' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// academic-period.model.ts
export interface AcademicPeriod {
  id: number;
  contextId: number;
  type: 'trimestre' | 'cuatrimestre' | 'semestre' | 'anual';
  startDate: Date;
  endDate: Date;
  gracePeriodDays: number;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

// group.model.ts
export interface Group {
  id: number;
  academicPeriodId: number;
  name: string;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

// subject.model.ts
export interface Subject {
  id: number;
  groupId: number;
  name: string;
  isGeneral: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// student.model.ts
export interface Student {
  id: number;
  fullName: string;
  birthDate?: Date;
  parentPhone?: string;
  notes?: string;
  status: 'active' | 'archived' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// student-assignment.model.ts
export interface StudentAssignment {
  id: number;
  studentId: number;
  groupId: number;
  status: string;
  assignedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// attendance.model.ts
export interface Attendance {
  id: number;
  studentAssignmentId: number;
  subjectId: number;
  date: Date;
  status: 'present' | 'absent' | 'late';
  createdAt: Date;
  updatedAt: Date;
}

// evaluation-item.model.ts
export interface EvaluationItem {
  id: number;
  subjectId: number;
  academicPeriodId: number;
  name: string;
  weight: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

// grade.model.ts
export interface Grade {
  id: number;
  evaluationItemId: number;
  studentAssignmentId: number;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

// student-record.model.ts
export interface StudentRecord {
  id: number;
  studentId: number;
  contextId: number;
  academicPeriodId?: number;
  type: 'conducta' | 'tutoría' | 'médico' | 'cognitivo';
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// file.model.ts
export interface FileEntity {
  id: number;
  userId: number;
  studentId?: number;
  academicPeriodId?: number;
  fileName: string;
  storageKey: string;
  fileType: string;
  fileCategory: 'evidence' | 'material' | 'planning';
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2 DTOs

```typescript
// create-student.dto.ts
export interface CreateStudentDto {
  fullName: string;
  birthDate?: string; // ISO string
  parentPhone?: string;
  notes?: string;
}

// update-student.dto.ts
export interface UpdateStudentDto extends Partial<CreateStudentDto> {}
```

**Replicar para todas las entidades.**

---

## 6. SERVICIOS HTTP

### 6.1 Estructura base

```typescript
// students.service.ts
@Injectable({ providedIn: 'root' })
export class StudentsService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);
  }

  getById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateStudentDto): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateStudentDto): Observable<Student> {
    return this.http.patch<Student>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### 6.2 Servicios necesarios

**Core:**
- `AuthService`
- `NotificationService`
- `LoadingService`

**Academic:**
- `ContextsService`
- `PeriodsService`
- `GroupsService`
- `SubjectsService`

**Students:**
- `StudentsService`
- `AssignmentsService`

**Assessments:**
- `AttendanceService`
- `EvaluationsService`
- `GradesService`

**Records:**
- `StudentRecordsService`

**Files:**
- `FilesService`

**Dashboard:**
- `DashboardService`

---

## 7. COMPONENTES PRINCIPALES

### 7.1 Dashboard

**Componentes:**
- `DashboardComponent` (container)
- `SummaryCardsComponent` (presentational)
- `RecentActivityComponent` (presentational)
- `AlertsComponent` (presentational)

**Funcionalidad:**
- Resumen de estudiantes activos
- Asistencias del día
- Calificaciones pendientes
- Alertas de periodos próximos a vencer

**Endpoint backend:**
- `GET /dashboard/summary`
- `GET /dashboard/recent-activity`
- `GET /dashboard/alerts`

---

### 7.2 Contextos Académicos

**Componentes:**
- `ContextListComponent`
- `ContextFormComponent` (create/edit)
- `ContextDetailComponent`

**Funcionalidad:**
- CRUD completo
- Cambio de contexto activo (almacenar en localStorage)
- Validación de nombre único por usuario

**Campos del formulario:**
- name: required, minLength(3)
- level: required, select
- institution: optional
- status: default 'active'

---

### 7.3 Periodos Académicos

**Componentes:**
- `PeriodListComponent`
- `PeriodFormComponent`
- `PeriodDetailComponent`

**Funcionalidad:**
- CRUD con validaciones
- **Validación crítica:** solo 1 periodo activo por contexto
- **Validación de fechas:** no solapamiento
- Archivado automático (backend cron, solo mostrar estado)
- Indicador visual de periodo activo

**Validaciones formulario:**
- type: required
- startDate: required, date, < endDate
- endDate: required, date, > startDate
- gracePeriodDays: number, min(0), max(30)
- Validación backend: no solapamiento

---

### 7.4 Grupos

**Componentes:**
- `GroupListComponent`
- `GroupFormComponent`
- `GroupDetailComponent`

**Funcionalidad:**
- CRUD
- Al crear grupo → backend crea materia "General" automáticamente
- Restricción: nombre único por periodo (validar en backend)
- Vista de estudiantes asignados al grupo
- Botón "Gestionar asignaciones"

**Campos formulario:**
- name: required, minLength(2)
- academicPeriodId: required (solo periodos activos)

---

### 7.5 Materias

**Componentes:**
- `SubjectListComponent`
- `SubjectFormComponent`

**Funcionalidad:**
- CRUD
- Materia "General" NO se puede eliminar
- Mostrar badge si `isGeneral: true`
- Listar por grupo

**Campos formulario:**
- name: required
- groupId: required

---

### 7.6 Estudiantes

**Componentes:**
- `StudentListComponent` (tabla con búsqueda, filtros, paginación)
- `StudentFormComponent` (create/edit)
- `StudentDetailComponent` (tabs: info, asignaciones, historial, registros)

**Funcionalidad lista:**
- Búsqueda por nombre (fuzzy matching visual para prevenir duplicados)
- Filtro por estado (active/archived/inactive)
- Paginación (Material Table)
- Acciones: Ver, Editar, Archivar

**Fuzzy matching:**
- Usar librería `fuse.js` o `string-similarity`
- Al escribir nombre, sugerir coincidencias existentes
- Warning si similitud > 80%

**Campos formulario:**
- fullName: required, minLength(3)
- birthDate: optional, date
- parentPhone: optional, pattern(phone)
- notes: optional, textarea

**Vista detalle (tabs):**
- **Info:** datos personales
- **Asignaciones:** grupos actuales e históricos
- **Registros:** bitácora (conducta, tutoría, médico, cognitivo)
- **Archivos:** evidencias, documentos

---

### 7.7 Asignaciones de Estudiantes

**Componentes:**
- `AssignmentManagerComponent` (modal desde grupo o estudiante)
- `AssignmentListComponent`
- `AssignmentHistoryComponent`

**Funcionalidad:**
- Asignar estudiante a grupo (validar: solo 1 asignación activa por grupo)
- Desasignar (cambiar status, NO eliminar)
- Reactivar asignación archivada
- Mostrar historial de asignaciones

**Validación crítica:**
- Un alumno solo puede estar activo una vez en el mismo grupo
- Validar en frontend y backend

---

### 7.8 Asistencia

**Componentes:**
- `AttendanceBoardComponent` (tabla estudiantes x materia)
- `AttendanceFormComponent` (rápida toma de asistencia)
- `AttendanceReportComponent` (resumen por estudiante/materia)

**Funcionalidad:**
- Toma rápida de asistencia por materia
- Vista calendario mensual
- Estados: present, absent, late
- Filtros: fecha, grupo, materia
- Exportar a Excel

**UX recomendada:**
- Grid con checkboxes (presente por defecto)
- Un click = cambio de estado (presente → ausente → tarde → presente)
- Guardado automático al cambiar

---

### 7.9 Evaluaciones y Calificaciones

**Componentes:**
- `EvaluationListComponent`
- `EvaluationFormComponent`
- `GradesBoardComponent` (matriz: estudiantes x evaluaciones)
- `GradesReportComponent`

**Funcionalidad evaluaciones:**
- CRUD de evaluation_items
- Validación: peso 0-100
- Warning UI si suma de pesos ≠ 100 (no bloquear, solo advertir)

**Funcionalidad calificaciones:**
- Captura rápida tipo hoja de cálculo
- Una calificación por alumno por evaluación (UNIQUE en backend)
- Cálculo de promedio ponderado
- Exportar boletas

**Validaciones:**
- weight: required, min(0), max(100)
- score: required, number

---

### 7.10 Registros Estudiantiles

**Componentes:**
- `RecordListComponent`
- `RecordFormComponent`
- `RecordDetailComponent` (con réplica)

**Funcionalidad:**
- CRUD de registros
- Tipos: conducta, tutoría, médico, cognitivo
- Asociar a estudiante, contexto, periodo (opcional)
- Derecho de réplica (StudentRecordReply)
- Solo visible para el docente propietario (salvo consentimientos)

**Campos formulario:**
- type: required, select
- description: required, textarea
- studentId: required
- contextId: auto (contexto activo)
- academicPeriodId: optional

**Réplica:**
- Botón "Agregar réplica" si no existe
- Mostrar réplica existente
- Solo 1 réplica por registro

---

### 7.11 Archivos

**Componentes:**
- `FileUploadComponent`
- `FileListComponent`
- `FileGalleryComponent` (para evidencias de estudiante)

**Funcionalidad:**
- Upload de archivos (multer backend, local storage V1)
- Categorías: evidence, material, planning
- Vincular a estudiante (evidencias) o periodo (materiales)
- Vista previa (imágenes, PDFs)
- Descarga

**Validaciones:**
- Tamaño máximo: 10MB (configurar en backend y frontend)
- Tipos permitidos: jpg, png, pdf, docx, xlsx

**UI:**
- Drag & drop
- Progress bar
- Preview de imágenes

---

### 7.12 Consentimientos de Compartición

**Componentes:**
- `ConsentListComponent`
- `ConsentFormComponent`

**Funcionalidad:**
- Compartir registros de estudiante con otro docente
- Seleccionar tipos de registro a compartir
- Fecha de expiración opcional
- Revocar consentimiento
- **Nunca compartir:** calificaciones, asistencia

**Validación:**
- `to_user_id` diferente de `from_user_id`
- Al menos 1 tipo de registro seleccionado

---

## 8. FORMULARIOS REACTIVOS

### 8.1 Estrategia general

**Todos los formularios:**
- Reactive Forms (FormBuilder)
- Validaciones síncronas y asíncronas
- Mensajes de error personalizados
- Disabled state cuando periodo archivado

### 8.2 Validadores personalizados

```typescript
// Validador de fechas no solapadas
export function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;
  
  if (startDate && endDate && startDate >= endDate) {
    return { invalidDateRange: true };
  }
  return null;
}

// Validador asíncrono para nombre único
export function uniqueNameValidator(service: ContextsService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return service.checkNameExists(control.value).pipe(
      map(exists => exists ? { nameExists: true } : null)
    );
  };
}
```

### 8.3 Manejo de errores

```typescript
// form-errors.component.ts
getErrorMessage(fieldName: string): string {
  const control = this.form.get(fieldName);
  
  if (control?.hasError('required')) return 'Campo requerido';
  if (control?.hasError('email')) return 'Email inválido';
  if (control?.hasError('minlength')) {
    return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
  }
  // ... más errores
  
  return '';
}
```

---

## 9. ROUTING

### 9.1 Estructura de rutas

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Auth (sin guards)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // Rutas protegidas
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  
  {
    path: 'contexts',
    loadChildren: () => import('./features/academic/contexts/contexts.routes').then(m => m.CONTEXTS_ROUTES),
    canActivate: [AuthGuard]
  },
  
  {
    path: 'periods',
    loadChildren: () => import('./features/academic/periods/periods.routes').then(m => m.PERIODS_ROUTES),
    canActivate: [AuthGuard]
  },
  
  {
    path: 'groups',
    loadChildren: () => import('./features/academic/groups/groups.routes').then(m => m.GROUPS_ROUTES),
    canActivate: [AuthGuard, PeriodActiveGuard]
  },
  
  {
    path: 'students',
    loadChildren: () => import('./features/students/students.routes').then(m => m.STUDENTS_ROUTES),
    canActivate: [AuthGuard]
  },
  
  {
    path: 'attendance',
    loadChildren: () => import('./features/assessments/attendance/attendance.routes').then(m => m.ATTENDANCE_ROUTES),
    canActivate: [AuthGuard, PeriodActiveGuard]
  },
  
  {
    path: 'grades',
    loadChildren: () => import('./features/assessments/grades/grades.routes').then(m => m.GRADES_ROUTES),
    canActivate: [AuthGuard, PeriodActiveGuard]
  },
  
  {
    path: 'records',
    loadChildren: () => import('./features/records/records.routes').then(m => m.RECORDS_ROUTES),
    canActivate: [AuthGuard]
  },
  
  {
    path: 'files',
    loadChildren: () => import('./features/files/files.routes').then(m => m.FILES_ROUTES),
    canActivate: [AuthGuard]
  },
  
  { path: '**', redirectTo: '/dashboard' }
];
```

### 9.2 Sub-rutas ejemplo

```typescript
// students.routes.ts
export const STUDENTS_ROUTES: Routes = [
  { path: '', component: StudentListComponent },
  { path: 'new', component: StudentFormComponent },
  { path: ':id', component: StudentDetailComponent },
  { path: ':id/edit', component: StudentFormComponent }
];
```

---

## 10. MANEJO DE ERRORES

### 10.1 Interceptor global

```typescript
// error.interceptor.ts
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  return next.handle(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';
      
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del backend
        errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
      }
      
      this.notificationService.error(errorMessage);
      return throwError(() => error);
    })
  );
}
```

### 10.2 Manejo en componentes

```typescript
// Evitar suscripciones manuales, usar async pipe
students$ = this.store.select(selectStudents).pipe(
  catchError(err => {
    this.notificationService.error('Error al cargar estudiantes');
    return of([]);
  })
);
```

---

## 11. PAGINACIÓN Y FILTROS

### 11.1 Material Table

```typescript
// student-list.component.ts
dataSource: MatTableDataSource<Student>;
@ViewChild(MatPaginator) paginator!: MatPaginator;
@ViewChild(MatSort) sort!: MatSort;

ngOnInit() {
  this.studentsService.getAll().subscribe(students => {
    this.dataSource = new MatTableDataSource(students);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Filtro personalizado
    this.dataSource.filterPredicate = (data, filter) => {
      return data.fullName.toLowerCase().includes(filter);
    };
  });
}

applyFilter(event: Event) {
  const filterValue = (event.target as HTMLInputElement).value;
  this.dataSource.filter = filterValue.trim().toLowerCase();
}
```

---

## 12. NOTIFICACIONES

### 12.1 Servicio

```typescript
// notification.service.ts
@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string, duration = 3000) {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['snackbar-success']
    });
  }

  error(message: string, duration = 5000) {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['snackbar-error']
    });
  }

  info(message: string, duration = 3000) {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['snackbar-info']
    });
  }
}
```

---

## 13. LOADING STATES

### 13.1 Global loading

```typescript
// loading.interceptor.ts
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  this.loadingService.show();
  
  return next.handle(req).pipe(
    finalize(() => this.loadingService.hide())
  );
}

// loading.service.ts
private loadingSubject = new BehaviorSubject<boolean>(false);
loading$ = this.loadingSubject.asObservable();

show() {
  this.loadingSubject.next(true);
}

hide() {
  this.loadingSubject.next(false);
}
```

### 13.2 Loading spinner global

```html
<!-- app.component.html -->
<app-loading-spinner *ngIf="loadingService.loading$ | async"></app-loading-spinner>
<router-outlet></router-outlet>
```

---

## 14. RESPONSIVE DESIGN

### 14.1 Breakpoints Angular Material

```scss
// _variables.scss
$breakpoint-xs: 0;
$breakpoint-sm: 600px;
$breakpoint-md: 960px;
$breakpoint-lg: 1280px;
$breakpoint-xl: 1920px;
```

### 14.2 Directivas responsive

```typescript
// Usar BreakpointObserver para ocultar/mostrar elementos
constructor(private breakpointObserver: BreakpointObserver) {}

isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
  map(result => result.matches)
);
```

---

## 15. TESTING

### 15.1 Unitarios (obligatorio para servicios y pipes)

```typescript
// students.service.spec.ts
describe('StudentsService', () => {
  let service: StudentsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StudentsService]
    });
    service = TestBed.inject(StudentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch all students', () => {
    const mockStudents: Student[] = [...];
    
    service.getAll().subscribe(students => {
      expect(students.length).toBe(2);
      expect(students).toEqual(mockStudents);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/students`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStudents);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

### 15.2 E2E (opcional pero recomendado para flujos críticos)

```typescript
// login.e2e.spec.ts (Cypress)
describe('Login Flow', () => {
  it('should login successfully', () => {
    cy.visit('/auth/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

---

## 16. CONFIGURACIÓN DE ENTORNOS

### 16.1 Environments

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  tokenKey: 'access_token',
  refreshTokenKey: 'refresh_token'
};

// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.tudominio.com',
  tokenKey: 'access_token',
  refreshTokenKey: 'refresh_token'
};
```

---

## 17. VALIDACIONES CRÍTICAS (REPETIR DESDE BACKEND)

### 17.1 Validaciones de negocio

**Periodos:**
- Solo 1 periodo activo por contexto
- No solapamiento de fechas
- startDate < endDate

**Asignaciones:**
- Un alumno solo puede estar activo una vez en el mismo grupo

**Evaluaciones:**
- Peso entre 0 y 100
- Warning si suma ≠ 100 (no bloqueante)

**Calificaciones:**
- Una por alumno por evaluación (UNIQUE en backend)

**Compartición:**
- Nunca compartir calificaciones ni asistencia
- Solo registros según consentimiento

---

## 18. EXPORTACIÓN DE DATOS

### 18.1 Librería recomendada

**Excel:** `xlsx` (SheetJS)

```typescript
// export.service.ts
exportToExcel(data: any[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Datos');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
```

### 18.2 Exportaciones requeridas

- Lista de estudiantes (filtrada)
- Asistencias por periodo/grupo/materia
- Calificaciones (boletas)
- Registros estudiantiles (por estudiante/tipo/periodo)

---

## 19. PIPES PERSONALIZADOS

### 19.1 Pipes útiles

```typescript
// status-label.pipe.ts
@Pipe({ name: 'statusLabel', standalone: true })
export class StatusLabelPipe implements PipeTransform {
  transform(status: string): string {
    const labels: Record<string, string> = {
      active: 'Activo',
      archived: 'Archivado',
      inactive: 'Inactivo',
      present: 'Presente',
      absent: 'Ausente',
      late: 'Tarde'
    };
    return labels[status] || status;
  }
}

// date-format.pipe.ts (si no usas DatePipe de Angular)
@Pipe({ name: 'customDate', standalone: true })
export class CustomDatePipe implements PipeTransform {
  transform(value: Date | string, format = 'dd/MM/yyyy'): string {
    if (!value) return '';
    const date = new Date(value);
    // Formatear según librería (date-fns, moment, etc.)
    return format(date, format);
  }
}
```

---

## 20. BUENAS PRÁCTICAS

### 20.1 Código

1. **Componentes pequeños:** máximo 300 líneas
2. **Standalone components:** usar en Angular 17+
3. **OnPush change detection:** usar donde sea posible
4. **Unsubscribe:** usar `takeUntil` o `async pipe`
5. **Tipado estricto:** `strictNullChecks: true`

### 20.2 Estado

1. **Inmutabilidad:** usar operadores spread, nunca mutar state
2. **Selectors:** para datos derivados
3. **Effects:** para side effects (HTTP)
4. **Actions:** descriptivos y específicos

### 20.3 Rendimiento

1. **Lazy loading:** para todos los feature modules
2. **TrackBy:** en `*ngFor` con listas grandes
3. **Virtual scrolling:** para listas de 100+ elementos
4. **Debounce:** en búsquedas (300ms)

---

## 21. ESTRUCTURA DE UN FEATURE MODULE (EJEMPLO)

```typescript
// students/students.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';

export const STUDENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./student-list/student-list.component')
      .then(m => m.StudentListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'new',
    loadComponent: () => import('./student-form/student-form.component')
      .then(m => m.StudentFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./student-detail/student-detail.component')
      .then(m => m.StudentDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./student-form/student-form.component')
      .then(m => m.StudentFormComponent),
    canActivate: [AuthGuard]
  }
];
```

---

## 22. ALCANCE V1 vs V2

### V1 (OBLIGATORIO)

**Auth:**
- Login, logout, registro
- Recuperación de contraseña
- Refresh tokens

**Academic:**
- CRUD completo de contexts, periods, groups, subjects

**Students:**
- CRUD de estudiantes con fuzzy matching
- Asignaciones con validaciones

**Assessments:**
- Asistencia (toma rápida)
- Evaluaciones y calificaciones

**Records:**
- Registros estudiantiles con réplica

**Files:**
- Upload/download local

**Dashboard:**
- Resumen básico

### V2 (FUTURO)

- Roles y permisos granulares
- Notificaciones push
- Gráficas avanzadas (Chart.js/D3.js)
- Tema dark/light
- S3 para archivos
- Auditoría completa
- Suscripciones y monetización

---

## 23. LIBRERÍAS RECOMENDADAS

### 23.1 Core

- `@angular/material`: ^17.0.0
- `@ngrx/store`: ^17.0.0
- `@ngrx/effects`: ^17.0.0
- `@ngrx/store-devtools`: ^17.0.0

### 23.2 Utilidades

- `fuse.js`: fuzzy search
- `date-fns`: manejo de fechas
- `xlsx`: exportación Excel
- `ngx-mask`: máscaras de input (teléfono, fecha)

### 23.3 Desarrollo

- `eslint`: linting
- `prettier`: formateo
- `husky`: git hooks (pre-commit)
- `cypress`: E2E testing

---

## 24. CONFIGURACIÓN INICIAL

### 24.1 Angular CLI

```bash
ng new school-frontend --standalone --routing --style=scss
cd school-frontend
ng add @angular/material
ng add @ngrx/store
ng add @ngrx/effects
ng add @ngrx/store-devtools
```

### 24.2 Estructura inicial

```bash
# Generar core
ng g module core

# Generar shared
ng g module shared

# Generar features (lazy)
ng g module features/auth --route auth --module app.routes
ng g module features/dashboard --route dashboard --module app.routes
# ... etc
```

---

## 25. CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Setup (Semana 1)
- [ ] Configurar proyecto Angular
- [ ] Instalar dependencias
- [ ] Configurar Angular Material
- [ ] Configurar NgRx Store
- [ ] Crear estructura de carpetas
- [ ] Configurar environments

### Fase 2: Core (Semana 2)
- [ ] AuthService + guards + interceptors
- [ ] NotificationService
- [ ] LoadingService
- [ ] Models e interfaces
- [ ] Error handling global

### Fase 3: Auth Module (Semana 3)
- [ ] Login component
- [ ] Register component
- [ ] Forgot password component
- [ ] Integrar con backend

### Fase 4: Layout (Semana 4)
- [ ] Navbar
- [ ] Sidebar
- [ ] Footer
- [ ] Routing básico

### Fase 5: Academic Module (Semanas 5-7)
- [ ] Contexts CRUD
- [ ] Periods CRUD con validaciones
- [ ] Groups CRUD
- [ ] Subjects CRUD

### Fase 6: Students Module (Semanas 8-9)
- [ ] Students CRUD
- [ ] Fuzzy matching
- [ ] Assignments CRUD
- [ ] Student detail (tabs)

### Fase 7: Assessments Module (Semanas 10-12)
- [ ] Attendance board
- [ ] Evaluations CRUD
- [ ] Grades board
- [ ] Reports

### Fase 8: Records & Files (Semanas 13-14)
- [ ] Student records CRUD
- [ ] File upload/download
- [ ] Consents CRUD

### Fase 9: Dashboard (Semana 15)
- [ ] Summary cards
- [ ] Recent activity
- [ ] Alerts

### Fase 10: Testing & Deploy (Semana 16)
- [ ] Unit tests
- [ ] E2E tests críticos
- [ ] Build producción
- [ ] Deploy

---

## 26. NOTAS FINALES

1. **Prioridad:** seguridad > UX > performance
2. **Validaciones:** duplicar validaciones críticas en frontend y backend
3. **Estado:** NgRx obligatorio para este alcance (mantener sincronización)
4. **Formularios:** siempre Reactive Forms
5. **Lazy Loading:** aplicar a todos los features
6. **Responsive:** mobile-first approach
7. **Accesibilidad:** usar elementos semánticos, aria-labels
8. **SEO:** no aplica (app interna)

---

## 27. CONTACTO Y SOPORTE

**Documentación de referencia:**
- Backend: `DOCUMENTACIÓN TÉCNICA V1 (CONGELADA).md`
- Base de datos: `Documento de requerimientos base de datos.md`
- Entities: `CÓDIGO DE ENTITIES – TYPEORM (V1).md`

**Endpoints backend:**
- Base URL: `http://localhost:3000` (desarrollo)
- Swagger docs: `http://localhost:3000/api` (si se implementa)

---

✅ **DOCUMENTO FINAL - LISTO PARA DESARROLLO**
