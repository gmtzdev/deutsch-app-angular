import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Group } from '../interfaces/groups/group.interface';
import type { GroupStatus } from '../types/groups.types';
import { User } from '../models/user/User.model';

import type { CreateGroupDto } from '../dto/groups/create-group.dto';

@Injectable({ providedIn: 'root' })
export class GroupService {
    private readonly http = inject(HttpClient);
    private readonly url = environment.apiUrl;

    getGroups(): Observable<Group[]> {
        return this.http.get<Group[]>(`${this.url}/groups`).pipe(
            catchError(() => of([])),
        );
    }

    getGroupStats(): Observable<{ total: number; active: number; }> {
        return this.getGroups().pipe(
            map((groups) => ({
                total: groups.length,
                active: groups.filter((group) => group.status === 'active').length,
            })),
        );
    }

    createGroup(dto: CreateGroupDto): Observable<Group> {
        const payload: Group = {
            id: Date.now(),
            name: dto.name.trim(),
            description: dto.description?.trim() ?? '',
            teacherName: dto.teacherName.trim(),
            level: dto.level.trim(),
            status: dto.status ?? 'active',
            // members: dto.memberIds?.length ?? 0,
            users: Array.from(new Set(dto.users ?? [] as User[])),
            createdAt: new Date().toISOString(),
        };

        return this.http.post<Group>(`${this.url}/groups`, dto).pipe(
            catchError(() => of(payload)),
        );
    }

    updateGroup(groupId: number, dto: Partial<CreateGroupDto>): Observable<Group> {
        const existing = null; // Since FALLBACK_GROUPS is removed, set existing to null

        return this.http.patch<Group>(`${this.url}/groups/${groupId}`, dto);
        // .pipe(
        //     catchError(() =>
        //         of({
        //             ...dto,
        //             name: dto.name?.trim() ?? '',
        //             teacherName: dto.teacherName?.trim() ?? '',
        //             level: dto.level?.trim() ?? '',
        //             description: dto.description?.trim() ?? '',
        //             status: dto.status ?? 'active',
        //             memberIds: dto.users ? Array.from(new Set(dto.users)) : [],
        //             members: dto.users ? Array.from(new Set(dto.users)).length : 0,
        //         }),
        //     ),
        // );
    }

    deleteGroup(groupId: number): Observable<void> {
        return this.http.delete<void>(`${this.url}/groups/${groupId}`).pipe(
            catchError(() => of(void 0)),
        );
    }
}
