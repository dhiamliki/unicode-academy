package com.unicodeacademy.backend.service;

import com.unicodeacademy.backend.model.Lesson;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.model.UserLessonProgress;
import com.unicodeacademy.backend.repository.ExerciseRepository;
import com.unicodeacademy.backend.repository.LessonRepository;
import com.unicodeacademy.backend.repository.UserExerciseAttemptRepository;
import com.unicodeacademy.backend.repository.UserLessonProgressRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonProgressService {

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserExerciseAttemptRepository userExerciseAttemptRepository;
    private final UserLessonProgressRepository userLessonProgressRepository;

    public UserLessonProgress markLessonCompleted(Long lessonId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found: " + lessonId));

        assertLessonCanBeCompleted(user, lesson);

        UserLessonProgress progress = userLessonProgressRepository
                .findByUserIdAndLessonId(user.getId(), lesson.getId())
                .orElse(new UserLessonProgress());

        progress.setUser(user);
        progress.setLesson(lesson);
        progress.setStatus(UserLessonProgress.Status.COMPLETED);
        if (progress.getCompletedAt() == null) {
            progress.setCompletedAt(Instant.now());
        }

        return userLessonProgressRepository.save(progress);
    }

    public UserLessonProgress toggleLessonCompletion(Long lessonId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found: " + lessonId));

        UserLessonProgress progress = userLessonProgressRepository
                .findByUserIdAndLessonId(user.getId(), lesson.getId())
                .orElse(new UserLessonProgress());

        progress.setUser(user);
        progress.setLesson(lesson);

        if (progress.getStatus() == UserLessonProgress.Status.COMPLETED) {
            progress.setStatus(UserLessonProgress.Status.IN_PROGRESS);
            progress.setCompletedAt(null);
            return userLessonProgressRepository.save(progress);
        }

        assertLessonCanBeCompleted(user, lesson);

        progress.setStatus(UserLessonProgress.Status.COMPLETED);
        progress.setCompletedAt(Instant.now());

        return userLessonProgressRepository.save(progress);
    }

    public List<UserLessonProgress> getMyLessonProgress() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        return userLessonProgressRepository.findByUserId(user.getId());
    }

    public void markLessonIncomplete(Long lessonId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        UserLessonProgress progress = userLessonProgressRepository
                .findByUserIdAndLessonId(user.getId(), lessonId)
                .orElseThrow(() -> new RuntimeException("Progress not found"));

        progress.setStatus(UserLessonProgress.Status.IN_PROGRESS);
        progress.setCompletedAt(null);

        userLessonProgressRepository.save(progress);
    }

    private void assertLessonCanBeCompleted(User user, Lesson lesson) {
        assertPreviousLessonCompleted(user, lesson);
        assertAllLessonExercisesAttempted(user, lesson);
    }

    private void assertPreviousLessonCompleted(User user, Lesson lesson) {
        Integer orderIndex = lesson.getOrderIndex();
        if (orderIndex == null || orderIndex <= 1) {
            return;
        }

        Lesson previous = lessonRepository
                .findByCourseIdAndOrderIndex(lesson.getCourse().getId(), orderIndex - 1)
                .orElse(null);

        if (previous == null) {
            return;
        }

        UserLessonProgress prevProgress = userLessonProgressRepository
                .findByUserIdAndLessonId(user.getId(), previous.getId())
                .orElse(null);

        boolean prevCompleted = prevProgress != null
                && prevProgress.getStatus() == UserLessonProgress.Status.COMPLETED;

        if (!prevCompleted) {
            throw new IllegalStateException("You must complete the previous lesson first");
        }
    }

    private void assertAllLessonExercisesAttempted(User user, Lesson lesson) {
        long totalExercises = exerciseRepository.countByLessonId(lesson.getId());
        if (totalExercises <= 0) {
            return;
        }

        long attemptedExercises = userExerciseAttemptRepository
                .countDistinctAttemptedExercisesByUserIdAndLessonId(user.getId(), lesson.getId());

        if (attemptedExercises < totalExercises) {
            throw new IllegalStateException(
                    "Complete all exercises before marking this lesson as completed (" +
                            attemptedExercises + "/" + totalExercises + " done)"
            );
        }
    }
}
