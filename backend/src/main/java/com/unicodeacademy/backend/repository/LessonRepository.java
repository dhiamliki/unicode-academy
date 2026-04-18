package com.unicodeacademy.backend.repository;

import com.unicodeacademy.backend.dto.LessonSummaryDto;
import com.unicodeacademy.backend.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    interface LessonCoreProjection {
        Long getId();

        String getTitle();

        String getContent();

        Integer getOrderIndex();

        String getLanguageCode();
    }

    List<Lesson> findByCourseIdOrderByOrderIndexAsc(Long courseId);

    @Query("""
            select new com.unicodeacademy.backend.dto.LessonSummaryDto(
                l.id,
                l.title,
                case
                    when lower(l.title) like '%quiz%'
                      or lower(l.title) like '%test%'
                      or lower(l.title) like '%exercice%'
                    then 'FINAL_QUIZ'
                    else 'REGULAR'
                end,
                l.orderIndex
            )
            from Lesson l
            where l.course.id = :courseId
            order by l.orderIndex asc
            """)
    List<LessonSummaryDto> findSummaryByCourseId(@Param("courseId") Long courseId);

    @Query("""
            select l
            from Lesson l
            join fetch l.course c
            join fetch c.language
            where l.id = :lessonId
            """)
    Optional<Lesson> findByIdWithCourseAndLanguage(@Param("lessonId") Long lessonId);

    @Query("""
            select l
            from Lesson l
            join fetch l.course c
            join fetch c.language
            """)
    List<Lesson> findAllWithCourseAndLanguage();

    @Query(value = """
            select l.id as id,
                   l.title as title,
                   l.content as content,
                   l.order_index as orderIndex,
                   pl.code as languageCode
            from lessons l
            join courses c on c.id = l.course_id
            left join programming_languages pl on pl.id = c.language_id
            where l.course_id = :courseId
            order by l.order_index asc
            """, nativeQuery = true)
    List<LessonCoreProjection> findCoreByCourseId(@Param("courseId") Long courseId);

    @Query(value = """
            select l.id as id,
                   l.title as title,
                   l.content as content,
                   l.order_index as orderIndex,
                   pl.code as languageCode
            from lessons l
            join courses c on c.id = l.course_id
            left join programming_languages pl on pl.id = c.language_id
            where l.id = :lessonId
            """, nativeQuery = true)
    Optional<LessonCoreProjection> findCoreById(@Param("lessonId") Long lessonId);

    Optional<Lesson> findByCourseIdAndOrderIndex(Long courseId, Integer orderIndex);
    long countByCourseId(Long courseId);
    boolean existsByCourseIdAndOrderIndex(Long courseId, Integer orderIndex);
    boolean existsByCourseIdAndOrderIndexAndIdNot(Long courseId, Integer orderIndex, Long id);

    @Query("SELECT MAX(l.orderIndex) FROM Lesson l WHERE l.course.id = :courseId")
    Integer findMaxOrderIndexByCourseId(@Param("courseId") Long courseId);
}
