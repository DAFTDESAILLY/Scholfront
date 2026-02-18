import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [
        CommonModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatBadgeModule,
        RouterLink
    ],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
    @Output() toggleSidenav = new EventEmitter<void>();

    // Mock data for UI - In a real app this would come from services
    notifications = 3;
    user = {
        name: 'Maestra',
        avatar: 'assets/avatar-placeholder.png' // Ensure this exists or use a generic icon
    };

    constructor(public authService: AuthService) {
        // basic user name sync if available
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
            this.user.name = currentUser.email || 'Maestra';
        }
    }

    onSearch(event: Event) {
        // Placeholder for search functionality
        console.log('Search:', (event.target as HTMLInputElement).value);
    }

    onLogout() {
        this.authService.logout();
    }
}
