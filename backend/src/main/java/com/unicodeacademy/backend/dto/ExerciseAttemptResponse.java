package com.unicodeacademy.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ExerciseAttemptResponse {
    private boolean isCorrect;
    private String explanation;
    private String correctAnswer;

    public ExerciseAttemptResponse(boolean isCorrect, String explanation, String correctAnswer) {
        this.isCorrect = isCorrect;
        this.explanation = explanation;
        this.correctAnswer = correctAnswer;
    }

    @JsonProperty("isCorrect")
    public boolean isCorrect() {
        return isCorrect;
    }

    public String getExplanation() {
        return explanation;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }
}
