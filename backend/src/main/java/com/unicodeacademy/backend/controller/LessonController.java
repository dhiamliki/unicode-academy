package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.ExerciseResponse;
import com.unicodeacademy.backend.dto.LessonResponse;
import com.unicodeacademy.backend.model.Exercise;
import com.unicodeacademy.backend.model.Lesson;
import com.unicodeacademy.backend.repository.ExerciseRepository;
import com.unicodeacademy.backend.repository.LessonRepository;
import com.unicodeacademy.backend.util.TextEncodingFixer;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {
    private static final String DEFAULT_PRACTICE_LANGUAGE = "text";

    private final LessonRepository lessonRepository;
    private final ExerciseRepository exerciseRepository;
    private final ObjectMapper objectMapper;

    public LessonController(LessonRepository lessonRepository,
                            ExerciseRepository exerciseRepository,
                            ObjectMapper objectMapper) {
        this.lessonRepository = lessonRepository;
        this.exerciseRepository = exerciseRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/{id}")
    public LessonResponse lessonById(@PathVariable Long id) {
        List<ExerciseResponse> exercises = exerciseRepository.findByLessonIdOrderByOrderIndexAsc(id)
                .stream()
                .map(this::toExerciseResponse)
                .collect(Collectors.toList());

        try {
            Lesson lesson = lessonRepository.findByIdWithCourseAndLanguage(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lecon introuvable"));
            return toLessonResponse(lesson, exercises);
        } catch (RuntimeException ex) {
            if (!isMissingLessonColumnError(ex)) {
                throw ex;
            }

            LessonRepository.LessonCoreProjection core = lessonRepository.findCoreById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lecon introuvable"));
            return toFallbackLessonResponse(core, exercises);
        }
    }

    @GetMapping("/{id}/exercises")
    public List<ExerciseResponse> exercisesByLesson(@PathVariable Long id) {
        return exerciseRepository.findByLessonIdOrderByOrderIndexAsc(id)
                .stream()
                .map(this::toExerciseResponse)
                .collect(Collectors.toList());
    }

    private LessonResponse toLessonResponse(Lesson lesson) {
        return toLessonResponse(lesson, Collections.emptyList());
    }

    private LessonResponse toLessonResponse(Lesson lesson, List<ExerciseResponse> exercises) {
        return new LessonResponse(
                lesson.getId(),
                TextEncodingFixer.fix(lesson.getTitle()),
                TextEncodingFixer.fix(lesson.getContent()),
                lesson.getOrderIndex(),
                exercises,
                safeStarterCode(lesson.getStarterCode()),
                TextEncodingFixer.fix(lesson.getEditorLanguage()),
                resolvePracticeLanguage(lesson),
                TextEncodingFixer.fix(lesson.getExecutionType()),
                TextEncodingFixer.fix(lesson.getSampleOutput())
        );
    }

    private LessonResponse toFallbackLessonResponse(LessonRepository.LessonCoreProjection lesson,
                                                    List<ExerciseResponse> exercises) {
        return new LessonResponse(
                lesson.getId(),
                TextEncodingFixer.fix(lesson.getTitle()),
                TextEncodingFixer.fix(lesson.getContent()),
                lesson.getOrderIndex(),
                exercises,
                "",
                null,
                resolvePracticeLanguage(null, lesson.getLanguageCode()),
                null,
                null
        );
    }

    private ExerciseResponse toExerciseResponse(Exercise exercise) {
        return new ExerciseResponse(
                exercise.getId(),
                exercise.getType(),
                TextEncodingFixer.fix(exercise.getQuestion()),
                parseChoices(exercise.getChoicesJson()),
                TextEncodingFixer.fix(exercise.getExplanation()),
                exercise.getOrderIndex()
        );
    }

    private List<String> parseChoices(String choicesJson) {
        if (choicesJson == null || choicesJson.isBlank()) {
            return Collections.emptyList();
        }

        try {
            List<String> rawChoices = objectMapper.readValue(choicesJson, new TypeReference<List<String>>() {
            });

            if (rawChoices == null) {
                return Collections.emptyList();
            }

            return rawChoices.stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(choice -> !choice.isBlank())
                    .map(TextEncodingFixer::fix)
                    .distinct()
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            return Collections.emptyList();
        }
    }

    private String resolvePracticeLanguage(Lesson lesson) {
        return resolvePracticeLanguage(lesson.getEditorLanguage(),
                lesson.getCourse() != null && lesson.getCourse().getLanguage() != null
                        ? lesson.getCourse().getLanguage().getCode()
                        : null);
    }

    private String resolvePracticeLanguage(String editorLanguage, String fallbackLanguageCode) {
        if (isMeaningfulLanguage(editorLanguage)) {
            return editorLanguage;
        }

        if (hasText(fallbackLanguageCode)) {
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
