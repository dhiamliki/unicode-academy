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
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private static final long MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
    private static final String AVATAR_URL_PREFIX = "/api/users/avatars/";
    private static final Path AVATAR_UPLOAD_DIR = Paths.get("uploads", "avatars");

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
                user.getAvatarUrl(),
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
            throw new IllegalArgumentException("currentPassword est obligatoire");
        }
        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new IllegalArgumentException("newPassword est obligatoire");
        }
        if (request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("newPassword doit contenir au moins 6 caracteres");
        }

        User user = currentUser(auth);
        if (!matchesPassword(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Le mot de passe actuel est incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadAvatar(@RequestParam("file") MultipartFile file,
                                                             Authentication auth) {
        User user = currentUser(auth);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le fichier avatar est obligatoire");
        }
        if (file.getSize() > MAX_AVATAR_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "L'avatar doit faire 5 Mo maximum");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'avatar doit etre une image");
        }

        String originalName = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "avatar" : file.getOriginalFilename()
        );
        String extension = resolveImageExtension(originalName);
        String storedName = UUID.randomUUID().toString().replace("-", "") + extension;

        try {
            Files.createDirectories(AVATAR_UPLOAD_DIR);
            Path target = AVATAR_UPLOAD_DIR.resolve(storedName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Impossible d'enregistrer l'avatar");
        }

        deleteExistingAvatarFile(user.getAvatarUrl());
        String avatarUrl = AVATAR_URL_PREFIX + storedName;
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
    }

    @GetMapping("/avatars/{filename:.+}")
    public ResponseEntity<Resource> getAvatar(@PathVariable String filename) {
        try {
            Path baseDir = AVATAR_UPLOAD_DIR.toAbsolutePath().normalize();
            Path filePath = baseDir.resolve(filename).normalize();
            if (!filePath.startsWith(baseDir)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom de fichier invalide");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Avatar introuvable");
            }

            MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
            String detectedType = Files.probeContentType(filePath);
            if (detectedType != null && !detectedType.isBlank()) {
                try {
                    mediaType = MediaType.parseMediaType(detectedType);
                } catch (IllegalArgumentException ignored) {
                    mediaType = MediaType.APPLICATION_OCTET_STREAM;
                }
            }

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                    .body(resource);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Avatar introuvable");
        }
    }

    @DeleteMapping("/me")
    @Transactional
    public void deleteMyAccount(Authentication auth) {
        User user = currentUser(auth);
        Long userId = user.getId();
        deleteExistingAvatarFile(user.getAvatarUrl());
        userLessonProgressRepository.deleteByUserId(userId);
        userCourseProgressRepository.deleteByUserId(userId);
        userExerciseAttemptRepository.deleteByUserId(userId);
        userRepository.delete(user);
    }

    private User currentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
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

    private String resolveImageExtension(String originalName) {
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex >= originalName.length() - 1) {
            return "";
        }

        String extension = originalName.substring(dotIndex).toLowerCase(Locale.ROOT);
        if (!extension.matches("\\.[a-z0-9]{1,6}")) {
            return "";
        }
        return extension;
    }

    private void deleteExistingAvatarFile(String avatarUrl) {
        String fileName = extractAvatarFileName(avatarUrl);
        if (fileName == null) {
            return;
        }

        try {
            Path baseDir = AVATAR_UPLOAD_DIR.toAbsolutePath().normalize();
            Path existingFile = baseDir.resolve(fileName).normalize();
            if (existingFile.startsWith(baseDir)) {
                Files.deleteIfExists(existingFile);
            }
        } catch (IOException ignored) {
            // Best-effort cleanup only.
        }
    }

    private String extractAvatarFileName(String avatarUrl) {
        if (avatarUrl == null || avatarUrl.isBlank() || !avatarUrl.startsWith(AVATAR_URL_PREFIX)) {
            return null;
        }

        String fileName = avatarUrl.substring(AVATAR_URL_PREFIX.length()).trim();
        if (fileName.isBlank() || fileName.contains("/") || fileName.contains("\\")) {
            return null;
        }
        return fileName;
    }
}
