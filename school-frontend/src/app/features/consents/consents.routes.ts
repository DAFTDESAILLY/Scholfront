import { Routes } from '@angular/router';
import { ConsentTypesComponent } from './consent-types/consent-types.component';
import { StudentConsentsComponent } from './student-consents/student-consents.component';

export const CONSENTS_ROUTES: Routes = [
    { path: 'types', component: ConsentTypesComponent },
    { path: 'student/:studentId', component: StudentConsentsComponent },
    { path: '', redirectTo: 'types', pathMatch: 'full' }
];
