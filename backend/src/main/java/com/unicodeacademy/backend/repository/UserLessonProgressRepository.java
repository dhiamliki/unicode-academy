package com.unicodeacademy.backend.repository;

import com.unicodeacademy.backend.model.UserLessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, Long> {

    Optional<UserLessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);

    List<UserLessonProgress> findByUserId(Long userId);

    @Query("""
            select p
            from UserLessonProgress p
            join fetch p.lesson l
            join fetch l.course c
            where p.user.id = :userId
            """)
    List<UserLessonProgress> findByUserIdWithLessonAndCourse(@Param("userId") Long userId);

    void deleteByUserId(Long userId);

    @Modifying
    void deleteByLesson_Id(Long lessonId);

    @Modifying
    void deleteByLesson_Course_Id(Long courseId);

    long countByUserIdAndStatus(Long userId, UserLessonProgress.Status status);

    @Query("""
            select count(p)
            from UserLessonProgress p
            where p.user.id = :userId
              and p.lesson.course.id = :courseId
              and p.status = com.unicodeacademy.backend.model.UserLessonProgress.Status.COMPLETED
            """)
    long countCompletedByUserIdAndCourseId(@Param("userId") Long userId,
                                           @Param("courseId") Long courseId);
}
