package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.UserPreferenceRequest;
import com.unicodeacademy.backend.dto.UserPreferenceResponse;
import com.unicodeacademy.backend.model.ProgrammingLanguage;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.repository.ProgrammingLanguageRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
public class UserPreferenceController {

    private final UserRepository userRepository;
    private final ProgrammingLanguageRepository languageRepository;

    public UserPreferenceController(UserRepository userRepository,
                                    ProgrammingLanguageRepository languageRepository) {
        this.userRepository = userRepository;
        this.languageRepository = languageRepository;
    }

    @GetMapping("/preference")
    public UserPreferenceResponse getPreference(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow();
        ProgrammingLanguage preferred = user.getPreferredLanguage();
        String code = preferred != null ? preferred.getCode() : null;
        return new UserPreferenceResponse(code);
    }

    @PostMapping("/preference")
    public UserPreferenceResponse setPreference(@RequestBody UserPreferenceRequest request,
                                                Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow();

        String code = request.getLanguageCode();
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("languageCode is required");
        }

        ProgrammingLanguage language = languageRepository.findByCodeIgnoreCase(code)
                .orElseThrow();

        user.setPreferredLanguage(language);
        userRepository.save(user);

        return new UserPreferenceResponse(language.getCode());
    }
}
