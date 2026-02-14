import { Routes } from '@angular/router';
import { AttendanceComponent } from './attendance/attendance.component';
import { GradingComponent } from './grading/grading.component';

export const ASSESSMENTS_ROUTES: Routes = [
    { path: 'attendance', component: AttendanceComponent },
    { path: 'grading', component: GradingComponent },
    { path: '', redirectTo: 'attendance', pathMatch: 'full' }
];
