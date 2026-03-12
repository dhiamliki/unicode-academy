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
                .map(attachment -> toResponse(attachment, courseId))
                .toList();
    }

    public CourseAttachmentResponse upload(Long courseId, MultipartFile file) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cours introuvable"));

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le fichier est obligatoire");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Le fichier depasse 10 Mo");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
        if (originalName.contains("..")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom de fichier invalide");
        }

        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        if (!isAllowedFile(originalName, contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seuls les fichiers PDF ou images sont autorises");
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
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Impossible d'enregistrer le fichier");
        }

        CourseAttachment attachment = new CourseAttachment();
        attachment.setCourse(course);
        attachment.setOriginalName(originalName);
        attachment.setStoredFilename(storedFileName);
        attachment.setContentType(contentType);
        attachment.setSizeBytes(file.getSize());

        CourseAttachment saved = courseAttachmentRepository.save(attachment);
        return toResponse(saved, course.getId());
    }

    public DownloadPayload loadForDownload(Long courseId, Long attachmentId) {
        CourseAttachment attachment = courseAttachmentRepository.findByIdAndCourseId(attachmentId, courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Piece jointe introuvable"));

        try {
            Path target = safeResolve(attachment.getStoredFilename());
            Resource resource = new UrlResource(target.toUri());
            if (!resource.exists()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fichier introuvable");
            }
            return new DownloadPayload(
                    resource,
                    attachment.getOriginalName(),
                    attachment.getContentType() != null ? attachment.getContentType() : "application/octet-stream"
            );
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fichier introuvable");
        }
    }

    public void delete(Long courseId, Long attachmentId) {
        CourseAttachment attachment = courseAttachmentRepository.findByIdAndCourseId(attachmentId, courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Piece jointe introuvable"));

        courseAttachmentRepository.delete(attachment);
        try {
            Path target = safeResolve(attachment.getStoredFilename());
            Files.deleteIfExists(target);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Impossible de supprimer le fichier");
        }
    }

    private void ensureCourseExists(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cours introuvable");
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
            throw new IOException("Chemin de fichier invalide");
        }
        return target;
    }

    private CourseAttachmentResponse toResponse(CourseAttachment attachment, Long courseId) {
        return new CourseAttachmentResponse(
                attachment.getId(),
                courseId,
                attachment.getOriginalName(),
                attachment.getSizeBytes() != null ? attachment.getSizeBytes() : 0L,
                attachment.getUploadedAt()
        );
    }

    public record DownloadPayload(Resource resource, String originalName, String contentType) {
    }
}
