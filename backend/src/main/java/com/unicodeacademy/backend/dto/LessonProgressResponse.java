package com.unicodeacademy.backend.dto;

import com.unicodeacademy.backend.model.UserLessonProgress;

import java.time.Instant;

public class LessonProgressResponse {

    private Long lessonId;
    private Long courseId;
    private String lessonTitle;
    private Integer orderIndex;
    private UserLessonProgress.Status status;
    private boolean completed;
    private Instant completedAt;

    public LessonProgressResponse(Long lessonId, Long courseId, String lessonTitle, Integer orderIndex,
                                 UserLessonProgress.Status status, boolean completed, Instant completedAt) {
        this.lessonId = lessonId;
        this.courseId = courseId;
        this.lessonTitle = lessonTitle;
        this.orderIndex = orderIndex;
        this.status = status;
        this.completed = completed;
        this.completedAt = completedAt;
    }

    public Long getLessonId() { return lessonId; }
    public Long getCourseId() { return courseId; }
    public String getLessonTitle() { return lessonTitle; }
    public Integer getOrderIndex() { return orderIndex; }
    public UserLessonProgress.Status getStatus() { return status; }
    public boolean isCompleted() { return completed; }
    public Instant getCompletedAt() { return completedAt; }
}
