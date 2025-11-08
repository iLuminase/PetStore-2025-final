package com.auth_api.service;

import com.auth_api.dto.user.*;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class KeycloakAdminService {

    @Autowired
    private Keycloak keycloak;

    @Value("${keycloak.realm}")
    private String realm;

    /**
     * Get all users from Keycloak
     */
    public List<KeycloakUserDTO> getAllUsers() {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();
            
            List<UserRepresentation> users = usersResource.list();
            
            return users.stream().map(this::mapToDTO).collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch users from Keycloak: " + e.getMessage(), e);
        }
    }

    /**
     * Get user by ID
     */
    public KeycloakUserDTO getUserById(String userId) {
        try {
            UserResource userResource = getUserResource(userId);
            UserRepresentation user = userResource.toRepresentation();
            return mapToDTO(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch user: " + e.getMessage(), e);
        }
    }

    /**
     * Create a new user
     */
    public String createUser(CreateUserRequest request) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();

            // Create user representation
            UserRepresentation user = new UserRepresentation();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEnabled(request.getEnabled());
            user.setEmailVerified(request.getEmailVerified());

            // Create user
            Response response = usersResource.create(user);
            
            if (response.getStatus() != 201) {
                throw new RuntimeException("Failed to create user. Status: " + response.getStatus());
            }

            // Get user ID from response
            String userId = getCreatedId(response);
            
            // Set password
            setUserPassword(userId, request.getPassword(), false);
            
            // Assign default role (USER)
            assignRole(userId, request.getRole() != null ? request.getRole() : "USER");
            
            return userId;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create user: " + e.getMessage(), e);
        }
    }

    /**
     * Update user information
     */
    public void updateUser(String userId, UpdateUserRequest request) {
        try {
            UserResource userResource = getUserResource(userId);
            UserRepresentation user = userResource.toRepresentation();

            // Update fields if provided
            if (request.getEmail() != null) {
                user.setEmail(request.getEmail());
            }
            if (request.getFirstName() != null) {
                user.setFirstName(request.getFirstName());
            }
            if (request.getLastName() != null) {
                user.setLastName(request.getLastName());
            }
            if (request.getEnabled() != null) {
                user.setEnabled(request.getEnabled());
            }
            if (request.getEmailVerified() != null) {
                user.setEmailVerified(request.getEmailVerified());
            }

            userResource.update(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update user: " + e.getMessage(), e);
        }
    }

    /**
     * Delete user
     */
    public void deleteUser(String userId) {
        try {
            UserResource userResource = getUserResource(userId);
            userResource.remove();
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete user: " + e.getMessage(), e);
        }
    }

    /**
     * Reset user password
     */
    public void resetPassword(String userId, ResetPasswordRequest request) {
        try {
            setUserPassword(userId, request.getNewPassword(), request.getTemporary());
        } catch (Exception e) {
            throw new RuntimeException("Failed to reset password: " + e.getMessage(), e);
        }
    }

    /**
     * Update user role
     */
    public void updateUserRole(String userId, String newRole) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = getUserResource(userId);

            // Get all realm roles
            List<String> allRoles = Arrays.asList("USER", "MANAGER", "ADMIN");

            // Remove all existing roles
            for (String roleName : allRoles) {
                try {
                    RoleRepresentation role = realmResource.roles().get(roleName).toRepresentation();
                    userResource.roles().realmLevel().remove(Collections.singletonList(role));
                } catch (Exception e) {
                    // Role might not exist or user doesn't have it, continue
                }
            }

            // Assign new role
            assignRole(userId, newRole);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update user role: " + e.getMessage(), e);
        }
    }

    /**
     * Get user roles
     */
    public List<String> getUserRoles(String userId) {
        try {
            UserResource userResource = getUserResource(userId);
            return userResource.roles().realmLevel().listAll().stream()
                    .map(RoleRepresentation::getName)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch user roles: " + e.getMessage(), e);
        }
    }

    /**
     * Search users by username or email
     */
    public List<KeycloakUserDTO> searchUsers(String query) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();
            
            List<UserRepresentation> users = usersResource.search(query);
            
            return users.stream().map(this::mapToDTO).collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to search users: " + e.getMessage(), e);
        }
    }

    // ========== Helper Methods ==========

    private UserResource getUserResource(String userId) {
        RealmResource realmResource = keycloak.realm(realm);
        return realmResource.users().get(userId);
    }

    private void setUserPassword(String userId, String password, boolean temporary) {
        UserResource userResource = getUserResource(userId);
        
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);
        credential.setTemporary(temporary);
        
        userResource.resetPassword(credential);
    }

    private void assignRole(String userId, String roleName) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = getUserResource(userId);
            
            // Get role by name
            RoleRepresentation role = realmResource.roles().get(roleName).toRepresentation();
            
            // Assign role to user
            userResource.roles().realmLevel().add(Collections.singletonList(role));
        } catch (Exception e) {
            // If role doesn't exist, create it first
            createRealmRole(roleName);
            // Then try to assign again
            assignRole(userId, roleName);
        }
    }

    private void createRealmRole(String roleName) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            RoleRepresentation role = new RoleRepresentation();
            role.setName(roleName);
            realmResource.roles().create(role);
        } catch (Exception e) {
            // Role might already exist, ignore
        }
    }

    private String getCreatedId(Response response) {
        String location = response.getHeaderString("Location");
        if (location == null) {
            throw new RuntimeException("Failed to get created user ID");
        }
        return location.substring(location.lastIndexOf('/') + 1);
    }

    private KeycloakUserDTO mapToDTO(UserRepresentation user) {
        KeycloakUserDTO dto = new KeycloakUserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEnabled(user.isEnabled());
        dto.setEmailVerified(user.isEmailVerified());
        dto.setCreatedTimestamp(user.getCreatedTimestamp());
        dto.setAttributes(user.getAttributes());
        
        // Get user roles
        try {
            List<String> roles = getUserRoles(user.getId());
            dto.setRoles(roles);
        } catch (Exception e) {
            dto.setRoles(new ArrayList<>());
        }
        
        return dto;
    }
}
