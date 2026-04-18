package com.unicodeacademy.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProgrammingLanguageRequest {

    @NotBlank(message = "Le code du langage est obligatoire")
    @Size(max = 30, message = "Le code du langage ne doit pas depasser 30 caracteres")
    private String code;

    @NotBlank(message = "Le nom du langage est obligatoire")
    @Size(max = 60, message = "Le nom du langage ne doit pas depasser 60 caracteres")
    private String name;
}
