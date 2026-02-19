package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.ChangePasswordRequest;
import com.unicodeacademy.backend.dto.UserMeResponse;
import com.unicodeacademy.backend.model.ProgrammingLanguage;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.repository.UserCourseProgressRepository;
import com.unicodeacademy.backend.repository.UserExerciseAttemptRepository;
import com.unicodeacademy.backend.repository.UserLessonProgressRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import com.unicodeacademy.backend.util.TextEncodingFixer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserCourseProgressRepository userCourseProgressRepository;
    private final UserLessonProgressRepository userLessonProgressRepository;
    private final UserExerciseAttemptRepository userExerciseAttemptRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public UserMeResponse me(Authentication auth) {
        User user = currentUser(auth);
        ProgrammingLanguage preferredLanguage = user.getPreferredLanguage();
        return new UserMeResponse(
                TextEncodingFixer.fix(user.getUsername()),
                user.getEmail(),
                user.getRole() != null ? user.getRole().name() : User.Role.USER.name(),
                preferredLanguage != null ? preferredLanguage.getCode() : null,
                preferredLanguage != null ? TextEncodingFixer.fix(preferredLanguage.getName()) : null
        );
    }

    @GetMapping("/usernames")
    public List<String> usernames(Authentication auth) {
        currentUser(auth);
        return userRepository.findAllNonBlankUsernames()
                .stream()
                .map(TextEncodingFixer::fix)
                .toList();
    }

    @PutMapping("/change-password")
    public void changePassword(@RequestBody ChangePasswordRequest request, Authentication auth) {
        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            throw new IllegalArgumentException("currentPassword is required");
        }
        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new IllegalArgumentException("newPassword is required");
        }
        if (request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("newPassword must be at least 6 characters");
        }

        User user = currentUser(auth);
        if (!matchesPassword(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @DeleteMapping("/me")
    @Transactional
    public void deleteMyAccount(Authentication auth) {
        User user = currentUser(auth);
        Long userId = user.getId();
        userLessonProgressRepository.deleteByUserId(userId);
        userCourseProgressRepository.deleteByUserId(userId);
        userExerciseAttemptRepository.deleteByUserId(userId);
        userRepository.delete(user);
    }

    private User currentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName()).orElseThrow();
    }

    private boolean matchesPassword(String rawPassword, String storedPassword) {
        if (storedPassword == null || storedPassword.isBlank()) {
            return rawPassword.isBlank();
        }
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }
        return storedPassword.equals(rawPassword);
    }
}
