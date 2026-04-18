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

    /**
     * Business rules for lesson completion (see also {@link ProgressService}).
     *
     * <p><strong>Auto-completion trigger:</strong> {@link #maybeCompleteLessonAfterCorrectExercise(Long)}
     * is invoked automatically after each correct exercise attempt. If the lesson has at least one
     * exercise and the user has answered correctly on every distinct exercise of that lesson, the
     * lesson status becomes COMPLETED and the completion timestamp is recorded (preserved if already set).
     *
     * <p><strong>Explicit toggle:</strong> Users can toggle lesson completion manually. Toggling
     * from COMPLETED to IN_PROGRESS clears the completedAt timestamp; toggling back restores it
     * to the current instant.
     */
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserExerciseAttemptRepository userExerciseAttemptRepository;
    private final UserLessonProgressRepository userLessonProgressRepository;
    private final ProgressService progressService;

    public UserLessonProgress markLessonCompleted(Long lessonId) {
        User user = getCurrentUser();
        Lesson lesson = getLesson(lessonId);

        UserLessonProgress progress = userLessonProgressRepository
                .findByUserIdAndLessonId(user.getId(), lesson.getId())
                .orElse(new UserLessonProgress());

        progress.setUser(user);
        progress.setLesson(lesson);
        progress.setStatus(UserLessonProgress.Status.COMPLETED);
        if (progress.getCompletedAt() == null) {
            progress.setCompletedAt(Instant.now());
        }

        UserLessonProgress savedProgress = userLessonProgressRepository.save(progress);
        progressService.syncCourseProgressForUser(user, lesson.getCourse());
        return savedProgress;
    }

    /**
     * When the lesson has at least one exercise, mark it completed once the learner has at least one
     * <strong>correct</strong> attempt on every exercise of that lesson. Lessons without exercises are unchanged here
     * (the learner still uses explicit completion on the lesson page).
     */
    public void maybeCompleteLessonAfterCorrectExercise(Long lessonId) {
        User user = getCurrentUser();
        getLesson(lessonId);

        long exerciseCount = exerciseRepository.countByLessonId(lessonId);
        if (exerciseCount == 0) {
            return;
        }

        long distinctCorrect = userExerciseAttemptRepository.countDistinctCorrectExercisesByUserIdAndLessonId(
                user.getId(),
                lessonId
        );
        if (distinctCorrect < exerciseCount) {
            return;
        }

        UserLessonProgress existing = userLessonProgressRepository
                .findByUserIdAndLessonId(user.getId(), lessonId)
                .orElse(null);
        if (existing != null && existing.getStatus() == UserLessonProgress.Status.COMPLETED) {
            return;
        }

        markLessonCompleted(lessonId);
    }

    public UserLessonProgress toggleLessonCompletion(Long lessonId) {
        User user = getCurrentUser();
        Lesson lesson = getLesson(lessonId);

        UserLessonProgress progress = userLessonProgressRepository
                .findByUserIdAndLessonId(user.getId(), lesson.getId())
                .orElse(new UserLessonProgress());

        progress.setUser(user);
        progress.setLesson(lesson);

        if (progress.getStatus() == UserLessonProgress.Status.COMPLETED) {
            progress.setStatus(UserLessonProgress.Status.IN_PROGRESS);
            progress.setCompletedAt(null);
            UserLessonProgress savedProgress = userLessonProgressRepository.save(progress);
            progressService.syncCourseProgressForUser(user, lesson.getCourse());
            return savedProgress;
        }

        progress.setStatus(UserLessonProgress.Status.COMPLETED);
        progress.setCompletedAt(Instant.now());

        UserLessonProgress savedProgress = userLessonProgressRepository.save(progress);
        progressService.syncCourseProgressForUser(user, lesson.getCourse());
        return savedProgress;
    }

    public List<UserLessonProgress> getMyLessonProgress() {
        User user = getCurrentUser();

        return userLessonProgressRepository.findByUserId(user.getId());
    }

    public void markLessonIncomplete(Long lessonId) {
        User user = getCurrentUser();

        UserLessonProgress progress = userLessonProgressRepository
                .findByUserIdAndLessonId(user.getId(), lessonId)
                .orElseThrow(() -> new RuntimeException("Progression introuvable"));

        progress.setStatus(UserLessonProgress.Status.IN_PROGRESS);
        progress.setCompletedAt(null);

        userLessonProgressRepository.save(progress);
        progressService.syncCourseProgressForUser(user, progress.getLesson().getCourse());
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable: " + email));
    }

    private Lesson getLesson(Long lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lecon introuvable: " + lessonId));
    }
}
