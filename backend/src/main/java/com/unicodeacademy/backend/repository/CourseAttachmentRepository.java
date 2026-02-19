package com.unicodeacademy.backend.repository;

import com.unicodeacademy.backend.model.CourseAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseAttachmentRepository extends JpaRepository<CourseAttachment, Long> {
    List<CourseAttachment> findByCourseIdOrderByUploadedAtDesc(Long courseId);

    Optional<CourseAttachment> findByIdAndCourseId(Long id, Long courseId);
}
