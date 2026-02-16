import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        RouterLinkActive,
        MatListModule,
        MatIconModule
    ],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
    navItems = [
        { label: 'Tablero', icon: 'dashboard', route: '/dashboard' },
        { label: 'Académico', icon: 'school', route: '/contexts' },
        { label: 'Periodos', icon: 'date_range', route: '/periods' },
        { label: 'Materias', icon: 'library_books', route: '/subjects' },
        { label: 'Grupos', icon: 'class', route: '/groups' },
        { label: 'Estudiantes', icon: 'people', route: '/students' },
        { label: 'Asistencia', icon: 'event_available', route: '/evaluations/attendance' },
        { label: 'Evaluaciones', icon: 'assignment', route: '/evaluations/definitions' },
        { label: 'Calificaciones', icon: 'grade', route: '/evaluations/grading' },
        { label: 'Consentimientos', icon: 'privacy_tip', route: '/consents' },
        { label: 'Registros', icon: 'description', route: '/records' }
    ];
}
