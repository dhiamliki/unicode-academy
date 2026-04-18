package com.unicodeacademy.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AdminProgrammingLanguageResponse {
    private Long id;
    private String code;
    private String name;
    private long courseCount;
}
