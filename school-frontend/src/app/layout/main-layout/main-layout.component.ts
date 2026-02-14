import { Component, ViewChild, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../core/services/auth.service';
import { IdleService } from '../../core/services/idle.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        MatSidenavModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        NavbarComponent,
        SidebarComponent,
        FooterComponent
    ],
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
    @ViewChild('drawer') drawer!: MatSidenav;
    private breakpointObserver = inject(BreakpointObserver);
    private authService = inject(AuthService);
    private idleService = inject(IdleService);

    isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
        .pipe(
            map(result => result.matches),
            shareReplay()
        );

    ngOnInit(): void {
        // Iniciar monitoreo de inactividad
        this.idleService.startWatching(environment.idleTimeoutMinutes);
        console.log(`🔒 Auto-logout activado: ${environment.idleTimeoutMinutes} minutos de inactividad`);
    }

    ngOnDestroy(): void {
        // Detener monitoreo cuando el componente se destruya
        this.idleService.stopWatching();
    }

    toggleDrawer() {
        this.drawer.toggle();
    }
}
