package com.unicodeacademy.backend.repository;

import com.unicodeacademy.backend.model.UserCourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserCourseProgressRepository
        extends JpaRepository<UserCourseProgress, Long> {

    List<UserCourseProgress> findByUserId(Long userId);

    @Query("select p from UserCourseProgress p " +
            "join fetch p.course c " +
            "join fetch c.language " +
            "where p.user.id = :userId")
    List<UserCourseProgress> findByUserIdWithCourseAndLanguage(@Param("userId") Long userId);

    Optional<UserCourseProgress> findByUserIdAndCourseId(Long userId, Long courseId);

    void deleteByUserId(Long userId);
}
