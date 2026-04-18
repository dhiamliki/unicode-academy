package com.unicodeacademy.backend.service;

import com.unicodeacademy.backend.dto.LeaderboardEntryResponse;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.model.UserLessonProgress;
import com.unicodeacademy.backend.repository.CourseRepository;
import com.unicodeacademy.backend.repository.UserExerciseAttemptRepository;
import com.unicodeacademy.backend.repository.UserLessonProgressRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeaderboardServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserLessonProgressRepository lessonProgressRepository;

    @Mock
    private UserExerciseAttemptRepository exerciseAttemptRepository;

    @Mock
    private CourseRepository courseRepository;

    @Test
    void getLeaderboardUsesGlobalPointsRuleAndExcludesAdmins() {
        LeaderboardService leaderboardService = new LeaderboardService(
                userRepository,
                lessonProgressRepository,
                exerciseAttemptRepository,
                courseRepository
        );

        User admin = createUser(99L, "admin", User.Role.ADMIN);
        User learnerOne = createUser(1L, "alice", User.Role.USER);
        User learnerTwo = createUser(2L, "bob", User.Role.USER);

        when(userRepository.findAll(Sort.by(Sort.Order.asc("username"), Sort.Order.asc("id"))))
                .thenReturn(List.of(learnerOne, admin, learnerTwo));

        when(lessonProgressRepository.countByUserIdAndStatus(1L, UserLessonProgress.Status.COMPLETED)).thenReturn(4L);
        when(lessonProgressRepository.countByUserIdAndStatus(2L, UserLessonProgress.Status.COMPLETED)).thenReturn(5L);
        when(exerciseAttemptRepository.countByUserIdAndCorrectTrue(1L)).thenReturn(7L);
        when(exerciseAttemptRepository.countByUserIdAndCorrectTrue(2L)).thenReturn(2L);

        when(courseRepository.findCourseProgressByUserId(1L))
                .thenReturn(List.of(new CourseProgressProjectionStub(10L, 4L, 4L)));
        when(courseRepository.findCourseProgressByUserId(2L))
                .thenReturn(List.of(new CourseProgressProjectionStub(11L, 6L, 5L)));

        List<LeaderboardEntryResponse> result = leaderboardService.getLeaderboard(10);

        assertEquals(2, result.size());
        assertEquals("alice", result.get(0).getUsername());
        assertEquals(70L, result.get(0).getPoints());
        assertEquals(4L, result.get(0).getCompletedLessons());
        assertEquals(7L, result.get(0).getCorrectExercises());
        assertEquals("bob", result.get(1).getUsername());
        assertEquals(50L, result.get(1).getPoints());
    }

    private User createUser(Long id, String username, User.Role role) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setRole(role);
        return user;
    }

    private record CourseProgressProjectionStub(
            Long courseId,
            Long totalLessons,
            Long completedLessons
    ) implements CourseRepository.CourseProgressProjection {
        @Override
        public Long getCourseId() {
            return courseId;
        }

        @Override
        public Long getTotalLessons() {
            return totalLessons;
        }

        @Override
        public Long getCompletedLessons() {
            return completedLessons;
        }
    }
}
