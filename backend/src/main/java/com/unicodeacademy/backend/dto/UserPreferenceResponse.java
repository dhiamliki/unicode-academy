package com.unicodeacademy.backend.dto;

public class UserPreferenceResponse {
    private String languageCode;

    public UserPreferenceResponse() {
    }

    public UserPreferenceResponse(String languageCode) {
        this.languageCode = languageCode;
    }

    public String getLanguageCode() {
        return languageCode;
    }

    public void setLanguageCode(String languageCode) {
        this.languageCode = languageCode;
    }
}
