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
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

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
        Lesson lesson = lessonRepository.findById(id).orElseThrow();
        List<ExerciseResponse> exercises = exerciseRepository.findByLessonIdOrderByOrderIndexAsc(id)
                .stream()
                .map(this::toExerciseResponse)
                .collect(Collectors.toList());
        return toLessonResponse(lesson, exercises);
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
                exercises
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
}
