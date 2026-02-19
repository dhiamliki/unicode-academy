package com.unicodeacademy.backend.repository;

import com.unicodeacademy.backend.model.UserExerciseAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserExerciseAttemptRepository extends JpaRepository<UserExerciseAttempt, Long> {

    interface AttemptSummaryProjection {
        Long getAttemptedExercises();

        Long getCorrectExercises();
    }

    List<UserExerciseAttempt> findByUserId(Long userId);

    List<UserExerciseAttempt> findByUserIdAndExercise_Lesson_Id(Long userId, Long lessonId);

    @Query("""
            select count(a) as attemptedExercises,
                   coalesce(sum(case when a.correct = true then 1 else 0 end), 0) as correctExercises
            from UserExerciseAttempt a
            where a.user.id = :userId
            """)
    AttemptSummaryProjection summarizeByUserId(@Param("userId") Long userId);

    @Query("""
            select count(distinct a.exercise.id)
            from UserExerciseAttempt a
            where a.user.id = :userId
              and a.exercise.lesson.id = :lessonId
            """)
    long countDistinctAttemptedExercisesByUserIdAndLessonId(@Param("userId") Long userId,
                                                             @Param("lessonId") Long lessonId);

    void deleteByUserId(Long userId);

}
