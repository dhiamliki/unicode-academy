package com.unicodeacademy.backend.service;

import com.unicodeacademy.backend.model.Course;
import com.unicodeacademy.backend.model.Lesson;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.model.UserLessonProgress;
import com.unicodeacademy.backend.repository.ExerciseRepository;
import com.unicodeacademy.backend.repository.LessonRepository;
import com.unicodeacademy.backend.repository.UserExerciseAttemptRepository;
import com.unicodeacademy.backend.repository.UserLessonProgressRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LessonProgressServiceTest {

    private static final String EMAIL = "student@unicode.test";

    @Mock
    private UserRepository userRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private UserLessonProgressRepository userLessonProgressRepository;

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private UserExerciseAttemptRepository userExerciseAttemptRepository;

    @Mock
    private ProgressService progressService;

    private LessonProgressService lessonProgressService;

    @BeforeEach
    void setUp() {
        lessonProgressService = new LessonProgressService(
                userRepository,
                lessonRepository,
                exerciseRepository,
                userExerciseAttemptRepository,
                userLessonProgressRepository,
                progressService
        );
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(EMAIL, "ignored")
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void markLessonCompletedCreatesCompletedProgressAndSyncsCourseProgress() {
        User user = createUser(1L, EMAIL);
        Lesson lesson = createLesson(10L, 1);

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(lessonRepository.findById(10L)).thenReturn(Optional.of(lesson));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1L, 10L)).thenReturn(Optional.empty());
        when(userLessonProgressRepository.save(any(UserLessonProgress.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UserLessonProgress result = lessonProgressService.markLessonCompleted(10L);

        ArgumentCaptor<UserLessonProgress> progressCaptor = ArgumentCaptor.forClass(UserLessonProgress.class);
        verify(userLessonProgressRepository).save(progressCaptor.capture());
        UserLessonProgress savedProgress = progressCaptor.getValue();

        assertSame(savedProgress, result);
        assertEquals(user, savedProgress.getUser());
        assertEquals(lesson, savedProgress.getLesson());
        assertEquals(UserLessonProgress.Status.COMPLETED, savedProgress.getStatus());
        assertNotNull(savedProgress.getCompletedAt());
        verify(progressService).syncCourseProgressForUser(user, lesson.getCourse());
    }

    @Test
    void markLessonCompletedKeepsExistingCompletionTimestamp() {
        User user = createUser(1L, EMAIL);
        Lesson lesson = createLesson(10L, 1);
        Instant completedAt = Instant.parse("2026-01-01T10:15:30Z");

        UserLessonProgress existingProgress = new UserLessonProgress();
        existingProgress.setId(99L);
        existingProgress.setUser(user);
        existingProgress.setLesson(lesson);
        existingProgress.setStatus(UserLessonProgress.Status.COMPLETED);
        existingProgress.setCompletedAt(completedAt);

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(lessonRepository.findById(10L)).thenReturn(Optional.of(lesson));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1L, 10L))
                .thenReturn(Optional.of(existingProgress));
        when(userLessonProgressRepository.save(existingProgress)).thenReturn(existingProgress);

        UserLessonProgress result = lessonProgressService.markLessonCompleted(10L);

        assertSame(existingProgress, result);
        assertEquals(UserLessonProgress.Status.COMPLETED, result.getStatus());
        assertEquals(completedAt, result.getCompletedAt());
        verify(progressService).syncCourseProgressForUser(user, lesson.getCourse());
    }

    @Test
    void getMyLessonProgressReturnsProgressForAuthenticatedUser() {
        User user = createUser(1L, EMAIL);
        List<UserLessonProgress> progressList = List.of(new UserLessonProgress(), new UserLessonProgress());

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(userLessonProgressRepository.findByUserId(1L)).thenReturn(progressList);

        List<UserLessonProgress> result = lessonProgressService.getMyLessonProgress();

        assertSame(progressList, result);
        verify(userLessonProgressRepository).findByUserId(1L);
    }

    @Test
    void toggleLessonCompletionForCompletedLessonMarksItInProgressAndSyncsCourseProgress() {
        User user = createUser(1L, EMAIL);
        Lesson lesson = createLesson(10L, 1);
        Instant completedAt = Instant.parse("2026-01-01T10:15:30Z");

        UserLessonProgress existingProgress = new UserLessonProgress();
        existingProgress.setUser(user);
        existingProgress.setLesson(lesson);
        existingProgress.setStatus(UserLessonProgress.Status.COMPLETED);
        existingProgress.setCompletedAt(completedAt);

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(lessonRepository.findById(10L)).thenReturn(Optional.of(lesson));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1L, 10L))
                .thenReturn(Optional.of(existingProgress));
        when(userLessonProgressRepository.save(existingProgress)).thenReturn(existingProgress);

        UserLessonProgress result = lessonProgressService.toggleLessonCompletion(10L);

        assertSame(existingProgress, result);
        assertEquals(UserLessonProgress.Status.IN_PROGRESS, result.getStatus());
        assertNull(result.getCompletedAt());
        verify(progressService).syncCourseProgressForUser(user, lesson.getCourse());
    }

    @Test
    void toggleLessonCompletionForIncompleteLessonMarksItCompletedAndSyncsCourseProgress() {
        User user = createUser(1L, EMAIL);
        Lesson lesson = createLesson(10L, 1);

        UserLessonProgress existingProgress = new UserLessonProgress();
        existingProgress.setUser(user);
        existingProgress.setLesson(lesson);
        existingProgress.setStatus(UserLessonProgress.Status.IN_PROGRESS);

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(lessonRepository.findById(10L)).thenReturn(Optional.of(lesson));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1L, 10L))
                .thenReturn(Optional.of(existingProgress));
        when(userLessonProgressRepository.save(existingProgress)).thenReturn(existingProgress);

        UserLessonProgress result = lessonProgressService.toggleLessonCompletion(10L);

        assertSame(existingProgress, result);
        assertEquals(UserLessonProgress.Status.COMPLETED, result.getStatus());
        assertNotNull(result.getCompletedAt());
        verify(progressService).syncCourseProgressForUser(user, lesson.getCourse());
    }

    @Test
    void markLessonIncompleteResetsCompletedProgressAndSyncsCourseProgress() {
        User user = createUser(1L, EMAIL);
        Lesson lesson = createLesson(10L, 1);

        UserLessonProgress progress = new UserLessonProgress();
        progress.setLesson(lesson);
        progress.setStatus(UserLessonProgress.Status.COMPLETED);
        progress.setCompletedAt(Instant.parse("2026-01-01T10:15:30Z"));

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1L, 10L)).thenReturn(Optional.of(progress));
        when(userLessonProgressRepository.save(progress)).thenReturn(progress);

        lessonProgressService.markLessonIncomplete(10L);

        assertEquals(UserLessonProgress.Status.IN_PROGRESS, progress.getStatus());
        assertNull(progress.getCompletedAt());
        verify(userLessonProgressRepository).save(progress);
        verify(progressService).syncCourseProgressForUser(user, lesson.getCourse());
    }

    @Test
    void markLessonIncompleteThrowsWhenProgressDoesNotExist() {
        User user = createUser(1L, EMAIL);

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1L, 10L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> lessonProgressService.markLessonIncomplete(10L));

        assertEquals("Progression introuvable", exception.getMessage());
    }

    @Test
    void maybeCompleteLessonAfterCorrectExerciseDoesNothingWhenLessonHasNoExercises() {
        User user = createUser(1L, EMAIL);
        Lesson lesson = createLesson(10L, 1);

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(lessonRepository.findById(10L)).thenReturn(Optional.of(lesson));
        when(exerciseRepository.countByLessonId(10L)).thenReturn(0L);

        lessonProgressService.maybeCompleteLessonAfterCorrectExercise(10L);

        verify(userLessonProgressRepository, never()).save(any(UserLessonProgress.class));
        verify(progressService, never()).syncCourseProgressForUser(any(User.class), any(Course.class));
    }

    @Test
    void maybeCompleteLessonAfterCorrectExerciseCompletesWhenAllExercisesAnsweredCorrectly() {
        User user = createUser(1L, EMAIL);
        Lesson lesson = createLesson(10L, 1);

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(lessonRepository.findById(10L)).thenReturn(Optional.of(lesson));
        when(exerciseRepository.countByLessonId(10L)).thenReturn(2L);
        when(userExerciseAttemptRepository.countDistinctCorrectExercisesByUserIdAndLessonId(1L, 10L)).thenReturn(2L);
        when(userLessonProgressRepository.findByUserIdAndLessonId(1L, 10L)).thenReturn(Optional.empty());
        when(userLessonProgressRepository.save(any(UserLessonProgress.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        lessonProgressService.maybeCompleteLessonAfterCorrectExercise(10L);

        verify(userLessonProgressRepository).save(any(UserLessonProgress.class));
        verify(progressService).syncCourseProgressForUser(eq(user), eq(lesson.getCourse()));
    }

    @Test
    void maybeCompleteLessonAfterCorrectExerciseSkipsWhenSomeExercisesStillMissing() {
        User user = createUser(1L, EMAIL);
        Lesson lesson = createLesson(10L, 1);

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(lessonRepository.findById(10L)).thenReturn(Optional.of(lesson));
        when(exerciseRepository.countByLessonId(10L)).thenReturn(3L);
        when(userExerciseAttemptRepository.countDistinctCorrectExercisesByUserIdAndLessonId(1L, 10L)).thenReturn(1L);

        lessonProgressService.maybeCompleteLessonAfterCorrectExercise(10L);

        verify(userLessonProgressRepository, never()).save(any(UserLessonProgress.class));
    }

    private User createUser(Long id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        return user;
    }

    private Lesson createLesson(Long lessonId, int orderIndex) {
        Course course = new Course();
        course.setId(100L);

        Lesson lesson = new Lesson();
        lesson.setId(lessonId);
        lesson.setOrderIndex(orderIndex);
        lesson.setCourse(course);
        return lesson;
    }
}
