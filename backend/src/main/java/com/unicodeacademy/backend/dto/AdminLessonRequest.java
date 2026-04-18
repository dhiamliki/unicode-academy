package com.unicodeacademy.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminLessonRequest {

    @NotBlank(message = "Le titre de la lecon est obligatoire")
    @Size(max = 255, message = "Le titre de la lecon ne doit pas depasser 255 caracteres")
    private String title;

    @Size(max = 4000, message = "Le contenu de la lecon ne doit pas depasser 4000 caracteres")
    private String content;

    @NotNull(message = "L'ordre de la lecon est obligatoire")
    @Min(value = 1, message = "L'ordre de la lecon doit etre superieur ou egal a 1")
    private Integer orderIndex;

    @Size(max = 20000, message = "Le code de depart ne doit pas depasser 20000 caracteres")
    private String starterCode;

    @Size(max = 50, message = "Le langage de l'editeur ne doit pas depasser 50 caracteres")
    private String editorLanguage;

    @Size(max = 40, message = "Le type d'execution ne doit pas depasser 40 caracteres")
    private String executionType;

    @Size(max = 4000, message = "La sortie d'exemple ne doit pas depasser 4000 caracteres")
    private String sampleOutput;
}
