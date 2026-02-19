package com.unicodeacademy.backend.repository;

import com.unicodeacademy.backend.model.ProgrammingLanguage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProgrammingLanguageRepository extends JpaRepository<ProgrammingLanguage, Long> {
    Optional<ProgrammingLanguage> findByCode(String code);
    Optional<ProgrammingLanguage> findByCodeIgnoreCase(String code);
    boolean existsByCode(String code);
}
