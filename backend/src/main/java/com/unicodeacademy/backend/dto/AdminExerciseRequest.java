package com.unicodeacademy.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class AdminExerciseRequest {

    @NotBlank(message = "Le type d'exercice est obligatoire")
    private String type;

    @NotBlank(message = "La question de l'exercice est obligatoire")
    @Size(max = 2000, message = "La question de l'exercice ne doit pas depasser 2000 caracteres")
    private String question;

    private List<String> choices = new ArrayList<>();

    @NotBlank(message = "La reponse attendue est obligatoire")
    @Size(max = 1000, message = "La reponse attendue ne doit pas depasser 1000 caracteres")
    private String answer;

    @Size(max = 4000, message = "L'explication ne doit pas depasser 4000 caracteres")
    private String explanation;

    @NotNull(message = "L'ordre de l'exercice est obligatoire")
    @Min(value = 1, message = "L'ordre de l'exercice doit etre superieur ou egal a 1")
    private Integer orderIndex;
}
