import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Observable, from, switchMap } from 'rxjs';
import { CreateUserRequest, KeycloakUser, ResetPasswordRequest, UpdateRoleRequest, UpdateUserRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private readonly keycloakUrl = 'http://localhost:9090';
  private readonly realm = 'pet-realm';
  private readonly baseUrl = `${this.keycloakUrl}/admin/realms/${this.realm}`;

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private getHeaders(): Observable<HttpHeaders> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });
        return [headers];
      })
    );
  }

  getAllUsers(): Observable<any[]> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.get<any[]>(`${this.baseUrl}/users`, { headers }))
    );
  }

  createUser(request: CreateUserRequest): Observable<any> {
    const userPayload = {
      username: request.username,
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      enabled: request.enabled,
      emailVerified: request.emailVerified,
      credentials: [{
        type: 'password',
        value: request.password,
        temporary: false
      }]
    };

    return this.getHeaders().pipe(
      switchMap(headers => this.http.post(`${this.baseUrl}/users`, userPayload, { headers }))
    );
  }

  updateUser(userId: string, request: UpdateUserRequest): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.put(`${this.baseUrl}/users/${userId}`, request, { headers }))
    );
  }

  deleteUser(userId: string): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.baseUrl}/users/${userId}`, { headers }))
    );
  }

  resetPassword(userId: string, request: ResetPasswordRequest): Observable<any> {
    const payload = {
      type: 'password',
      value: request.newPassword,
      temporary: request.temporary
    };

    return this.getHeaders().pipe(
      switchMap(headers => this.http.put(`${this.baseUrl}/users/${userId}/reset-password`, payload, { headers }))
    );
  }

  getUserRoles(userId: string): Observable<any[]> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.get<any[]>(`${this.baseUrl}/users/${userId}/role-mappings/realm`, { headers }))
    );
  }

  updateUserRole(userId: string, request: UpdateRoleRequest): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => {
        // Get current roles
        return this.http.get<any[]>(`${this.baseUrl}/users/${userId}/role-mappings/realm`, { headers }).pipe(
          switchMap(currentRoles => {
            // Get available roles
            return this.http.get<any[]>(`${this.baseUrl}/roles`, { headers }).pipe(
              switchMap(availableRoles => {
                // Find roles to remove
                const rolesToRemove = (currentRoles || []).filter((r: any) => 
                  r.name === 'USER' || r.name === 'MANAGER' || r.name === 'ADMIN'
                );

                // Find role to add
                const roleToAdd = (availableRoles || []).find((r: any) => r.name === request.role);

                if (!roleToAdd) {
                  throw new Error(`Role ${request.role} not found`);
                }

                // Remove old roles if any
                if (rolesToRemove.length > 0) {
                  return this.http.delete(`${this.baseUrl}/users/${userId}/role-mappings/realm`, { 
                    headers, 
                    body: rolesToRemove 
                  }).pipe(
                    switchMap(_result => {
                      // Add new role
                      return this.http.post(
                        `${this.baseUrl}/users/${userId}/role-mappings/realm`,
                        [roleToAdd],
                        { headers }
                      );
                    })
                  );
                } else {
                  // Add new role directly
                  return this.http.post(
                    `${this.baseUrl}/users/${userId}/role-mappings/realm`,
                    [roleToAdd],
                    { headers }
                  );
                }
              })
            );
          })
        );
      })
    );
  }
}
