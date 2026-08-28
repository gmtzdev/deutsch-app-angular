import type { GroupStatus } from '../../types/groups.types';
import type { User } from '../../models/user/User.model';

export interface CreateGroupDto {
    name: string;
    description?: string;
    teacherName: string;
    level: string;
    status?: GroupStatus;
    users?: User[];
}