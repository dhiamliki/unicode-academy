package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.ProgrammingLanguageResponse;
import com.unicodeacademy.backend.model.ProgrammingLanguage;
import com.unicodeacademy.backend.repository.ProgrammingLanguageRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/languages")
public class LanguageController {

    private final ProgrammingLanguageRepository languageRepository;

    public LanguageController(ProgrammingLanguageRepository languageRepository) {
        this.languageRepository = languageRepository;
    }

    @GetMapping
    public List<ProgrammingLanguageResponse> allLanguages() {
        return languageRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ProgrammingLanguageResponse toResponse(ProgrammingLanguage language) {
        return new ProgrammingLanguageResponse(
                language.getId(),
                language.getCode(),
                language.getName()
        );
    }
}
