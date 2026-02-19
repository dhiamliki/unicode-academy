package com.unicodeacademy.backend.service;

import com.unicodeacademy.backend.dto.ChatMessageResponse;
import com.unicodeacademy.backend.model.ChatMessage;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.repository.CourseRepository;
import com.unicodeacademy.backend.repository.ChatMessageRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

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
            throw new IllegalArgumentException("Attachment URL is required");
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
            throw new IllegalArgumentException("Message content is empty");
        }
        if (roomType == ChatMessage.RoomType.COURSE) {
            if (courseId == null) {
                throw new IllegalArgumentException("courseId is required for course room");
            }
            if (!courseRepository.existsById(courseId)) {
                throw new IllegalArgumentException("Course not found");
            }
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

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
            throw new IllegalArgumentException("courseId is required");
        }
        if (!courseRepository.existsById(courseId)) {
            throw new IllegalArgumentException("Course not found");
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
}
