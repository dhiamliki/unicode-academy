package com.unicodeacademy.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class LessonResponse {
    private Long id;
    private String title;
    private String content;
    private String starterCode;
    private String editorLanguage;
    private String practiceLanguage;
    private String executionType;
    private String sampleOutput;
    private Integer orderIndex;
    private List<ExerciseResponse> exercises = new ArrayList<>();

    public LessonResponse() {
    }

    public LessonResponse(Long id, String title, String content, Integer orderIndex) {
        this(id, title, content, orderIndex, new ArrayList<>(), null, null, null, null, null);
    }

    public LessonResponse(Long id,
                          String title,
                          String content,
                          Integer orderIndex,
                          List<ExerciseResponse> exercises) {
        this(id, title, content, orderIndex, exercises, null, null, null, null, null);
    }

    public LessonResponse(Long id,
                          String title,
                          String content,
                          Integer orderIndex,
                          List<ExerciseResponse> exercises,
                          String starterCode,
                          String editorLanguage,
                          String practiceLanguage,
                          String executionType,
                          String sampleOutput) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.starterCode = starterCode;
        this.editorLanguage = editorLanguage;
        this.practiceLanguage = practiceLanguage;
        this.executionType = executionType;
        this.sampleOutput = sampleOutput;
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

    public String getStarterCode() {
        return starterCode;
    }

    public void setStarterCode(String starterCode) {
        this.starterCode = starterCode;
    }

    public String getEditorLanguage() {
        return editorLanguage;
    }

    public void setEditorLanguage(String editorLanguage) {
        this.editorLanguage = editorLanguage;
    }

    public String getSampleOutput() {
        return sampleOutput;
    }

    public void setSampleOutput(String sampleOutput) {
        this.sampleOutput = sampleOutput;
    }

    public String getPracticeLanguage() {
        return practiceLanguage;
    }

    public void setPracticeLanguage(String practiceLanguage) {
        this.practiceLanguage = practiceLanguage;
    }

    public String getExecutionType() {
        return executionType;
    }

    public void setExecutionType(String executionType) {
        this.executionType = executionType;
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
