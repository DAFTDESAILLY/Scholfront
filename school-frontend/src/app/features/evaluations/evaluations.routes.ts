import { Routes } from '@angular/router';
import { AttendanceComponent } from './attendance/attendance.component';
import { GradingComponent } from './grading/grading.component';

export const EVALUATIONS_ROUTES: Routes = [
    { path: 'attendance', component: AttendanceComponent },
    { path: 'grading', component: GradingComponent },
    { path: 'definitions', loadComponent: () => import('./evaluation-list/evaluation-list.component').then(m => m.EvaluationListComponent) },
    { path: 'definitions/new', loadComponent: () => import('./evaluation-form/evaluation-form.component').then(m => m.EvaluationFormComponent) },
    { path: 'definitions/:id/edit', loadComponent: () => import('./evaluation-form/evaluation-form.component').then(m => m.EvaluationFormComponent) },
    { path: '', redirectTo: 'definitions', pathMatch: 'full' }
];
