package com.unicodeacademy.backend.dto;

public class CourseProgressSummaryItem {
    private Long courseId;
    private long totalLessons;
    private long completedLessons;
    private int percentage;

    public CourseProgressSummaryItem() {
    }

    public CourseProgressSummaryItem(Long courseId, long totalLessons, long completedLessons, int percentage) {
        this.courseId = courseId;
        this.totalLessons = totalLessons;
        this.completedLessons = completedLessons;
        this.percentage = percentage;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public long getTotalLessons() {
        return totalLessons;
    }

    public void setTotalLessons(long totalLessons) {
        this.totalLessons = totalLessons;
    }

    public long getCompletedLessons() {
        return completedLessons;
    }

    public void setCompletedLessons(long completedLessons) {
        this.completedLessons = completedLessons;
    }

    public int getPercentage() {
        return percentage;
    }

    public void setPercentage(int percentage) {
        this.percentage = percentage;
    }
}
