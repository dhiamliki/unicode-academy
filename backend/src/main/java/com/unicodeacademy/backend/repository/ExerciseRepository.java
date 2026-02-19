package com.unicodeacademy.backend.repository;

import com.unicodeacademy.backend.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByLessonIdOrderByOrderIndexAsc(Long lessonId);
    long countByLessonId(Long lessonId);
}
