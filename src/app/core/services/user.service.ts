import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user/User.model';
import { CreateUserDto } from '../dto/user/create-user.dto';



interface LoginAttemptState {
    count: number;
    lockedUntil: number | null;
    lastAttempt: number;
}


@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly router = inject(Router);
    private readonly http = inject(HttpClient);
    private readonly url = environment.apiUrl;

    // ── Admin: user management ────────────────────────────────────

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.url}/users`);
    }

    getPendingVerificationUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.url}/users/pending-verification`);
    }

    verifyUser(userId: number): Observable<boolean> {
        return this.http.patch<boolean>(`${this.url}/users/${userId}/verify`, {});
    }

    createUser(dto: CreateUserDto): Observable<User> {
        return this.http.post<User>(`${this.url}/users`, dto);
    }

    updateUserRole(userId: number, role: string): Observable<User> {
        return this.http.patch<User>(`${this.url}/users/${userId}/role`, { role });
    }

    deleteUser(userId: number): Observable<void> {
        return this.http.delete<void>(`${this.url}/users/${userId}`);
    }
}
