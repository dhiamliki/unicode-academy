package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.CourseResponse;
import com.unicodeacademy.backend.dto.LessonResponse;
import com.unicodeacademy.backend.dto.ProgrammingLanguageResponse;
import com.unicodeacademy.backend.model.Course;
import com.unicodeacademy.backend.model.Lesson;
import com.unicodeacademy.backend.model.ProgrammingLanguage;
import com.unicodeacademy.backend.repository.CourseRepository;
import com.unicodeacademy.backend.repository.LessonRepository;
import com.unicodeacademy.backend.util.TextEncodingFixer;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private static final String DEFAULT_PRACTICE_LANGUAGE = "text";

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;

    public CourseController(CourseRepository courseRepository, LessonRepository lessonRepository) {
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
    }

    @GetMapping
    public List<CourseResponse> allCourses(@RequestParam(name = "language", required = false) String languageCode) {
        List<Course> courses;
        if (languageCode == null || languageCode.isBlank()) {
            courses = courseRepository.findAll();
        } else {
            courses = courseRepository.findByLanguage_CodeIgnoreCase(languageCode);
        }

        return courses
                .stream()
                .map(this::toCourseResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public CourseResponse courseById(@PathVariable Long id) {
        return courseRepository.findById(id)
                .map(this::toCourseResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cours introuvable"));
    }

    @GetMapping("/{id}/lessons")
    public List<LessonResponse> lessonsByCourse(@PathVariable Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cours introuvable"));
        String fallbackLanguageCode = course.getLanguage() != null ? course.getLanguage().getCode() : null;

        try {
            return lessonRepository.findByCourseIdOrderByOrderIndexAsc(id)
                    .stream()
                    .map(lesson -> toLessonResponse(lesson, fallbackLanguageCode))
                    .collect(Collectors.toList());
        } catch (RuntimeException ex) {
            if (!isMissingLessonColumnError(ex)) {
                throw ex;
            }

            return lessonRepository.findCoreByCourseId(id)
                    .stream()
                    .map(projection -> toFallbackLessonResponse(projection, fallbackLanguageCode))
                    .collect(Collectors.toList());
        }
    }

    private CourseResponse toCourseResponse(Course course) {
        ProgrammingLanguage language = course.getLanguage();
        ProgrammingLanguageResponse languageResponse = null;
        if (language != null) {
            languageResponse = new ProgrammingLanguageResponse(
                    language.getId(),
                    language.getCode(),
                    language.getName()
            );
        }

        return new CourseResponse(
                course.getId(),
                course.getCode(),
                TextEncodingFixer.fix(course.getTitle()),
                TextEncodingFixer.fix(course.getDescription()),
                languageResponse,
                Collections.emptyList()
        );
    }

    private LessonResponse toLessonResponse(Lesson lesson, String fallbackLanguageCode) {
        return new LessonResponse(
                lesson.getId(),
                TextEncodingFixer.fix(lesson.getTitle()),
                TextEncodingFixer.fix(lesson.getContent()),
                lesson.getOrderIndex(),
                Collections.emptyList(),
                safeStarterCode(lesson.getStarterCode()),
                TextEncodingFixer.fix(lesson.getEditorLanguage()),
                resolvePracticeLanguage(lesson.getEditorLanguage(), fallbackLanguageCode),
                TextEncodingFixer.fix(lesson.getExecutionType()),
                TextEncodingFixer.fix(lesson.getSampleOutput())
        );
    }

    private LessonResponse toFallbackLessonResponse(LessonRepository.LessonCoreProjection lesson, String fallbackLanguageCode) {
        String languageCode = hasText(lesson.getLanguageCode()) ? lesson.getLanguageCode() : fallbackLanguageCode;
        return new LessonResponse(
                lesson.getId(),
                TextEncodingFixer.fix(lesson.getTitle()),
                TextEncodingFixer.fix(lesson.getContent()),
                lesson.getOrderIndex(),
                Collections.emptyList(),
                "",
                null,
                resolvePracticeLanguage(null, languageCode),
                null,
                null
        );
    }

    private String resolvePracticeLanguage(String editorLanguage, String fallbackLanguageCode) {
        if (isMeaningfulLanguage(editorLanguage)) {
            return editorLanguage;
        }

        if (fallbackLanguageCode != null && !fallbackLanguageCode.isBlank()) {
            return TextEncodingFixer.fix(fallbackLanguageCode.trim());
        }

        return DEFAULT_PRACTICE_LANGUAGE;
    }

    private boolean isMeaningfulLanguage(String language) {
        if (language == null || language.isBlank()) {
            return false;
        }

        String normalized = language.trim().toLowerCase(Locale.ROOT);
        return !normalized.equals("code")
                && !normalized.equals("plaintext")
                && !normalized.equals("text");
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String safeStarterCode(String starterCode) {
        if (!hasText(starterCode)) {
            return "";
        }
        if (isLegacyOidReference(starterCode)) {
            return "";
        }
        return TextEncodingFixer.fix(starterCode);
    }

    private boolean isLegacyOidReference(String value) {
        String trimmed = value == null ? "" : value.trim();
        return trimmed.length() >= 5 && trimmed.chars().allMatch(Character::isDigit);
    }

    private boolean isMissingLessonColumnError(Throwable throwable) {
        Throwable cursor = throwable;
        while (cursor != null) {
            String sqlState = extractSqlState(cursor);
            if ("42703".equals(sqlState)) {
                return true;
            }

            String message = cursor.getMessage();
            if (message != null) {
                String normalized = message.toLowerCase(Locale.ROOT);
                boolean referencesExpectedColumn = normalized.contains("starter_code")
                        || normalized.contains("editor_language")
                        || normalized.contains("execution_type")
                        || normalized.contains("sample_output");
                boolean missingColumnSignal = normalized.contains("does not exist")
                        || normalized.contains("n'existe pas")
                        || normalized.contains("unknown column")
                        || normalized.contains("colonne");

                if (referencesExpectedColumn && missingColumnSignal) {
                    return true;
                }
            }
            cursor = cursor.getCause();
        }
        return false;
    }

    private String extractSqlState(Throwable throwable) {
        try {
            var method = throwable.getClass().getMethod("getSQLState");
            Object value = method.invoke(throwable);
            return value != null ? value.toString() : null;
        } catch (Exception ex) {
            return null;
        }
    }
}
