import { Routes } from '@angular/router';
import { StudentListComponent } from './student-list/student-list.component';
import { StudentFormComponent } from './student-form/student-form.component';
import { StudentProfileComponent } from './student-profile/student-profile';

export const STUDENTS_ROUTES: Routes = [
    { path: '', component: StudentListComponent },
    { path: 'new', component: StudentFormComponent },
    { path: ':id/edit', component: StudentFormComponent },
    { path: ':id', component: StudentProfileComponent }
];
