package com.unicodeacademy.backend.service;

import com.unicodeacademy.backend.dto.ChatMessageResponse;
import com.unicodeacademy.backend.model.ChatMessage;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.repository.CourseRepository;
import com.unicodeacademy.backend.repository.ChatMessageRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private static final String CHAT_ATTACHMENT_PREFIX = "/api/chat/files/";
    private static final Path CHAT_UPLOAD_DIR = Paths.get("uploads", "chat");

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @Value("${app.chat.retention-hours:24}")
    private long retentionHours;

    public ChatMessage createGlobalMessage(String email, String content) {
        return buildAndSaveMessage(email, content, null, null, true, ChatMessage.RoomType.GLOBAL, null);
    }

    public ChatMessage createCourseMessage(String email, String content, Long courseId) {
        return buildAndSaveMessage(email, content, null, null, true, ChatMessage.RoomType.COURSE, courseId);
    }

    public ChatMessage createGlobalAttachmentMessage(String email, String content, String attachmentUrl, String attachmentName) {
        return buildAndSaveMessage(
                email,
                content,
                attachmentUrl,
                attachmentName,
                false,
                ChatMessage.RoomType.GLOBAL,
                null
        );
    }

    public ChatMessage createCourseAttachmentMessage(String email, String content, String attachmentUrl, String attachmentName, Long courseId) {
        if (attachmentUrl == null || attachmentUrl.isBlank()) {
            throw new IllegalArgumentException("L'URL de la piece jointe est obligatoire");
        }
        return buildAndSaveMessage(
                email,
                content,
                attachmentUrl,
                attachmentName,
                false,
                ChatMessage.RoomType.COURSE,
                courseId
        );
    }

    private ChatMessage buildAndSaveMessage(
            String email,
            String content,
            String attachmentUrl,
            String attachmentName,
            boolean requireContent,
            ChatMessage.RoomType roomType,
            Long courseId
    ) {
        String trimmed = content == null ? "" : content.trim();
        if (requireContent && trimmed.isEmpty()) {
            throw new IllegalArgumentException("Le contenu du message est vide");
        }
        if (roomType == ChatMessage.RoomType.COURSE) {
            if (courseId == null) {
                throw new IllegalArgumentException("courseId est obligatoire pour le salon de cours");
            }
            if (!courseRepository.existsById(courseId)) {
                throw new IllegalArgumentException("Cours introuvable");
            }
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable: " + email));

        ChatMessage message = new ChatMessage();
        message.setUserId(user.getId());
        message.setUsername(user.getUsername() != null && !user.getUsername().isBlank()
                ? user.getUsername()
                : user.getEmail());
        message.setSenderEmail(user.getEmail());
        message.setContent(trimmed);
        message.setAttachmentUrl(attachmentUrl);
        message.setAttachmentName(attachmentName);
        message.setRoomType(roomType);
        message.setCourseId(roomType == ChatMessage.RoomType.COURSE ? courseId : null);

        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getRecentGlobalMessages(int limit) {
        return getRecentMessages(limit, ChatMessage.RoomType.GLOBAL, null);
    }

    public List<ChatMessage> getRecentCourseMessages(Long courseId, int limit) {
        if (courseId == null) {
            throw new IllegalArgumentException("courseId est obligatoire");
        }
        if (!courseRepository.existsById(courseId)) {
            throw new IllegalArgumentException("Cours introuvable");
        }
        return getRecentMessages(limit, ChatMessage.RoomType.COURSE, courseId);
    }

    public ChatMessageResponse toResponse(ChatMessage message) {
        String senderRole = resolveSenderRole(message.getSenderEmail());
        return new ChatMessageResponse(
                message.getId(),
                message.getUserId(),
                message.getUsername(),
                message.getSenderEmail(),
                senderRole,
                message.getAttachmentUrl(),
                message.getAttachmentName(),
                message.getContent(),
                message.getRoomType() != null ? message.getRoomType().name() : ChatMessage.RoomType.GLOBAL.name(),
                message.getCourseId(),
                message.getCreatedAt()
        );
    }

    @Transactional
    public long deleteMessagesOlderThanRetention() {
        Instant cutoff = retentionCutoff();
        List<ChatMessage> expiredMessages = chatMessageRepository.findByCreatedAtBefore(cutoff);
        deleteAttachmentFiles(expiredMessages);
        return chatMessageRepository.deleteByCreatedAtBefore(cutoff);
    }

    private List<ChatMessage> getRecentMessages(int limit, ChatMessage.RoomType roomType, Long courseId) {
        int safeLimit = Math.max(1, Math.min(limit, 200));
        List<ChatMessage> messages;
        if (roomType == ChatMessage.RoomType.COURSE) {
            messages = chatMessageRepository.findByRoomTypeAndCourseIdOrderByCreatedAtDesc(
                    roomType,
                    courseId,
                    PageRequest.of(0, safeLimit)
            );
        } else {
            messages = chatMessageRepository.findByRoomTypeIsNullOrRoomTypeOrderByCreatedAtDesc(
                    roomType,
                    PageRequest.of(0, safeLimit)
            );
        }
        Collections.reverse(messages);
        return messages;
    }

    private String resolveSenderRole(String senderEmail) {
        if (senderEmail == null || senderEmail.isBlank()) {
            return User.Role.USER.name();
        }

        return userRepository.findByEmail(senderEmail)
                .map(user -> user.getRole() != null ? user.getRole().name() : User.Role.USER.name())
                .orElse(User.Role.USER.name());
    }

    private Instant retentionCutoff() {
        long safeRetentionHours = retentionHours > 0 ? retentionHours : 24;
        return Instant.now().minus(safeRetentionHours, ChronoUnit.HOURS);
    }

    private void deleteAttachmentFiles(List<ChatMessage> expiredMessages) {
        if (expiredMessages == null || expiredMessages.isEmpty()) {
            return;
        }

        Path baseDir = CHAT_UPLOAD_DIR.toAbsolutePath().normalize();
        for (ChatMessage message : expiredMessages) {
            String attachmentFileName = extractAttachmentFileName(message.getAttachmentUrl());
            if (attachmentFileName == null) {
                continue;
            }

            Path attachmentPath = baseDir.resolve(attachmentFileName).normalize();
            if (!attachmentPath.startsWith(baseDir)) {
                continue;
            }

            try {
                Files.deleteIfExists(attachmentPath);
            } catch (IOException ignored) {
                // Best-effort cleanup only.
            }
        }
    }

    private String extractAttachmentFileName(String attachmentUrl) {
        if (attachmentUrl == null || attachmentUrl.isBlank() || !attachmentUrl.startsWith(CHAT_ATTACHMENT_PREFIX)) {
            return null;
        }

        String filename = attachmentUrl.substring(CHAT_ATTACHMENT_PREFIX.length()).trim();
        if (filename.isBlank() || filename.contains("/") || filename.contains("\\")) {
            return null;
        }
        return filename;
    }
}
