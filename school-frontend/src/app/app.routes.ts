import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'contexts',
                loadChildren: () => import('./features/academic/contexts/contexts.routes').then(m => m.CONTEXTS_ROUTES)
            },
            {
                path: 'periods',
                loadChildren: () => import('./features/academic/periods/periods.routes').then(m => m.PERIODS_ROUTES)
            },
            {
                path: 'groups',
                loadChildren: () => import('./features/academic/groups/groups.routes').then(m => m.GROUPS_ROUTES)
            },
            {
                path: 'subjects',
                loadChildren: () => import('./features/academic/subjects/subjects.routes').then(m => m.SUBJECTS_ROUTES)
            },
            {
                path: 'students',
                loadChildren: () => import('./features/students/students.routes').then(m => m.STUDENTS_ROUTES)
            },
            {
                path: 'assessments',
                loadChildren: () => import('./features/assessments/assessments.routes').then(m => m.ASSESSMENTS_ROUTES)
            },
            {
                path: 'records',
                loadChildren: () => import('./features/records/records.routes').then(m => m.RECORDS_ROUTES)
            }
        ]
    }
];
