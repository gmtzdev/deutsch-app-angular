export interface AuthUser {
    id: string;
    username: string;
    role: string;
}

export interface LoginResponse {
    success: boolean;
    token?: string;
    user?: AuthUser;
    error?: string;
}