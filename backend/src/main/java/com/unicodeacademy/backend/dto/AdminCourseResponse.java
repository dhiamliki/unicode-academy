package com.unicodeacademy.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AdminCourseResponse {
    private Long id;
    private String code;
    private String title;
    private String description;
    private Long languageId;
    private String languageCode;
    private String languageName;
    private long lessonCount;
    private long attachmentCount;
    private long enrolledUsersCount;
    private long completedUsersCount;
}
