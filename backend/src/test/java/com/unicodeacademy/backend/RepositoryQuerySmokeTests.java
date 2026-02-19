package com.unicodeacademy.backend;

import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.repository.CourseRepository;
import com.unicodeacademy.backend.repository.UserExerciseAttemptRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class RepositoryQuerySmokeTests {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserExerciseAttemptRepository userExerciseAttemptRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void aggregateQueriesExecute() {
        assertNotNull(courseRepository.findCourseProgressByUserId(1L));
        assertNotNull(userExerciseAttemptRepository.summarizeByUserId(1L));
        assertNotNull(userRepository.findLeaderboard(PageRequest.of(0, 20)));
    }

    @Test
    void leaderboardExcludesAdminUsers() {
        String suffix = String.valueOf(System.nanoTime());

        User admin = new User();
        admin.setUsername("admin-" + suffix);
        admin.setEmail("admin-" + suffix + "@example.com");
        admin.setPassword("");
        admin.setRole(User.Role.ADMIN);
        admin = userRepository.save(admin);

        User regular = new User();
        regular.setUsername("regular-" + suffix);
        regular.setEmail("regular-" + suffix + "@example.com");
        regular.setPassword("");
        regular.setRole(User.Role.USER);
        regular = userRepository.save(regular);

        List<Long> leaderboardUserIds = userRepository.findLeaderboard(PageRequest.of(0, 5000))
                .stream()
                .map(UserRepository.LeaderboardProjection::getUserId)
                .toList();

        assertFalse(leaderboardUserIds.contains(admin.getId()));
        assertTrue(leaderboardUserIds.contains(regular.getId()));
    }
}
