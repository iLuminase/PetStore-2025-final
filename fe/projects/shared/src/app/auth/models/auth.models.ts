export interface User {
    id: string;
    email: string;
    name?: string;
    profilePicture?: string;
    roles: string[];
    permissions: string[];
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface GoogleAuthRequest {
    code: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}