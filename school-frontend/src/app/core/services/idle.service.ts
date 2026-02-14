import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject, fromEvent, merge, timer } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class IdleService {
    private idleTimer$ = new Subject<void>();
    private timeoutMilliseconds: number;
    private idleSubscription: any;

    constructor(
        private authService: AuthService,
        private ngZone: NgZone
    ) {
        // Default: 30 minutos en milisegundos
        this.timeoutMilliseconds = 30 * 60 * 1000;
    }

    /**
     * Inicia el monitoreo de inactividad
     * @param timeoutMinutes Tiempo de inactividad en minutos (default: 30)
     */
    startWatching(timeoutMinutes: number = 30): void {
        this.timeoutMilliseconds = timeoutMinutes * 60 * 1000;

        // Eventos que indican actividad del usuario
        const activityEvents$ = merge(
            fromEvent(document, 'mousemove'),
            fromEvent(document, 'mousedown'),
            fromEvent(document, 'keydown'),
            fromEvent(document, 'scroll'),
            fromEvent(document, 'touchstart'),
            fromEvent(document, 'click')
        );

        // Ejecutar fuera de Angular zone para mejor performance
        this.ngZone.runOutsideAngular(() => {
            this.idleSubscription = activityEvents$
                .pipe(
                    debounceTime(500), // Esperar 500ms después de la última actividad antes de procesar
                    tap(() => this.resetTimer())
                )
                .subscribe();
        });

        // Iniciar el timer
        this.resetTimer();
    }

    /**
     * Detiene el monitoreo de inactividad
     */
    stopWatching(): void {
        if (this.idleSubscription) {
            this.idleSubscription.unsubscribe();
        }
        this.idleTimer$.complete();
    }

    /**
     * Resetea el timer de inactividad
     */
    private resetTimer(): void {
        // Limpiar el timer anterior
        this.idleTimer$.next();

        // Crear un nuevo timer
        timer(this.timeoutMilliseconds)
            .subscribe(() => {
                this.ngZone.run(() => {
                    console.log('⏰ Sesión cerrada por inactividad');
                    this.onTimeout();
                });
            });
    }

    /**
     * Se ejecuta cuando expira el tiempo de inactividad
     */
    private onTimeout(): void {
        this.stopWatching();
        this.authService.logout();
    }

    /**
     * Obtiene el observable para saber cuándo se detecta inactividad
     */
    get onIdle$(): Observable<void> {
        return this.idleTimer$.asObservable();
    }
}
