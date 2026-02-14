import { Routes } from '@angular/router';
import { GroupListComponent } from './group-list/group-list.component';
import { GroupFormComponent } from './group-form/group-form.component';

export const GROUPS_ROUTES: Routes = [
    { path: '', component: GroupListComponent },
    { path: 'new', component: GroupFormComponent },
    { path: ':id/edit', component: GroupFormComponent }
];
