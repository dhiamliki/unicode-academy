package com.unicodeacademy.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class AdminExerciseResponse {
    private Long id;
    private Long lessonId;
    private String lessonTitle;
    private String type;
    private String question;
    private List<String> choices;
    private String answer;
    private String explanation;
    private Integer orderIndex;
}
