package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.ChatMessageResponse;
import com.unicodeacademy.backend.model.ChatMessage;
import com.unicodeacademy.backend.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
    private static final Path UPLOAD_DIR = Paths.get("uploads", "chat");

    @GetMapping("/messages")
    public List<ChatMessageResponse> getMessages(@RequestParam(defaultValue = "50") int limit,
                                                 @RequestParam(required = false) Long courseId) {
        List<ChatMessage> messages = courseId == null
                ? chatMessageService.getRecentGlobalMessages(limit)
                : chatMessageService.getRecentCourseMessages(courseId, limit);
        return messages.stream().map(chatMessageService::toResponse).collect(Collectors.toList());
    }

    @PostMapping("/attachments")
    public ChatMessageResponse uploadAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "courseId", required = false) Long courseId,
            Principal principal
    ) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "File exceeds 10MB");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
        String extension = "";
        int dot = originalName.lastIndexOf('.');
        if (dot > -1 && dot < originalName.length() - 1) {
            extension = originalName.substring(dot);
        }
        String storedName = UUID.randomUUID().toString().replace("-", "") + extension;

        try {
            Files.createDirectories(UPLOAD_DIR);
            Path target = UPLOAD_DIR.resolve(storedName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file");
        }

        String attachmentUrl = "/api/chat/files/" + storedName;
        ChatMessage saved = courseId == null
                ? chatMessageService.createGlobalAttachmentMessage(
                principal.getName(),
                content,
                attachmentUrl,
                originalName
        )
                : chatMessageService.createCourseAttachmentMessage(
                principal.getName(),
                content,
                attachmentUrl,
                originalName,
                courseId
        );

        ChatMessageResponse response = chatMessageService.toResponse(saved);
        if (saved.getRoomType() == ChatMessage.RoomType.COURSE && saved.getCourseId() != null) {
            messagingTemplate.convertAndSend("/topic/chat/course/" + saved.getCourseId(), response);
        } else {
            messagingTemplate.convertAndSend("/topic/chat/global", response);
        }
        return response;
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            Path baseDir = UPLOAD_DIR.toAbsolutePath().normalize();
            Path filePath = baseDir.resolve(filename).normalize();
            if (!filePath.startsWith(baseDir)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid filename");
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
        }
    }
}
