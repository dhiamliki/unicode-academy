package com.unicodeacademy.backend.dto;

public class UpdateUserRoleRequest {
    private String role;

    public UpdateUserRoleRequest() {
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
