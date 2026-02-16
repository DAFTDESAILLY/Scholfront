import { Routes } from '@angular/router';
import { PeriodListComponent } from './period-list/period-list.component';
import { PeriodFormComponent } from './period-form/period-form.component';

export const PERIODS_ROUTES: Routes = [
    { path: '', component: PeriodListComponent },
    { path: 'new', component: PeriodFormComponent },
    { path: ':id/edit', component: PeriodFormComponent }
];
