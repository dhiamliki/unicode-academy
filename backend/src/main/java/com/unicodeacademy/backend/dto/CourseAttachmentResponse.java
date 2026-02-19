package com.unicodeacademy.backend.dto;

import java.time.Instant;

public class CourseAttachmentResponse {
    private Long id;
    private Long courseId;
    private String originalName;
    private long sizeBytes;
    private Instant uploadedAt;

    public CourseAttachmentResponse() {
    }

    public CourseAttachmentResponse(Long id, Long courseId, String originalName, long sizeBytes, Instant uploadedAt) {
        this.id = id;
        this.courseId = courseId;
        this.originalName = originalName;
        this.sizeBytes = sizeBytes;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getOriginalName() {
        return originalName;
    }

    public void setOriginalName(String originalName) {
        this.originalName = originalName;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
