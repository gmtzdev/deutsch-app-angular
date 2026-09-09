import { User } from '@app/core/models/user/User.model';
import type { GroupStatus } from '../../types/groups.types';

export interface Group {
    id: number;
    name: string;
    description: string;
    teacherName: string;
    level: string;
    status: GroupStatus;
    // members: number;
    users: User[];
    createdAt: string;
}