import { UserRole } from "../../enum/user/user-rol.enum";

export interface CreateUserDto {
    email: string;
    password: string;
    name?: string;
    role?: UserRole;
}
