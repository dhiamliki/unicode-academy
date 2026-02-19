package com.unicodeacademy.backend.dto;

import java.util.List;

public class CourseResponse {
    private Long id;
    private String code;
    private String title;
    private String description;
    private ProgrammingLanguageResponse language;
    private List<LessonResponse> lessons;

    public CourseResponse() {
    }

    public CourseResponse(Long id,
                          String code,
                          String title,
                          String description,
                          ProgrammingLanguageResponse language,
                          List<LessonResponse> lessons) {
        this.id = id;
        this.code = code;
        this.title = title;
        this.description = description;
        this.language = language;
        this.lessons = lessons;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProgrammingLanguageResponse getLanguage() {
        return language;
    }

    public void setLanguage(ProgrammingLanguageResponse language) {
        this.language = language;
    }

    public List<LessonResponse> getLessons() {
        return lessons;
    }

    public void setLessons(List<LessonResponse> lessons) {
        this.lessons = lessons;
    }
}
