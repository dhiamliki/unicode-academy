package com.unicodeacademy.backend.service;

import com.unicodeacademy.backend.dto.CourseProgressSummaryItem;
import com.unicodeacademy.backend.dto.ProgressResponse;
import com.unicodeacademy.backend.dto.ProgressSummaryResponse;
import com.unicodeacademy.backend.dto.ProgressSummaryTotals;
import com.unicodeacademy.backend.model.Course;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.model.UserCourseProgress;
import com.unicodeacademy.backend.repository.CourseRepository;
import com.unicodeacademy.backend.repository.LessonRepository;
import com.unicodeacademy.backend.repository.UserCourseProgressRepository;
import com.unicodeacademy.backend.repository.UserExerciseAttemptRepository;
import com.unicodeacademy.backend.repository.UserLessonProgressRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProgressService {

    /**
     * Business rules for progression (UniCode Academy):
     *
     * <p><strong>Lesson completion:</strong> A lesson is marked COMPLETED when the user explicitly
     * confirms completion via the UI (toggle) OR when all exercises within that lesson have been
     * answered correctly at least once (auto-completion). The timestamp is preserved on re-completion.
     *
     * <p><strong>Course completion:</strong> A course is marked COMPLETED when the number of
     * completed lessons is greater than or equal to the total number of lessons in the course
     * (totalLessons > 0 && completedLessons >= totalLessons). The completedAt timestamp is set
     * on the first time this condition is met.
     *
     * <p><strong>Percentage calculation:</strong> For each course: percentage = round( (completedLessons * 100.0) / totalLessons ).
     * If totalLessons is zero, percentage is 0.
     *
     * <p><strong>Recalculation:</strong> When a lesson is deleted, {@link #recalculateCourseProgressForAllUsers(Long)}
     * re-evaluates every user's course progress without touching unrelated progress rows.
     */
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final UserCourseProgressRepository progressRepository;
    private final UserLessonProgressRepository lessonProgressRepository;
    private final UserExerciseAttemptRepository attemptRepository;

    @Transactional(readOnly = true)
    public List<ProgressResponse> getMyCourseProgress(String email) {
        User user = getUserByEmail(email);

        return progressRepository.findByUserIdWithCourseAndLanguage(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProgressSummaryResponse getMySummary(String email) {
        User user = getUserByEmail(email);

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
                .toList();

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

        return new ProgressSummaryResponse(
                courseItems,
                new ProgressSummaryTotals(
                        completedCourses,
                        completedLessons,
                        attemptedExercises,
                        correctExercises
                )
        );
    }

    public ProgressResponse refreshCourseProgress(String email, Long courseId) {
        User user = getUserByEmail(email);
        Course course = getCourse(courseId);
        return toResponse(syncCourseProgressForUser(user, course));
    }

    public UserCourseProgress syncCourseProgressForUser(User user, Course course) {
        long totalLessons = lessonRepository.countByCourseId(course.getId());
        long completedLessons = lessonProgressRepository.countCompletedByUserIdAndCourseId(user.getId(), course.getId());

        UserCourseProgress progress = progressRepository.findByUserIdAndCourseId(user.getId(), course.getId())
                .orElse(new UserCourseProgress());
        progress.setUser(user);
        progress.setCourse(course);

        if (totalLessons > 0 && completedLessons >= totalLessons) {
            progress.setStatus(UserCourseProgress.Status.COMPLETED);
            if (progress.getCompletedAt() == null) {
                progress.setCompletedAt(Instant.now());
            }
        } else {
            progress.setStatus(UserCourseProgress.Status.IN_PROGRESS);
            progress.setCompletedAt(null);
        }

        return progressRepository.save(progress);
    }

    /**
     * Recalculates stored {@link UserCourseProgress} rows after structural catalog changes
     * (for example deleting a lesson) without wiping unrelated learner history.
     */
    public void recalculateCourseProgressForAllUsers(Long courseId) {
        Course course = getCourse(courseId);
        for (UserCourseProgress row : progressRepository.findByCourse_Id(courseId)) {
            User owner = row.getUser();
            if (owner != null) {
                syncCourseProgressForUser(owner, course);
            }
        }
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
    }

    private Course getCourse(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cours introuvable"));
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
