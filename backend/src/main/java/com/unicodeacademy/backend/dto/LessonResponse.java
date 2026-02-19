package com.unicodeacademy.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class LessonResponse {
    private Long id;
    private String title;
    private String content;
    private Integer orderIndex;
    private List<ExerciseResponse> exercises = new ArrayList<>();

    public LessonResponse() {
    }

    public LessonResponse(Long id, String title, String content, Integer orderIndex) {
        this(id, title, content, orderIndex, new ArrayList<>());
    }

    public LessonResponse(Long id,
                          String title,
                          String content,
                          Integer orderIndex,
                          List<ExerciseResponse> exercises) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.orderIndex = orderIndex;
        this.exercises = exercises != null ? exercises : new ArrayList<>();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public List<ExerciseResponse> getExercises() {
        return exercises;
    }

    public void setExercises(List<ExerciseResponse> exercises) {
        this.exercises = exercises != null ? exercises : new ArrayList<>();
    }
}
