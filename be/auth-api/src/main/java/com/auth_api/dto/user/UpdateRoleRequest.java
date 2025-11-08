package com.auth_api.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateRoleRequest {
    
    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(USER|MANAGER|ADMIN)$", message = "Role must be USER, MANAGER, or ADMIN")
    private String role;

    // Constructors
    public UpdateRoleRequest() {}

    // Getters and Setters
    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
