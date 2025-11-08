import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    CreateUserRequest,
    KeycloakUser,
    ResetPasswordRequest,
    UpdateRoleRequest,
    UpdateUserRequest
} from '../models/user.model';
import { UserManagementService } from '../services/user-management.service';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
    users: KeycloakUser[] = [];
    filteredUsers: KeycloakUser[] = [];
    selectedUser: KeycloakUser | null = null;

    showCreateDialog = false;
    showEditDialog = false;
    showDeleteDialog = false;
    showPasswordDialog = false;
    showRoleDialog = false;

    createForm!: FormGroup;
    editForm!: FormGroup;
    passwordForm!: FormGroup;
    roleForm!: FormGroup;

    searchQuery = '';
    loading = false;
    error: string | null = null;
    success: string | null = null;

    roles = ['USER', 'MANAGER', 'ADMIN'];

    constructor(
        private userService: UserManagementService,
        private fb: FormBuilder
    ) {
        this.initForms();
    }

    ngOnInit(): void {
        this.loadUsers();
    }

    initForms(): void {
        this.createForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            firstName: [''],
            lastName: [''],
            role: ['USER', Validators.required],
            enabled: [true],
            emailVerified: [false]
        });

        this.editForm = this.fb.group({
            email: ['', [Validators.email]],
            firstName: [''],
            lastName: [''],
            enabled: [true],
            emailVerified: [false]
        });

        this.passwordForm = this.fb.group({
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            temporary: [false]
        });

        this.roleForm = this.fb.group({
            role: ['USER', Validators.required]
        });
    }

    loadUsers(): void {
        this.loading = true;
        this.error = null;

        this.userService.getAllUsers().subscribe({
            next: (users) => {
                // Map Keycloak user representation to our model
                this.users = users.map(u => ({
                    id: u.id,
                    username: u.username,
                    email: u.email,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    enabled: u.enabled,
                    emailVerified: u.emailVerified,
                    createdTimestamp: u.createdTimestamp,
                    roles: [], // Will be loaded below
                    attributes: u.attributes
                }));
                this.filteredUsers = this.users;

                // Load roles for each user
                this.loadUserRoles();
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load users: ' + (err.error?.errorMessage || err.message);
                this.loading = false;
            }
        });
    }

    loadUserRoles(): void {
        // Load roles for each user
        this.users.forEach(user => {
            this.userService.getUserRoles(user.id).subscribe({
                next: (roles) => {
                    user.roles = roles;
                    // Update filtered users as well
                    const filteredUser = this.filteredUsers.find(u => u.id === user.id);
                    if (filteredUser) {
                        filteredUser.roles = roles;
                    }
                },
                error: (err) => {
                    console.error(`Failed to load roles for user ${user.username}:`, err);
                    user.roles = [];
                }
            });
        });
    }

    searchUsers(): void {
        if (!this.searchQuery.trim()) {
            this.filteredUsers = this.users;
            return;
        }

        const query = this.searchQuery.toLowerCase();
        this.filteredUsers = this.users.filter(user =>
            user.username?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.firstName?.toLowerCase().includes(query) ||
            user.lastName?.toLowerCase().includes(query)
        );
    }

    openCreateDialog(): void {
        this.createForm.reset({
            role: 'USER',
            enabled: true,
            emailVerified: false
        });
        this.showCreateDialog = true;
        this.error = null;
        this.success = null;
    }

    openEditDialog(user: KeycloakUser): void {
        this.selectedUser = user;
        this.editForm.patchValue({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            enabled: user.enabled,
            emailVerified: user.emailVerified
        });
        this.showEditDialog = true;
        this.error = null;
        this.success = null;
    }

    openDeleteDialog(user: KeycloakUser): void {
        this.selectedUser = user;
        this.showDeleteDialog = true;
        this.error = null;
        this.success = null;
    }

    openPasswordDialog(user: KeycloakUser): void {
        this.selectedUser = user;
        this.passwordForm.reset({ temporary: false });
        this.showPasswordDialog = true;
        this.error = null;
        this.success = null;
    }

    openRoleDialog(user: KeycloakUser): void {
        this.selectedUser = user;
        // Get current role - prioritize USER, MANAGER, ADMIN roles
        const currentRole = this.getUserRole(user);
        this.roleForm.patchValue({ role: currentRole });
        this.showRoleDialog = true;
        this.error = null;
        this.success = null;
    }

    createUser(): void {
        if (this.createForm.invalid) return;

        this.loading = true;
        this.error = null;

        const request: CreateUserRequest = this.createForm.value;

        this.userService.createUser(request).subscribe({
            next: (response) => {
                this.success = response.message;
                this.showCreateDialog = false;
                this.loadUsers();
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to create user: ' + (err.error?.error || err.message);
                this.loading = false;
            }
        });
    }

    updateUser(): void {
        if (this.editForm.invalid || !this.selectedUser) return;

        this.loading = true;
        this.error = null;

        const request: UpdateUserRequest = this.editForm.value;

        this.userService.updateUser(this.selectedUser.id, request).subscribe({
            next: () => {
                this.success = 'User updated successfully';
                this.showEditDialog = false;
                this.loadUsers();
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to update user: ' + (err.error?.errorMessage || err.message);
                this.loading = false;
            }
        });
    }

    deleteUser(): void {
        if (!this.selectedUser) return;

        this.loading = true;
        this.error = null;

        this.userService.deleteUser(this.selectedUser.id).subscribe({
            next: () => {
                this.success = 'User deleted successfully';
                this.showDeleteDialog = false;
                this.loadUsers();
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to delete user: ' + (err.error?.errorMessage || err.message);
                this.loading = false;
            }
        });
    }

    resetPassword(): void {
        if (this.passwordForm.invalid || !this.selectedUser) return;

        this.loading = true;
        this.error = null;

        const request: ResetPasswordRequest = this.passwordForm.value;

        this.userService.resetPassword(this.selectedUser.id, request).subscribe({
            next: () => {
                this.success = 'Password reset successfully';
                this.showPasswordDialog = false;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to reset password: ' + (err.error?.errorMessage || err.message);
                this.loading = false;
            }
        });
    }

    updateRole(): void {
        if (this.roleForm.invalid || !this.selectedUser) return;

        this.loading = true;
        this.error = null;

        const request: UpdateRoleRequest = this.roleForm.value;
        const userId = this.selectedUser.id;

        this.userService.updateUserRole(userId, request).subscribe({
            next: () => {
                this.success = 'Role updated successfully';
                this.showRoleDialog = false;

                // Reload roles for this specific user
                this.userService.getUserRoles(userId).subscribe({
                    next: (roles) => {
                        // Update roles in users array
                        const userIndex = this.users.findIndex(u => u.id === userId);
                        if (userIndex !== -1) {
                            this.users[userIndex].roles = roles;
                        }

                        // Update roles in filtered users array
                        const filteredUserIndex = this.filteredUsers.findIndex(u => u.id === userId);
                        if (filteredUserIndex !== -1) {
                            this.filteredUsers[filteredUserIndex].roles = roles;
                        }

                        this.loading = false;
                    },
                    error: (err) => {
                        console.error('Failed to reload user roles:', err);
                        this.loading = false;
                    }
                });
            },
            error: (err) => {
                this.error = 'Failed to update role: ' + (err.error?.errorMessage || err.message);
                this.loading = false;
            }
        });
    }

    closeAllDialogs(): void {
        this.showCreateDialog = false;
        this.showEditDialog = false;
        this.showDeleteDialog = false;
        this.showPasswordDialog = false;
        this.showRoleDialog = false;
        this.error = null;
    }

    getUserRole(user: KeycloakUser): string {
        if (!user.roles || user.roles.length === 0) {
            return 'USER';
        }

        // Prioritize our custom roles
        const customRoles = ['ADMIN', 'MANAGER', 'USER'];
        for (const role of customRoles) {
            if (user.roles.includes(role)) {
                return role;
            }
        }

        // Return first role if no custom roles found
        return user.roles[0];
    }

    getRoleBadgeClass(role: string): string {
        switch (role) {
            case 'ADMIN': return 'badge-admin';
            case 'MANAGER': return 'badge-manager';
            case 'USER': return 'badge-user';
            default: return 'badge-default';
        }
    }

    formatDate(timestamp: number): string {
        return new Date(timestamp).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
