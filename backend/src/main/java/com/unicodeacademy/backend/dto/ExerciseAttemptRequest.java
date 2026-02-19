package com.unicodeacademy.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class ExerciseAttemptRequest {
    @JsonAlias("answer")
    private String submittedAnswer;

    public String getSubmittedAnswer() {
        return submittedAnswer;
    }

    public void setSubmittedAnswer(String submittedAnswer) {
        this.submittedAnswer = submittedAnswer;
    }
}
