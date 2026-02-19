package com.unicodeacademy.backend.repository;

import com.unicodeacademy.backend.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    interface LeaderboardProjection {
        Long getUserId();

        String getUsername();

        Long getPoints();

        Long getCompletedLessons();

        Long getCorrectExercises();
    }

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByRole(User.Role role);
    long countByRole(User.Role role);

    @Query(value = """
            with lesson_counts as (
                select ulp.user_id as user_id, count(*) as completed_lessons
                from user_lesson_progress ulp
                where ulp.status = 'COMPLETED'
                group by ulp.user_id
            ),
            attempt_counts as (
                select uea.user_id as user_id,
                       sum(case when uea.is_correct then 1 else 0 end) as correct_exercises
                from user_exercise_attempts uea
                group by uea.user_id
            ),
            course_totals as (
                select l.course_id as course_id, count(*) as total_lessons
                from lessons l
                group by l.course_id
            ),
            user_course_completion as (
                select ulp.user_id as user_id, l.course_id as course_id, count(*) as completed_lessons
                from user_lesson_progress ulp
                join lessons l on l.id = ulp.lesson_id
                where ulp.status = 'COMPLETED'
                group by ulp.user_id, l.course_id
            ),
            completed_courses as (
                select ucc.user_id as user_id, count(*) as completed_courses
                from user_course_completion ucc
                join course_totals ct
                  on ct.course_id = ucc.course_id
                 and ucc.completed_lessons = ct.total_lessons
                group by ucc.user_id
            )
            select
                u.id as userId,
                coalesce(nullif(u.username, ''), concat('User-', cast(u.id as varchar))) as username,
                coalesce(lc.completed_lessons, 0) as completedLessons,
                coalesce(ac.correct_exercises, 0) as correctExercises,
                (coalesce(lc.completed_lessons, 0) * 10)
                    + (coalesce(ac.correct_exercises, 0) * 2)
                    + (coalesce(cc.completed_courses, 0) * 50) as points
            from users u
            left join lesson_counts lc on lc.user_id = u.id
            left join attempt_counts ac on ac.user_id = u.id
            left join completed_courses cc on cc.user_id = u.id
            where (u.role is null or u.role <> 'ADMIN')
            order by points desc, username asc
            """, nativeQuery = true)
    List<LeaderboardProjection> findLeaderboard(Pageable pageable);

    @Query("select u.username from User u where u.username is not null and trim(u.username) <> '' order by lower(u.username) asc")
    List<String> findAllNonBlankUsernames();
}
