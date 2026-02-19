package com.unicodeacademy.backend.dto;

public class ProgressSummaryTotals {
    private long completedCourses;
    private long completedLessons;
    private long attemptedExercises;
    private long correctExercises;

    public ProgressSummaryTotals() {
    }

    public ProgressSummaryTotals(long completedCourses,
                                 long completedLessons,
                                 long attemptedExercises,
                                 long correctExercises) {
        this.completedCourses = completedCourses;
        this.completedLessons = completedLessons;
        this.attemptedExercises = attemptedExercises;
        this.correctExercises = correctExercises;
    }

    public long getCompletedCourses() {
        return completedCourses;
    }

    public void setCompletedCourses(long completedCourses) {
        this.completedCourses = completedCourses;
    }

    public long getCompletedLessons() {
        return completedLessons;
    }

    public void setCompletedLessons(long completedLessons) {
        this.completedLessons = completedLessons;
    }

    public long getAttemptedExercises() {
        return attemptedExercises;
    }

    public void setAttemptedExercises(long attemptedExercises) {
        this.attemptedExercises = attemptedExercises;
    }

    public long getCorrectExercises() {
        return correctExercises;
    }

    public void setCorrectExercises(long correctExercises) {
        this.correctExercises = correctExercises;
    }
}
