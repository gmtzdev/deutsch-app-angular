import { UserRole } from "../../enum/user/user-rol.enum";

export interface UpdateUserDto {
    email?: string;
    name?: string;
    role?: UserRole;
    password?: string;
}
