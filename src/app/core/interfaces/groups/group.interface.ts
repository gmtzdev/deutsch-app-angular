import { User } from '@app/core/models/user/User.model';
import type { Level } from '../../models/level.model';
import type { GroupStatus } from '../../types/groups.types';

export interface Group {
    id: number;
    name: string;
    description: string;
    teacherName: string;
    level: string;
    levels?: Level[];
    status: GroupStatus;
    // members: number;
    users: User[];
    createdAt: string;
}