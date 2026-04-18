package com.unicodeacademy.backend.dto;

import java.time.Instant;

public class AdminUserResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private Instant createdAt;
    private long completedCoursesCount;
    private long completedLessonsCount;
    private long correctExercisesCount;
    private long totalPoints;

    public AdminUserResponse() {
    }

    public AdminUserResponse(Long id, String username, String email, String role, Instant createdAt,
                             long completedCoursesCount, long completedLessonsCount,
                             long correctExercisesCount, long totalPoints) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
        this.completedCoursesCount = completedCoursesCount;
        this.completedLessonsCount = completedLessonsCount;
        this.correctExercisesCount = correctExercisesCount;
        this.totalPoints = totalPoints;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public long getCompletedCoursesCount() {
        return completedCoursesCount;
    }

    public void setCompletedCoursesCount(long completedCoursesCount) {
        this.completedCoursesCount = completedCoursesCount;
    }

    public long getCompletedLessonsCount() {
        return completedLessonsCount;
    }

    public void setCompletedLessonsCount(long completedLessonsCount) {
        this.completedLessonsCount = completedLessonsCount;
    }

    public long getCorrectExercisesCount() {
        return correctExercisesCount;
    }

    public void setCorrectExercisesCount(long correctExercisesCount) {
        this.correctExercisesCount = correctExercisesCount;
    }

    public long getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(long totalPoints) {
        this.totalPoints = totalPoints;
    }
}
