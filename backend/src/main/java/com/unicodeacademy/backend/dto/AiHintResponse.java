package com.unicodeacademy.backend.dto;

public class AiHintResponse {

    private String hint;
    private boolean fallback;
    private String fallbackReason;

    public AiHintResponse() {
    }

    public AiHintResponse(String hint, boolean fallback, String fallbackReason) {
        this.hint = hint;
        this.fallback = fallback;
        this.fallbackReason = fallbackReason;
    }

    public String getHint() {
        return hint;
    }

    public void setHint(String hint) {
        this.hint = hint;
    }

    public boolean isFallback() {
        return fallback;
    }

    public void setFallback(boolean fallback) {
        this.fallback = fallback;
    }

    public String getFallbackReason() {
        return fallbackReason;
    }

    public void setFallbackReason(String fallbackReason) {
        this.fallbackReason = fallbackReason;
    }
}
