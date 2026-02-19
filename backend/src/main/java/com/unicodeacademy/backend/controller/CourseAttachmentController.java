package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.CourseAttachmentResponse;
import com.unicodeacademy.backend.service.CourseAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/attachments")
@RequiredArgsConstructor
public class CourseAttachmentController {

    private final CourseAttachmentService courseAttachmentService;

    @GetMapping
    public List<CourseAttachmentResponse> list(@PathVariable Long courseId) {
        return courseAttachmentService.listByCourseId(courseId);
    }

    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<Resource> download(@PathVariable Long courseId,
                                             @PathVariable Long attachmentId) {
        CourseAttachmentService.DownloadPayload payload =
                courseAttachmentService.loadForDownload(courseId, attachmentId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(payload.contentType()))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + payload.originalName().replace("\"", "") + "\""
                )
                .body(payload.resource());
    }
}
