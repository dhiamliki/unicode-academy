package com.unicodeacademy.backend.service;

import com.unicodeacademy.backend.dto.CourseAttachmentResponse;
import com.unicodeacademy.backend.model.Course;
import com.unicodeacademy.backend.model.CourseAttachment;
import com.unicodeacademy.backend.repository.CourseAttachmentRepository;
import com.unicodeacademy.backend.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseAttachmentService {

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
    private static final Path UPLOAD_DIR = Paths.get("uploads", "course-attachments");

    private final CourseRepository courseRepository;
    private final CourseAttachmentRepository courseAttachmentRepository;

    public List<CourseAttachmentResponse> listByCourseId(Long courseId) {
        ensureCourseExists(courseId);
        return courseAttachmentRepository.findByCourseIdOrderByUploadedAtDesc(courseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CourseAttachmentResponse upload(Long courseId, MultipartFile file) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "File exceeds 10MB");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
        if (originalName.contains("..")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name");
        }

        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        if (!isAllowedFile(originalName, contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF or image files are allowed");
        }

        String extension = "";
        int dot = originalName.lastIndexOf('.');
        if (dot > -1 && dot < originalName.length() - 1) {
            extension = originalName.substring(dot);
        }

        String storedFileName = UUID.randomUUID().toString().replace("-", "") + extension;

        try {
            Files.createDirectories(UPLOAD_DIR);
            Path target = safeResolve(storedFileName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file");
        }

        CourseAttachment attachment = new CourseAttachment();
        attachment.setCourse(course);
        attachment.setOriginalName(originalName);
        attachment.setStoredFilename(storedFileName);
        attachment.setContentType(contentType);
        attachment.setSizeBytes(file.getSize());

        return toResponse(courseAttachmentRepository.save(attachment));
    }

    public DownloadPayload loadForDownload(Long courseId, Long attachmentId) {
        CourseAttachment attachment = courseAttachmentRepository.findByIdAndCourseId(attachmentId, courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));

        try {
            Path target = safeResolve(attachment.getStoredFilename());
            Resource resource = new UrlResource(target.toUri());
            if (!resource.exists()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
            }
            return new DownloadPayload(
                    resource,
                    attachment.getOriginalName(),
                    attachment.getContentType() != null ? attachment.getContentType() : "application/octet-stream"
            );
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
        }
    }

    public void delete(Long courseId, Long attachmentId) {
        CourseAttachment attachment = courseAttachmentRepository.findByIdAndCourseId(attachmentId, courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));

        courseAttachmentRepository.delete(attachment);
        try {
            Path target = safeResolve(attachment.getStoredFilename());
            Files.deleteIfExists(target);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete file");
        }
    }

    private void ensureCourseExists(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        }
    }

    private boolean isAllowedFile(String originalName, String contentType) {
        String lowerName = originalName.toLowerCase(Locale.ROOT);
        if ("application/pdf".equalsIgnoreCase(contentType) || lowerName.endsWith(".pdf")) {
            return true;
        }
        return contentType.toLowerCase(Locale.ROOT).startsWith("image/");
    }

    private Path safeResolve(String storedFileName) throws IOException {
        Path base = UPLOAD_DIR.toAbsolutePath().normalize();
        Path target = base.resolve(storedFileName).normalize();
        if (!target.startsWith(base)) {
            throw new IOException("Invalid file path");
        }
        return target;
    }

    private CourseAttachmentResponse toResponse(CourseAttachment attachment) {
        return new CourseAttachmentResponse(
                attachment.getId(),
                attachment.getCourse().getId(),
                attachment.getOriginalName(),
                attachment.getSizeBytes() != null ? attachment.getSizeBytes() : 0L,
                attachment.getUploadedAt()
        );
    }

    public record DownloadPayload(Resource resource, String originalName, String contentType) {
    }
}
