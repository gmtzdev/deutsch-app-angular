export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}


export class User {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;

    constructor(user: User) {
        this.id = user.id;
        this.email = user.email;
        this.name = user.name;
        this.role = user.role;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }
}
