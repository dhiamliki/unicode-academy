package com.unicodeacademy.backend.dto;

public class StatsResponse {
    private long coursesCompleted;
    private long lessonsCompleted;
    private long exercisesAttempted;
    private long exercisesCorrect;
    private double accuracy;

    public StatsResponse(long coursesCompleted, long lessonsCompleted,
                         long exercisesAttempted, long exercisesCorrect, double accuracy) {
        this.coursesCompleted = coursesCompleted;
        this.lessonsCompleted = lessonsCompleted;
        this.exercisesAttempted = exercisesAttempted;
        this.exercisesCorrect = exercisesCorrect;
        this.accuracy = accuracy;
    }

    public long getCoursesCompleted() { return coursesCompleted; }
    public long getLessonsCompleted() { return lessonsCompleted; }
    public long getExercisesAttempted() { return exercisesAttempted; }
    public long getExercisesCorrect() { return exercisesCorrect; }
    public double getAccuracy() { return accuracy; }
}
