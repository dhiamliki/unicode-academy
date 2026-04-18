package com.unicodeacademy.backend.repository;

import com.unicodeacademy.backend.model.UserCourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    @Modifying
    void deleteByCourse_Id(Long courseId);

    List<UserCourseProgress> findByCourse_Id(Long courseId);

    long countByCourse_Id(Long courseId);

    long countByUserIdAndStatus(Long userId, UserCourseProgress.Status status);

    long countByCourse_IdAndStatus(Long courseId, UserCourseProgress.Status status);
}
