import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        RouterLinkActive,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatBadgeModule
    ],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
    isCollapsed = false;
    unreadCount = 3; // Mock value for now

    navItems = [
        { label: 'Tablero', icon: 'dashboard', route: '/dashboard' },
        { label: 'Académico', icon: 'school', route: '/contexts' },
        { label: 'Periodos', icon: 'date_range', route: '/periods' },
        { label: 'Materias', icon: 'library_books', route: '/subjects' },
        { label: 'Grupos', icon: 'class', route: '/groups' },
        { label: 'Estudiantes', icon: 'people', route: '/students', badge: '3' },
        { label: 'Asistencia', icon: 'event_available', route: '/evaluations/attendance' },
        { label: 'Evaluaciones', icon: 'assignment', route: '/evaluations/definitions' },
        { label: 'Calificaciones', icon: 'grade', route: '/evaluations/grading' },
        { label: 'Consentimientos', icon: 'privacy_tip', route: '/consents' },
        { label: 'Registros', icon: 'description', route: '/records' }
    ];

    toggleSidebar() {
        this.isCollapsed = !this.isCollapsed;
    }

    toggleNotifications() {
        console.log('Toggle notifications');
        // Implement logic to show notifications panel or navigate
    }
}
