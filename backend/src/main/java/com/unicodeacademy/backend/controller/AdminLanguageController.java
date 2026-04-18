package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.AdminProgrammingLanguageRequest;
import com.unicodeacademy.backend.dto.AdminProgrammingLanguageResponse;
import com.unicodeacademy.backend.service.AdminContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/languages")
@RequiredArgsConstructor
public class AdminLanguageController {

    private final AdminContentService adminContentService;

    @GetMapping
    public List<AdminProgrammingLanguageResponse> listLanguages() {
        return adminContentService.listLanguages();
    }

    @PostMapping
    public AdminProgrammingLanguageResponse createLanguage(@Valid @RequestBody AdminProgrammingLanguageRequest request) {
        return adminContentService.createLanguage(request);
    }

    @PutMapping("/{id}")
    public AdminProgrammingLanguageResponse updateLanguage(@PathVariable Long id,
                                                           @Valid @RequestBody AdminProgrammingLanguageRequest request) {
        return adminContentService.updateLanguage(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteLanguage(@PathVariable Long id) {
        adminContentService.deleteLanguage(id);
    }
}
