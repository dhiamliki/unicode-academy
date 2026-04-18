package com.unicodeacademy.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AdminLessonResponse {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private String title;
    private String content;
    private Integer orderIndex;
    private String starterCode;
    private String editorLanguage;
    private String executionType;
    private String sampleOutput;
    private long exerciseCount;
}
