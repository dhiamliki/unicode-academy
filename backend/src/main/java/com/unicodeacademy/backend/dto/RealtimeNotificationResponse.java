package com.unicodeacademy.backend.dto;

import java.time.Instant;

public class RealtimeNotificationResponse {
    private String type;
    private String message;
    private String event;
    private Long courseId;
    private String attachmentName;
    private Instant createdAt;

    public RealtimeNotificationResponse() {
    }

    public RealtimeNotificationResponse(String type,
                                        String message,
                                        String event,
                                        Long courseId,
                                        String attachmentName,
                                        Instant createdAt) {
        this.type = type;
        this.message = message;
        this.event = event;
        this.courseId = courseId;
        this.attachmentName = attachmentName;
        this.createdAt = createdAt;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getEvent() {
        return event;
    }

    public void setEvent(String event) {
        this.event = event;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getAttachmentName() {
        return attachmentName;
    }

    public void setAttachmentName(String attachmentName) {
        this.attachmentName = attachmentName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
