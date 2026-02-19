package com.unicodeacademy.backend.dto;

import com.unicodeacademy.backend.model.UserCourseProgress;

import java.time.Instant;

public class ProgressResponse {
    private Long courseId;
    private String courseCode;
    private String languageCode;
    private boolean completed;
    private Instant completedAt;
    private UserCourseProgress.Status status;

    public ProgressResponse() {
    }

    public ProgressResponse(Long courseId,
                            String courseCode,
                            String languageCode,
                            boolean completed,
                            Instant completedAt,
                            UserCourseProgress.Status status) {
        this.courseId = courseId;
        this.courseCode = courseCode;
        this.languageCode = languageCode;
        this.completed = completed;
        this.completedAt = completedAt;
        this.status = status;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getLanguageCode() {
        return languageCode;
    }

    public void setLanguageCode(String languageCode) {
        this.languageCode = languageCode;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public UserCourseProgress.Status getStatus() {
        return status;
    }

    public void setStatus(UserCourseProgress.Status status) {
        this.status = status;
    }
}
