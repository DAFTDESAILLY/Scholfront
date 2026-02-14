import { Routes } from '@angular/router';
import { ContextListComponent } from './context-list/context-list.component';
import { ContextFormComponent } from './context-form/context-form.component';

export const CONTEXTS_ROUTES: Routes = [
    { path: '', component: ContextListComponent },
    { path: 'new', component: ContextFormComponent },
    { path: ':id/edit', component: ContextFormComponent }
];
