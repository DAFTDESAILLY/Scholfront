import { Routes } from '@angular/router';
import { SubjectListComponent } from './subject-list/subject-list.component';
import { SubjectFormComponent } from './subject-form/subject-form.component';

export const SUBJECTS_ROUTES: Routes = [
    { path: '', component: SubjectListComponent },
    { path: 'new', component: SubjectFormComponent },
    { path: ':id/edit', component: SubjectFormComponent }
];
