package com.unicodeacademy.backend.dto;

public class UserPreferenceRequest {
    private String languageCode;

    public UserPreferenceRequest() {
    }

    public String getLanguageCode() {
        return languageCode;
    }

    public void setLanguageCode(String languageCode) {
        this.languageCode = languageCode;
    }
}
