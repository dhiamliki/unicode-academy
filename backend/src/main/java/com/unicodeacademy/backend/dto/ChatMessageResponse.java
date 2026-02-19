package com.unicodeacademy.backend.dto;

import java.time.Instant;

public class ChatMessageResponse {
    private Long id;
    private Long userId;
    private String username;
    private String senderEmail;
    private String senderRole;
    private String attachmentUrl;
    private String attachmentName;
    private String content;
    private String roomType;
    private Long courseId;
    private Instant createdAt;

    public ChatMessageResponse() {
    }

    public ChatMessageResponse(Long id,
                               Long userId,
                               String username,
                               String senderEmail,
                               String senderRole,
                               String attachmentUrl,
                               String attachmentName,
                               String content,
                               String roomType,
                               Long courseId,
                               Instant createdAt) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.senderEmail = senderEmail;
        this.senderRole = senderRole;
        this.attachmentUrl = attachmentUrl;
        this.attachmentName = attachmentName;
        this.content = content;
        this.roomType = roomType;
        this.courseId = courseId;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }

    public String getAttachmentUrl() {
        return attachmentUrl;
    }

    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }

    public String getSenderRole() {
        return senderRole;
    }

    public void setSenderRole(String senderRole) {
        this.senderRole = senderRole;
    }

    public String getAttachmentName() {
        return attachmentName;
    }

    public void setAttachmentName(String attachmentName) {
        this.attachmentName = attachmentName;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
