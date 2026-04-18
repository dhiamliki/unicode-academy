package com.unicodeacademy.backend.service;

import com.unicodeacademy.backend.dto.LeaderboardEntryResponse;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.model.UserLessonProgress;
import com.unicodeacademy.backend.repository.CourseRepository;
import com.unicodeacademy.backend.repository.UserExerciseAttemptRepository;
import com.unicodeacademy.backend.repository.UserLessonProgressRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import com.unicodeacademy.backend.util.TextEncodingFixer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaderboardService {

    /**
     * UniCode Academy global leaderboard rules (non-weekly, cumulative since registration):
     *
     * <p><strong>Points system:</strong>
     * <ul>
     *   <li>+10 XP per lesson explicitly marked completed or auto-completed via exercise mastery.
     *   <li>+30 XP bonus per course fully completed (all lessons completed).
     * </ul>
     *
     * <p><strong>Ranking algorithm:</strong> Entries are sorted by:
     * <ol>
     *   <li>Total points (descending)
     *   <li>Number of completed lessons (descending)
     *   <li>Number of completed courses (descending)
     *   <li>Number of correct exercise attempts (descending)
     *   <li>Username alphabetically (ascending, case-insensitive)
     * </ol>
     *
     * <p><strong>Exclusions:</strong> Users with ADMIN role are excluded from the public leaderboard.
     *
     * <p>The leaderboard returns at most the requested limit (capped at 100). Admins are filtered
     * out at query time; their progress still contributes to XP calculation for their own account
     * but does not affect other learners' rankings.
     */
    private static final int POINTS_PER_COMPLETED_LESSON = 10;
    private static final int BONUS_PER_COMPLETED_COURSE = 30;

    private final UserRepository userRepository;
    private final UserLessonProgressRepository lessonProgressRepository;
    private final UserExerciseAttemptRepository exerciseAttemptRepository;
    private final CourseRepository courseRepository;

    public List<LeaderboardEntryResponse> getLeaderboard(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100));

        List<LeaderboardScore> scores = userRepository.findAll(Sort.by(Sort.Order.asc("username"), Sort.Order.asc("id")))
                .stream()
                .filter(user -> user.getRole() == null || user.getRole() != User.Role.ADMIN)
                .map(this::toScore)
                .sorted(
                        Comparator.comparingLong(LeaderboardScore::points).reversed()
                                .thenComparing(Comparator.comparingLong(LeaderboardScore::completedLessons).reversed())
                                .thenComparing(Comparator.comparingLong(LeaderboardScore::completedCourses).reversed())
                                .thenComparing(Comparator.comparingLong(LeaderboardScore::correctExercises).reversed())
                                .thenComparing(score -> score.username().toLowerCase(Locale.ROOT))
                )
                .limit(safeLimit)
                .toList();

        return java.util.stream.IntStream.range(0, scores.size())
                .mapToObj(index -> {
                    LeaderboardScore score = scores.get(index);
                    return new LeaderboardEntryResponse(
                            index + 1,
                            TextEncodingFixer.fix(score.username()),
                            score.points(),
                            score.completedLessons(),
                            score.correctExercises()
                    );
                })
                .toList();
    }

    private LeaderboardScore toScore(User user) {
        long completedLessons = lessonProgressRepository.countByUserIdAndStatus(
                user.getId(),
                UserLessonProgress.Status.COMPLETED
        );
        long completedCourses = courseRepository.findCourseProgressByUserId(user.getId())
                .stream()
                .filter(row -> {
                    long totalLessons = row.getTotalLessons() != null ? row.getTotalLessons() : 0L;
                    long finishedLessons = row.getCompletedLessons() != null ? row.getCompletedLessons() : 0L;
                    return totalLessons > 0 && finishedLessons >= totalLessons;
                })
                .count();
        long correctExercises = exerciseAttemptRepository.countByUserIdAndCorrectTrue(user.getId());
        long points = (completedLessons * POINTS_PER_COMPLETED_LESSON)
                + (completedCourses * BONUS_PER_COMPLETED_COURSE);

        String username = user.getUsername() != null && !user.getUsername().isBlank()
                ? user.getUsername().trim()
                : "Utilisateur-" + user.getId();

        return new LeaderboardScore(username, points, completedLessons, completedCourses, correctExercises);
    }

    private record LeaderboardScore(
            String username,
            long points,
            long completedLessons,
            long completedCourses,
            long correctExercises
    ) {
    }
}
