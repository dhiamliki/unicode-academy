package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.ExerciseAttemptRequest;
import com.unicodeacademy.backend.dto.ExerciseAttemptResponse;
import com.unicodeacademy.backend.model.Exercise;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.model.UserExerciseAttempt;
import com.unicodeacademy.backend.repository.ExerciseRepository;
import com.unicodeacademy.backend.repository.UserExerciseAttemptRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import com.unicodeacademy.backend.util.TextEncodingFixer;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseAttemptController {

    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserExerciseAttemptRepository attemptRepository;
    private final ObjectMapper objectMapper;

    public ExerciseAttemptController(UserRepository userRepository,
                                     ExerciseRepository exerciseRepository,
                                     UserExerciseAttemptRepository attemptRepository,
                                     ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.exerciseRepository = exerciseRepository;
        this.attemptRepository = attemptRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Submit an answer for an exercise.
     * For MCQ exercises, the submitted answer must match one of the configured choices.
     */
    @PostMapping("/{exerciseId}/attempt")
    public ExerciseAttemptResponse attempt(@PathVariable Long exerciseId,
                                           @RequestBody ExerciseAttemptRequest request,
                                           Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();

        String submitted = request.getSubmittedAnswer();
        if (submitted == null || submitted.isBlank()) {
            throw new IllegalArgumentException("submittedAnswer is required");
        }

        String normalizedSubmitted = TextEncodingFixer.fix(submitted).trim();
        List<String> choices = parseChoices(exercise.getChoicesJson());

        if (exercise.getType() == Exercise.ExerciseType.MCQ) {
            if (choices.size() < 3 || choices.size() > 6) {
                throw new IllegalStateException("Exercise choices must contain between 3 and 6 options");
            }
            normalizedSubmitted = findMatchingChoice(normalizedSubmitted, choices)
                    .orElseThrow(() -> new IllegalArgumentException("submittedAnswer must match one of the exercise choices"));
        }

        String expected = exercise.getAnswer() != null ? exercise.getAnswer() : "";
        String normalizedExpected = TextEncodingFixer.fix(expected).trim();

        if (exercise.getType() == Exercise.ExerciseType.MCQ && !normalizedExpected.isBlank()) {
            normalizedExpected = findMatchingChoice(normalizedExpected, choices)
                    .orElseThrow(() -> new IllegalStateException("Exercise answer must match one of the exercise choices"));
        }

        boolean correct = normalizedExpected.equalsIgnoreCase(normalizedSubmitted);

        UserExerciseAttempt attempt = new UserExerciseAttempt();
        attempt.setUser(user);
        attempt.setExercise(exercise);
        attempt.setSubmittedAnswer(normalizedSubmitted);
        attempt.setCorrect(correct);
        attempt.setAttemptedAt(Instant.now());

        attemptRepository.save(attempt);

        String explanation = TextEncodingFixer.fix(exercise.getExplanation());
        String correctAnswer = correct ? null : normalizedExpected;
        return new ExerciseAttemptResponse(correct, explanation, correctAnswer);
    }

    @PostMapping("/{exerciseId}/submit")
    public ExerciseAttemptResponse submit(@PathVariable Long exerciseId,
                                          @RequestBody ExerciseAttemptRequest request,
                                          Authentication auth) {
        return attempt(exerciseId, request, auth);
    }

    private Optional<String> findMatchingChoice(String candidate, List<String> choices) {
        return choices.stream()
                .filter(choice -> choice.equalsIgnoreCase(candidate))
                .findFirst();
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
