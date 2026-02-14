import { Routes } from '@angular/router';
import { StudentRecordsComponent } from './student-records/student-records.component';
import { FileManagementComponent } from './file-management/file-management.component';

export const RECORDS_ROUTES: Routes = [
    { path: 'files', component: FileManagementComponent },
    { path: 'student/:id', component: StudentRecordsComponent },
    { path: '', redirectTo: 'files', pathMatch: 'full' }
];
