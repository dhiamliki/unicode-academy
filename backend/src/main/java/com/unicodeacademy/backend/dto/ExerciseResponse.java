package com.unicodeacademy.backend.dto;

import com.unicodeacademy.backend.model.Exercise;

import java.util.ArrayList;
import java.util.List;

public class ExerciseResponse {
    private Long id;
    private Exercise.ExerciseType type;
    private String question;
    private List<String> choices = new ArrayList<>();
    private String explanation;
    private Integer orderIndex;

    public ExerciseResponse() {
    }

    public ExerciseResponse(Long id,
                            Exercise.ExerciseType type,
                            String question,
                            List<String> choices,
                            String explanation,
                            Integer orderIndex) {
        this.id = id;
        this.type = type;
        this.question = question;
        this.choices = choices;
        this.explanation = explanation;
        this.orderIndex = orderIndex;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Exercise.ExerciseType getType() {
        return type;
    }

    public void setType(Exercise.ExerciseType type) {
        this.type = type;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public List<String> getChoices() {
        return choices;
    }

    public void setChoices(List<String> choices) {
        this.choices = choices;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
}
