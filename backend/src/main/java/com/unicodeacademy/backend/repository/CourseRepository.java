package com.unicodeacademy.backend.repository;

import com.unicodeacademy.backend.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    interface CourseProgressProjection {
        Long getCourseId();

        Long getTotalLessons();

        Long getCompletedLessons();
    }

    Optional<Course> findByCode(String code);
    List<Course> findByLanguage_CodeIgnoreCase(String code);

    @Query("""
            select c.id as courseId,
                   count(l.id) as totalLessons,
                   coalesce(sum(case when lp.id is not null then 1 else 0 end), 0) as completedLessons
            from Course c
            left join c.lessons l
            left join UserLessonProgress lp
                on lp.lesson = l
               and lp.user.id = :userId
               and lp.status = com.unicodeacademy.backend.model.UserLessonProgress.Status.COMPLETED
            group by c.id
            order by c.id
            """)
    List<CourseProgressProjection> findCourseProgressByUserId(@Param("userId") Long userId);
}
