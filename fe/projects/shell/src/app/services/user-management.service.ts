import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, from, map, switchMap } from 'rxjs';
import { CreateUserRequest, ResetPasswordRequest, UpdateRoleRequest, UpdateUserRequest } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserManagementService {
    private readonly keycloakAdminUrl = '/keycloak/admin/realms/pet-realm';
    private readonly adminUsername = 'admin';
    private readonly adminPassword = 'admin123';
    private adminToken: string | null = null;

    constructor(private http: HttpClient) { }

    private getAdminToken(): Observable<string> {
        if (this.adminToken) {
            return from([this.adminToken]);
        }

        const tokenUrl = '/keycloak/realms/master/protocol/openid-connect/token';
        const body = new URLSearchParams({
            grant_type: 'password',
            client_id: 'admin-cli',
            username: this.adminUsername,
            password: this.adminPassword
        });

        return this.http.post<any>(tokenUrl, body.toString(), {
            headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded'
            })
        }).pipe(
            map(response => {
                this.adminToken = response.access_token;
                return this.adminToken!;
            })
        );
    }

    private getAdminHeaders(): Observable<HttpHeaders> {
        return this.getAdminToken().pipe(
            map(token => {
                return new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                });
            })
        );
    }

    getAllUsers(): Observable<any[]> {
        return this.getAdminHeaders().pipe(
            switchMap(headers => this.http.get<any[]>(`${this.keycloakAdminUrl}/users`, { headers }))
        );
    }

    getUserById(userId: string): Observable<any> {
        return this.getAdminHeaders().pipe(
            switchMap(headers => this.http.get<any>(`${this.keycloakAdminUrl}/users/${userId}`, { headers }))
        );
    }

    searchUsers(query: string): Observable<any[]> {
        return this.getAdminHeaders().pipe(
            switchMap(headers => this.http.get<any[]>(`${this.keycloakAdminUrl}/users?search=${query}`, { headers }))
        );
    }

    createUser(request: CreateUserRequest): Observable<any> {
        const keycloakUser = {
            username: request.username,
            email: request.email,
            firstName: request.firstName,
            lastName: request.lastName,
            enabled: request.enabled,
            emailVerified: true,
            credentials: request.password ? [{
                type: 'password',
                value: request.password,
                temporary: false
            }] : []
        };

        return this.getAdminHeaders().pipe(
            switchMap(headers => this.http.post(`${this.keycloakAdminUrl}/users`, keycloakUser, {
                headers,
                observe: 'response'
            })),
            switchMap(response => {
                const location = response.headers.get('Location');
                if (location && request.role) {
                    const userId = location.split('/').pop();
                    return this.assignRoleToUser(userId!, request.role).pipe(
                        map(() => response)
                    );
                }
                return from([response]);
            })
        );
    }

    updateUser(userId: string, request: UpdateUserRequest): Observable<any> {
        const keycloakUser = {
            email: request.email,
            firstName: request.firstName,
            lastName: request.lastName,
            enabled: request.enabled
        };

        return this.getAdminHeaders().pipe(
            switchMap(headers => this.http.put(`${this.keycloakAdminUrl}/users/${userId}`, keycloakUser, { headers }))
        );
    }

    deleteUser(userId: string): Observable<any> {
        return this.getAdminHeaders().pipe(
            switchMap(headers => this.http.delete(`${this.keycloakAdminUrl}/users/${userId}`, { headers }))
        );
    }

    resetPassword(userId: string, request: ResetPasswordRequest): Observable<any> {
        const credential = {
            type: 'password',
            value: request.newPassword,
            temporary: request.temporary || false
        };

        return this.getAdminHeaders().pipe(
            switchMap(headers => this.http.put(
                `${this.keycloakAdminUrl}/users/${userId}/reset-password`,
                credential,
                { headers }
            ))
        );
    }

    getUserRoles(userId: string): Observable<string[]> {
        return this.getAdminHeaders().pipe(
            switchMap(headers => this.http.get<any[]>(
                `${this.keycloakAdminUrl}/users/${userId}/role-mappings/realm`,
                { headers }
            )),
            map((roles: any[]) => roles.map(r => r.name))
        );
    }

    private assignRoleToUser(userId: string, roleName: string): Observable<any> {
        return this.getAdminHeaders().pipe(
            switchMap(headers => {
                return this.http.get<any>(`${this.keycloakAdminUrl}/roles/${roleName}`, { headers }).pipe(
                    switchMap(role => {
                        return this.http.post(
                            `${this.keycloakAdminUrl}/users/${userId}/role-mappings/realm`,
                            [role],
                            { headers }
                        );
                    })
                );
            })
        );
    }

    updateUserRole(userId: string, request: UpdateRoleRequest): Observable<any> {
        const allRoles = ['USER', 'MANAGER', 'ADMIN'];

        console.log('🔄 Updating role for user:', userId, 'to:', request.role);

        // First, remove all existing custom roles
        return this.getUserRoles(userId).pipe(
            switchMap(currentRoles => {
                console.log('📋 Current roles:', currentRoles);

                // Find which custom roles the user currently has
                const rolesToRemove = currentRoles.filter(role => allRoles.includes(role));
                console.log('🗑️ Roles to remove:', rolesToRemove);

                if (rolesToRemove.length === 0) {
                    // No roles to remove, just assign the new one
                    console.log('✅ No roles to remove, assigning new role:', request.role);
                    return this.assignRoleToUser(userId, request.role);
                }

                // Remove all custom roles first
                console.log('🔥 Removing roles:', rolesToRemove);
                return forkJoin(
                    rolesToRemove.map(role => this.removeRoleFromUser(userId, role))
                ).pipe(
                    // Then assign the new role
                    switchMap(() => {
                        console.log('✨ Assigning new role:', request.role);
                        return this.assignRoleToUser(userId, request.role);
                    })
                );
            })
        );
    }

    getAvailableRoles(): Observable<any[]> {
        return this.getAdminHeaders().pipe(
            switchMap(headers => this.http.get<any[]>(`${this.keycloakAdminUrl}/roles`, { headers }))
        );
    }

    removeRoleFromUser(userId: string, roleName: string): Observable<any> {
        return this.getAdminHeaders().pipe(
            switchMap(headers => {
                return this.http.get<any>(`${this.keycloakAdminUrl}/roles/${roleName}`, { headers }).pipe(
                    switchMap(role => {
                        return this.http.request(
                            'DELETE',
                            `${this.keycloakAdminUrl}/users/${userId}/role-mappings/realm`,
                            {
                                headers,
                                body: [role]
                            }
                        );
                    })
                );
            })
        );
    }
}
