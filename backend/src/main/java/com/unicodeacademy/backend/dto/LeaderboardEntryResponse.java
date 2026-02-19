package com.unicodeacademy.backend.dto;

public class LeaderboardEntryResponse {
    private int rank;
    private String username;
    private long points;
    private long completedLessons;
    private long correctExercises;

    public LeaderboardEntryResponse() {
    }

    public LeaderboardEntryResponse(int rank,
                                    String username,
                                    long points,
                                    long completedLessons,
                                    long correctExercises) {
        this.rank = rank;
        this.username = username;
        this.points = points;
        this.completedLessons = completedLessons;
        this.correctExercises = correctExercises;
    }

    public int getRank() {
        return rank;
    }

    public void setRank(int rank) {
        this.rank = rank;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public long getPoints() {
        return points;
    }

    public void setPoints(long points) {
        this.points = points;
    }

    public long getCompletedLessons() {
        return completedLessons;
    }

    public void setCompletedLessons(long completedLessons) {
        this.completedLessons = completedLessons;
    }

    public long getCorrectExercises() {
        return correctExercises;
    }

    public void setCorrectExercises(long correctExercises) {
        this.correctExercises = correctExercises;
    }
}
