package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.AdminLessonRequest;
import com.unicodeacademy.backend.dto.AdminLessonResponse;
import com.unicodeacademy.backend.service.AdminContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AdminLessonController {

    private final AdminContentService adminContentService;

    @GetMapping("/api/admin/courses/{courseId}/lessons")
    public List<AdminLessonResponse> listLessons(@PathVariable Long courseId) {
        return adminContentService.listLessons(courseId);
    }

    @PostMapping("/api/admin/courses/{courseId}/lessons")
    public AdminLessonResponse createLesson(@PathVariable Long courseId,
                                            @Valid @RequestBody AdminLessonRequest request) {
        return adminContentService.createLesson(courseId, request);
    }

    @PutMapping("/api/admin/lessons/{lessonId}")
    public AdminLessonResponse updateLesson(@PathVariable Long lessonId,
                                            @Valid @RequestBody AdminLessonRequest request) {
        return adminContentService.updateLesson(lessonId, request);
    }

    @DeleteMapping("/api/admin/lessons/{lessonId}")
    public void deleteLesson(@PathVariable Long lessonId) {
        adminContentService.deleteLesson(lessonId);
    }

    @GetMapping("/api/admin/courses/{courseId}/lessons/next-order")
    public int nextLessonOrder(@PathVariable Long courseId) {
        return adminContentService.getNextLessonOrderIndex(courseId);
    }
}
