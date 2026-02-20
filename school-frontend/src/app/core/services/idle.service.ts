import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class IdleService {
    private idleTimer: any;
    private timeoutMilliseconds: number;
    private activitySubscription?: Subscription;
    private isTimedOut = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private ngZone: NgZone
    ) {
        this.timeoutMilliseconds = 30 * 60 * 1000; // 30 minutos
    }

    startWatching(timeoutMinutes: number = 30): void {
        // Prevenir múltiples inicializaciones
        if (this.activitySubscription) {
            return;
        }

        this.timeoutMilliseconds = timeoutMinutes * 60 * 1000;
        this.isTimedOut = false;

        const activityEvents$ = merge(
            fromEvent(document, 'mousemove'),
            fromEvent(document, 'mousedown'),
            fromEvent(document, 'keydown'),
            fromEvent(document, 'scroll'),
            fromEvent(document, 'touchstart'),
            fromEvent(document, 'click')
        );

        this.ngZone.runOutsideAngular(() => {
            this.activitySubscription = activityEvents$
                .pipe(debounceTime(500))
                .subscribe(() => {
                    if (!this.isTimedOut) {
                        this.resetTimer();
                    }
                });
        });

        this.resetTimer();
    }

    stopWatching(): void {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
        if (this.activitySubscription) {
            this.activitySubscription.unsubscribe();
            this.activitySubscription = undefined;
        }
    }

    private resetTimer(): void {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }

        this.idleTimer = setTimeout(() => {
            this.onTimeout();
        }, this.timeoutMilliseconds);
    }

    private onTimeout(): void {
        // Prevenir ejecuciones múltiples
        if (this.isTimedOut) {
            return;
        }

        this.isTimedOut = true;
        this.stopWatching();

        this.ngZone.run(() => {
            console.log('⏰ Sesión cerrada por inactividad');
            this.authService.logout();
        });
    }
}