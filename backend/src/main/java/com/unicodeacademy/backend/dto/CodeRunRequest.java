package com.unicodeacademy.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CodeRunRequest {

    @NotBlank(message = "La langue est obligatoire")
    private String language;

    @NotBlank(message = "Le code est obligatoire")
    @Size(max = 20000, message = "Le code depasse la taille maximale autorisee")
    private String code;

    @Size(max = 4000, message = "L'entree stdin depasse la taille maximale autorisee")
    private String stdin;

    public CodeRunRequest() {
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getStdin() {
        return stdin;
    }

    public void setStdin(String stdin) {
        this.stdin = stdin;
    }
}
