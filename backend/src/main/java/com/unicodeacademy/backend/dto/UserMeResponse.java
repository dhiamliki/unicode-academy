package com.unicodeacademy.backend.dto;

public class UserMeResponse {
    private String username;
    private String email;
    private String role;
    private String avatarUrl;
    private String preferredLanguageCode;
    private String preferredLanguageName;

    public UserMeResponse() {
    }

    public UserMeResponse(String username,
                          String email,
                          String role,
                          String avatarUrl,
                          String preferredLanguageCode,
                          String preferredLanguageName) {
        this.username = username;
        this.email = email;
        this.role = role;
        this.avatarUrl = avatarUrl;
        this.preferredLanguageCode = preferredLanguageCode;
        this.preferredLanguageName = preferredLanguageName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getPreferredLanguageCode() {
        return preferredLanguageCode;
    }

    public void setPreferredLanguageCode(String preferredLanguageCode) {
        this.preferredLanguageCode = preferredLanguageCode;
    }

    public String getPreferredLanguageName() {
        return preferredLanguageName;
    }

    public void setPreferredLanguageName(String preferredLanguageName) {
        this.preferredLanguageName = preferredLanguageName;
    }
}
