package com.unicodeacademy.backend.repository;

import com.unicodeacademy.backend.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByLessonIdOrderByOrderIndexAsc(Long lessonId);
    long countByLessonId(Long lessonId);
    boolean existsByLessonIdAndOrderIndex(Long lessonId, Integer orderIndex);
    boolean existsByLessonIdAndOrderIndexAndIdNot(Long lessonId, Integer orderIndex, Long id);

    @Query("SELECT MAX(e.orderIndex) FROM Exercise e WHERE e.lesson.id = :lessonId")
    Integer findMaxOrderIndexByLessonId(@Param("lessonId") Long lessonId);
}
