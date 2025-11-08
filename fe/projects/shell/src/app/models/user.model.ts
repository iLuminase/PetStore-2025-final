export interface KeycloakUser {
    id: string;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    enabled: boolean;
    emailVerified: boolean;
    createdTimestamp: number;
    roles?: string[];
    attributes?: Record<string, any>;
}

export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    enabled: boolean;
    emailVerified: boolean;
    role: string;
}

export interface UpdateUserRequest {
    email?: string;
    firstName?: string;
    lastName?: string;
    enabled?: boolean;
    emailVerified?: boolean;
}

export interface ResetPasswordRequest {
    newPassword: string;
    temporary: boolean;
}

export interface UpdateRoleRequest {
    role: string;
}
