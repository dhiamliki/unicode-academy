package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.AdminUserResponse;
import com.unicodeacademy.backend.dto.UpdateUserRoleRequest;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.repository.UserCourseProgressRepository;
import com.unicodeacademy.backend.repository.UserExerciseAttemptRepository;
import com.unicodeacademy.backend.repository.UserLessonProgressRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import com.unicodeacademy.backend.service.AccountTerminationEmailService;
import com.unicodeacademy.backend.util.TextEncodingFixer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final UserCourseProgressRepository userCourseProgressRepository;
    private final UserLessonProgressRepository userLessonProgressRepository;
    private final UserExerciseAttemptRepository userExerciseAttemptRepository;
    private final AccountTerminationEmailService accountTerminationEmailService;

    @GetMapping
    public List<AdminUserResponse> listUsers() {
        return userRepository.findAll(Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @PatchMapping("/{id}/role")
    public AdminUserResponse updateRole(@PathVariable Long id,
                                        @RequestBody UpdateUserRoleRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        User.Role nextRole = parseRole(request);

        if (user.getRole() == User.Role.ADMIN
                && nextRole == User.Role.USER
                && userRepository.countByRole(User.Role.ADMIN) <= 1) {
            throw new IllegalStateException("At least one ADMIN account is required");
        }

        user.setRole(nextRole);
        return toResponse(userRepository.save(user));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void deleteUser(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));

        String currentEmail = authentication.getName();
        if (user.getEmail() != null && user.getEmail().equalsIgnoreCase(currentEmail)) {
            throw new IllegalStateException("You cannot delete your own account");
        }

        if (user.getRole() == User.Role.ADMIN && userRepository.countByRole(User.Role.ADMIN) <= 1) {
            throw new IllegalStateException("At least one ADMIN account is required");
        }

        String terminatedEmail = user.getEmail();
        String terminatedUsername = user.getUsername();

        Long userId = user.getId();
        userLessonProgressRepository.deleteByUserId(userId);
        userCourseProgressRepository.deleteByUserId(userId);
        userExerciseAttemptRepository.deleteByUserId(userId);
        userRepository.delete(user);

        scheduleTerminationEmailAfterCommit(terminatedEmail, terminatedUsername);
    }

    private User.Role parseRole(UpdateUserRoleRequest request) {
        if (request == null || request.getRole() == null || request.getRole().isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }

        String normalized = request.getRole().trim().toUpperCase(Locale.ROOT);
        try {
            return User.Role.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Role must be ADMIN or USER");
        }
    }

    private AdminUserResponse toResponse(User user) {
        User.Role role = user.getRole() != null ? user.getRole() : User.Role.USER;
        return new AdminUserResponse(
                user.getId(),
                TextEncodingFixer.fix(user.getUsername()),
                user.getEmail(),
                role.name(),
                user.getCreatedAt()
        );
    }

    private void scheduleTerminationEmailAfterCommit(String email, String username) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            accountTerminationEmailService.sendAdminTerminationEmail(email, username);
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                accountTerminationEmailService.sendAdminTerminationEmail(email, username);
            }
        });
    }
}
