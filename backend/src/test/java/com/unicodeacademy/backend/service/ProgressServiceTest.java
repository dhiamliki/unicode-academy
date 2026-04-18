package com.unicodeacademy.backend.service;

import com.unicodeacademy.backend.model.Course;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.model.UserCourseProgress;
import com.unicodeacademy.backend.repository.CourseRepository;
import com.unicodeacademy.backend.repository.LessonRepository;
import com.unicodeacademy.backend.repository.UserCourseProgressRepository;
import com.unicodeacademy.backend.repository.UserExerciseAttemptRepository;
import com.unicodeacademy.backend.repository.UserLessonProgressRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProgressServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private UserCourseProgressRepository progressRepository;

    @Mock
    private UserLessonProgressRepository lessonProgressRepository;

    @Mock
    private UserExerciseAttemptRepository attemptRepository;

    @Test
    void syncCourseProgressMarksCourseCompletedWhenAllLessonsAreCompleted() {
        ProgressService progressService = buildService();
        User user = createUser(1L);
        Course course = createCourse(10L);

        when(lessonRepository.countByCourseId(10L)).thenReturn(4L);
        when(lessonProgressRepository.countCompletedByUserIdAndCourseId(1L, 10L)).thenReturn(4L);
        when(progressRepository.findByUserIdAndCourseId(1L, 10L)).thenReturn(Optional.empty());
        when(progressRepository.save(any(UserCourseProgress.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UserCourseProgress result = progressService.syncCourseProgressForUser(user, course);

        assertEquals(UserCourseProgress.Status.COMPLETED, result.getStatus());
        assertNotNull(result.getCompletedAt());
        assertSame(user, result.getUser());
        assertSame(course, result.getCourse());
    }

    @Test
    void syncCourseProgressMarksCourseInProgressWhenLessonsRemain() {
        ProgressService progressService = buildService();
        User user = createUser(1L);
        Course course = createCourse(10L);

        UserCourseProgress existingProgress = new UserCourseProgress();
        existingProgress.setUser(user);
        existingProgress.setCourse(course);
        existingProgress.setStatus(UserCourseProgress.Status.COMPLETED);
        existingProgress.setCompletedAt(Instant.parse("2026-03-01T10:15:30Z"));

        when(lessonRepository.countByCourseId(10L)).thenReturn(5L);
        when(lessonProgressRepository.countCompletedByUserIdAndCourseId(1L, 10L)).thenReturn(3L);
        when(progressRepository.findByUserIdAndCourseId(1L, 10L)).thenReturn(Optional.of(existingProgress));
        when(progressRepository.save(existingProgress)).thenReturn(existingProgress);

        UserCourseProgress result = progressService.syncCourseProgressForUser(user, course);

        assertSame(existingProgress, result);
        assertEquals(UserCourseProgress.Status.IN_PROGRESS, result.getStatus());
        assertNull(result.getCompletedAt());
    }

    @Test
    void recalculateCourseProgressForAllUsersRefreshesEachStoredRow() {
        ProgressService progressService = buildService();
        Course course = createCourse(10L);
        User userA = createUser(1L);
        User userB = createUser(2L);

        UserCourseProgress rowA = new UserCourseProgress();
        rowA.setUser(userA);
        rowA.setCourse(course);
        UserCourseProgress rowB = new UserCourseProgress();
        rowB.setUser(userB);
        rowB.setCourse(course);

        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));
        when(progressRepository.findByCourse_Id(10L)).thenReturn(List.of(rowA, rowB));

        when(lessonRepository.countByCourseId(10L)).thenReturn(2L);
        when(lessonProgressRepository.countCompletedByUserIdAndCourseId(1L, 10L)).thenReturn(2L);
        when(lessonProgressRepository.countCompletedByUserIdAndCourseId(2L, 10L)).thenReturn(1L);

        when(progressRepository.findByUserIdAndCourseId(1L, 10L)).thenReturn(Optional.of(rowA));
        when(progressRepository.findByUserIdAndCourseId(2L, 10L)).thenReturn(Optional.of(rowB));
        when(progressRepository.save(any(UserCourseProgress.class))).thenAnswer(invocation -> invocation.getArgument(0));

        progressService.recalculateCourseProgressForAllUsers(10L);

        assertEquals(UserCourseProgress.Status.COMPLETED, rowA.getStatus());
        assertNotNull(rowA.getCompletedAt());
        assertEquals(UserCourseProgress.Status.IN_PROGRESS, rowB.getStatus());
        assertNull(rowB.getCompletedAt());
        verify(progressRepository, times(2)).save(any(UserCourseProgress.class));
    }

    private ProgressService buildService() {
        return new ProgressService(
                userRepository,
                courseRepository,
                lessonRepository,
                progressRepository,
                lessonProgressRepository,
                attemptRepository
        );
    }

    private User createUser(Long id) {
        User user = new User();
        user.setId(id);
        return user;
    }

    private Course createCourse(Long id) {
        Course course = new Course();
        course.setId(id);
        return course;
    }
}
