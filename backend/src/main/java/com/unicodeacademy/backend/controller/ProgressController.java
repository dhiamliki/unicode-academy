package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.CourseProgressSummaryItem;
import com.unicodeacademy.backend.dto.ProgressSummaryResponse;
import com.unicodeacademy.backend.dto.ProgressSummaryTotals;
import com.unicodeacademy.backend.dto.ProgressResponse;
import com.unicodeacademy.backend.model.Course;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.model.UserCourseProgress;
import com.unicodeacademy.backend.repository.CourseRepository;
import com.unicodeacademy.backend.repository.UserCourseProgressRepository;
import com.unicodeacademy.backend.repository.UserExerciseAttemptRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final UserCourseProgressRepository progressRepository;
    private final UserExerciseAttemptRepository attemptRepository;

    public ProgressController(UserRepository userRepository,
                              CourseRepository courseRepository,
                              UserCourseProgressRepository progressRepository,
                              UserExerciseAttemptRepository attemptRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.progressRepository = progressRepository;
        this.attemptRepository = attemptRepository;
    }

    @GetMapping("/me")
    public List<ProgressResponse> myProgress(Authentication auth) {

        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow();

        return progressRepository.findByUserIdWithCourseAndLanguage(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/summary")
    public ProgressSummaryResponse mySummary(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();

        List<CourseProgressSummaryItem> courseItems = courseRepository.findCourseProgressByUserId(user.getId())
                .stream()
                .map(row -> {
                    long totalLessons = row.getTotalLessons() != null ? row.getTotalLessons() : 0L;
                    long completedLessons = row.getCompletedLessons() != null ? row.getCompletedLessons() : 0L;
                    int percentage = totalLessons == 0
                            ? 0
                            : (int) Math.round((completedLessons * 100.0) / totalLessons);
                    return new CourseProgressSummaryItem(
                            row.getCourseId(),
                            totalLessons,
                            completedLessons,
                            percentage
                    );
                })
                .collect(Collectors.toList());

        long completedCourses = courseItems.stream()
                .filter(item -> item.getTotalLessons() > 0 && item.getCompletedLessons() >= item.getTotalLessons())
                .count();
        long completedLessons = courseItems.stream()
                .mapToLong(CourseProgressSummaryItem::getCompletedLessons)
                .sum();

        UserExerciseAttemptRepository.AttemptSummaryProjection attemptSummary = attemptRepository.summarizeByUserId(user.getId());
        long attemptedExercises = attemptSummary != null && attemptSummary.getAttemptedExercises() != null
                ? attemptSummary.getAttemptedExercises()
                : 0L;
        long correctExercises = attemptSummary != null && attemptSummary.getCorrectExercises() != null
                ? attemptSummary.getCorrectExercises()
                : 0L;

        ProgressSummaryTotals totals = new ProgressSummaryTotals(
                completedCourses,
                completedLessons,
                attemptedExercises,
                correctExercises
        );

        return new ProgressSummaryResponse(courseItems, totals);
    }

    @PostMapping("/course/{courseId}/complete")
    public ProgressResponse completeCourse(@PathVariable Long courseId,
                                           Authentication auth) {

        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow();

        Course course = courseRepository.findById(courseId)
                .orElseThrow();

        UserCourseProgress progress =
                progressRepository.findByUserIdAndCourseId(user.getId(), courseId)
                        .orElse(new UserCourseProgress());

        progress.setUser(user);
        progress.setCourse(course);
        progress.setStatus(UserCourseProgress.Status.COMPLETED);
        if (progress.getCompletedAt() == null) {
            progress.setCompletedAt(Instant.now());
        }

        progressRepository.save(progress);

        return toResponse(progress);
    }

    private ProgressResponse toResponse(UserCourseProgress progress) {
        UserCourseProgress.Status status = progress.getStatus();
        boolean completed = status == UserCourseProgress.Status.COMPLETED;

        Course course = progress.getCourse();
        Long courseId = course != null ? course.getId() : null;
        String courseCode = course != null ? course.getCode() : null;
        String languageCode = null;
        if (course != null && course.getLanguage() != null) {
            languageCode = course.getLanguage().getCode();
        }

        return new ProgressResponse(
                courseId,
                courseCode,
                languageCode,
                completed,
                progress.getCompletedAt(),
                status
        );
    }
}
