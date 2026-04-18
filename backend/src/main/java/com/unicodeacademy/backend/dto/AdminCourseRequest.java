package com.unicodeacademy.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCourseRequest {

    @NotBlank(message = "Le code du cours est obligatoire")
    @Size(max = 40, message = "Le code du cours ne doit pas depasser 40 caracteres")
    private String code;

    @NotBlank(message = "Le titre du cours est obligatoire")
    @Size(max = 160, message = "Le titre du cours ne doit pas depasser 160 caracteres")
    private String title;

    @Size(max = 1000, message = "La description du cours ne doit pas depasser 1000 caracteres")
    private String description;

    @NotNull(message = "Le langage du cours est obligatoire")
    private Long languageId;
}
