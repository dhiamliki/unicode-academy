package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.LessonProgressResponse;
import com.unicodeacademy.backend.model.Lesson;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.model.UserLessonProgress;
import com.unicodeacademy.backend.repository.UserLessonProgressRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import com.unicodeacademy.backend.service.LessonProgressService;
import com.unicodeacademy.backend.util.TextEncodingFixer;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progress")
public class LessonProgressController {

    private final UserRepository userRepository;
    private final UserLessonProgressRepository lessonProgressRepository;
    private final LessonProgressService lessonProgressService;

    public LessonProgressController(UserRepository userRepository,
                                   UserLessonProgressRepository lessonProgressRepository,
                                   LessonProgressService lessonProgressService) {
        this.userRepository = userRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.lessonProgressService = lessonProgressService;
    }

    @GetMapping("/lessons/me")
    public List<LessonProgressResponse> myLessonProgress(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();

        return lessonProgressRepository.findByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @PostMapping("/lessons/{lessonId}/complete")
    public LessonProgressResponse completeLesson(@PathVariable Long lessonId) {
        UserLessonProgress progress = lessonProgressService.markLessonCompleted(lessonId);
        return toResponse(progress);
    }

    @PostMapping("/lesson/{lessonId}/complete")
    public ResponseEntity<String> completeLessonSimple(@PathVariable Long lessonId) {
        lessonProgressService.markLessonCompleted(lessonId);
        return ResponseEntity.ok("Lesson marked as completed");
    }

    @PostMapping("/lessons/{lessonId}/toggle")
    public LessonProgressResponse toggleLesson(@PathVariable Long lessonId) {
        UserLessonProgress progress = lessonProgressService.toggleLessonCompletion(lessonId);
        return toResponse(progress);
    }

    @DeleteMapping("/lesson/{lessonId}/complete")
    public ResponseEntity<String> uncompleteLesson(@PathVariable Long lessonId) {
        lessonProgressService.markLessonIncomplete(lessonId);
        return ResponseEntity.ok("Lesson marked as incomplete");
    }

    private LessonProgressResponse toResponse(UserLessonProgress progress) {
        Lesson lesson = progress.getLesson();
        boolean completed = progress.getStatus() == UserLessonProgress.Status.COMPLETED;
        Long courseId = lesson != null && lesson.getCourse() != null ? lesson.getCourse().getId() : null;
        return new LessonProgressResponse(
                lesson != null ? lesson.getId() : null,
                courseId,
                lesson != null ? TextEncodingFixer.fix(lesson.getTitle()) : null,
                lesson != null ? lesson.getOrderIndex() : null,
                progress.getStatus(),
                completed,
                progress.getCompletedAt()
        );
    }
}
