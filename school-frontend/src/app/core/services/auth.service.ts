import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, of, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth-response.model';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private tokenKey = environment.tokenKey;
    private refreshTokenKey = environment.refreshTokenKey;

    private userSubject = new BehaviorSubject<User | null>(null);
    public user$ = this.userSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) {
        this.loadUser();
    }

    private loadUser() {
        // In a real app, you might decode the token or fetch user profile on load
        const token = this.getToken();
        if (token) {
            // For V1, assuming validity if token exists, or fetch profile
            // this.getProfile().subscribe(); 
        }
    }

    login(credentials: { email: string, password: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => this.setSession(response))
        );
    }

    register(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, data);
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        this.userSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    refreshToken(): Observable<AuthResponse> {
        const refreshToken = localStorage.getItem(this.refreshTokenKey);
        if (!refreshToken) {
            this.logout();
            return throwError(() => new Error('No refresh token'));
        }
        return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refresh_token: refreshToken }).pipe(
            tap(response => this.setSession(response)),
            catchError(err => {
                this.logout();
                return throwError(() => err);
            })
        );
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        // Add expiration check here if decoding token
        return !!token;
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    private setSession(authResult: AuthResponse) {
        localStorage.setItem(this.tokenKey, authResult.access_token);
        if (authResult.refresh_token) {
            localStorage.setItem(this.refreshTokenKey, authResult.refresh_token);
        }
        // Optionally fetch user details or set user state
    }

    getCurrentUser(): { id: number; email: string } | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            // Decodificar JWT para obtener el payload
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                id: payload.sub || payload.userId || payload.id, // Ajustar según tu JWT
                email: payload.email
            };
        } catch (error) {
            console.error('Error decodificando token:', error);
            return null;
        }
    }
}
