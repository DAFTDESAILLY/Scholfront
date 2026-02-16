import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor(private snackBar: MatSnackBar) { }

    success(message: string) {
        this.snackBar.open(message, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
        });
    }

    error(message: string) {
        this.snackBar.open(message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
        });
    }

    warning(message: string) {
        this.snackBar.open(message, 'Close', {
            duration: 4000,
            panelClass: ['warning-snackbar']
        });
    }

    info(message: string) {
        this.snackBar.open(message, 'Close', {
            duration: 3000,
            panelClass: ['info-snackbar']
        });
    }
}
