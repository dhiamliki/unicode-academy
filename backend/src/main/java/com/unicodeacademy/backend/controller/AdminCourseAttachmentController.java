package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.CourseAttachmentResponse;
import com.unicodeacademy.backend.dto.RealtimeNotificationResponse;
import com.unicodeacademy.backend.service.CourseAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;

@RestController
@RequestMapping("/api/admin/courses/{courseId}/attachments")
@RequiredArgsConstructor
public class AdminCourseAttachmentController {

    private final CourseAttachmentService courseAttachmentService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public CourseAttachmentResponse upload(@PathVariable Long courseId,
                                           @RequestParam("file") MultipartFile file) {
        CourseAttachmentResponse uploaded = courseAttachmentService.upload(courseId, file);

        messagingTemplate.convertAndSend(
                "/topic/notifications",
                new RealtimeNotificationResponse(
                        "info",
                        "Admin uploaded a new attachment: " + uploaded.getOriginalName(),
                        "COURSE_ATTACHMENT_UPLOADED",
                        courseId,
                        uploaded.getOriginalName(),
                        Instant.now()
                )
        );

        return uploaded;
    }

    @DeleteMapping("/{attachmentId}")
    public void delete(@PathVariable Long courseId,
                       @PathVariable Long attachmentId) {
        courseAttachmentService.delete(courseId, attachmentId);
    }
}
