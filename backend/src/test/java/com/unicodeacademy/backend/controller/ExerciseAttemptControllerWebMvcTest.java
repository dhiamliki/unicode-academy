package com.unicodeacademy.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unicodeacademy.backend.model.Exercise;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.model.UserExerciseAttempt;
import com.unicodeacademy.backend.repository.ExerciseRepository;
import com.unicodeacademy.backend.repository.UserExerciseAttemptRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import com.unicodeacademy.backend.security.AuthRateLimitFilter;
import com.unicodeacademy.backend.security.JwtAuthFilter;
import com.unicodeacademy.backend.service.AiService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ExerciseAttemptController.class)
@AutoConfigureMockMvc(addFilters = false)
class ExerciseAttemptControllerWebMvcTest {

    private static final String EMAIL = "student@unicode.test";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private ExerciseRepository exerciseRepository;

    @MockBean
    private UserExerciseAttemptRepository attemptRepository;

    @MockBean
    private AiService aiService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private AuthRateLimitFilter authRateLimitFilter;

    @Test
    void attemptAcceptsJsonAliasAndSavesCorrectMcqAttempt() throws Exception {
        User user = createUser();
        Exercise exercise = createMcqExercise(5L, "[\"Choice A\",\"Choice B\",\"Choice C\"]", "Choice B");
        exercise.setExplanation("Because Choice B is correct");

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));
        when(attemptRepository.save(any(UserExerciseAttempt.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(post("/api/exercises/5/attempt")
                        .principal(authentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "answer": "choice b"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isCorrect").value(true))
                .andExpect(jsonPath("$.explanation").value("Because Choice B is correct"));

        ArgumentCaptor<UserExerciseAttempt> captor = ArgumentCaptor.forClass(UserExerciseAttempt.class);
        verify(attemptRepository).save(captor.capture());
        UserExerciseAttempt savedAttempt = captor.getValue();
        assertEquals(user, savedAttempt.getUser());
        assertEquals(exercise, savedAttempt.getExercise());
        assertEquals("Choice B", savedAttempt.getSubmittedAnswer());
        assertTrue(savedAttempt.isCorrect());
        assertNotNull(savedAttempt.getAttemptedAt());
    }

    @Test
    void submitReturnsCorrectAnswerForIncorrectCodeAttempt() throws Exception {
        User user = createUser();
        Exercise exercise = new Exercise();
        exercise.setId(7L);
        exercise.setType(Exercise.ExerciseType.CODE);
        exercise.setAnswer("print(2)");
        exercise.setExplanation("Use the expected output");

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(exerciseRepository.findById(7L)).thenReturn(Optional.of(exercise));
        when(attemptRepository.save(any(UserExerciseAttempt.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(post("/api/exercises/7/submit")
                        .principal(authentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("submittedAnswer", "print(1)"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isCorrect").value(false))
                .andExpect(jsonPath("$.explanation").value("Use the expected output"))
                .andExpect(jsonPath("$.correctAnswer").value("print(2)"));

        ArgumentCaptor<UserExerciseAttempt> captor = ArgumentCaptor.forClass(UserExerciseAttempt.class);
        verify(attemptRepository).save(captor.capture());
        assertFalse(captor.getValue().isCorrect());
        assertEquals("print(1)", captor.getValue().getSubmittedAnswer());
    }

    @Test
    void attemptReturnsBadRequestWhenSubmittedAnswerIsBlank() throws Exception {
        User user = createUser();
        Exercise exercise = createMcqExercise(5L, "[\"Choice A\",\"Choice B\",\"Choice C\"]", "Choice B");

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));

        mockMvc.perform(post("/api/exercises/5/attempt")
                        .principal(authentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("submittedAnswer", "   "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("bad_request"))
                .andExpect(jsonPath("$.message").value("submittedAnswer est obligatoire"));

        verify(attemptRepository, never()).save(any(UserExerciseAttempt.class));
    }

    @Test
    void attemptReturnsBadRequestWhenMcqChoiceDoesNotMatchConfiguredOptions() throws Exception {
        User user = createUser();
        Exercise exercise = createMcqExercise(5L, "[\"Choice A\",\"Choice B\",\"Choice C\"]", "Choice B");

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(exerciseRepository.findById(5L)).thenReturn(Optional.of(exercise));

        mockMvc.perform(post("/api/exercises/5/attempt")
                        .principal(authentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("submittedAnswer", "Choice D"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("bad_request"))
                .andExpect(jsonPath("$.message").value("submittedAnswer doit correspondre a l'un des choix de l'exercice"));

        verify(attemptRepository, never()).save(any(UserExerciseAttempt.class));
    }

    private Authentication authentication() {
        return new UsernamePasswordAuthenticationToken(EMAIL, "ignored");
    }

    private User createUser() {
        User user = new User();
        user.setId(1L);
        user.setEmail(EMAIL);
        return user;
    }

    private Exercise createMcqExercise(Long id, String choicesJson, String answer) {
        Exercise exercise = new Exercise();
        exercise.setId(id);
        exercise.setType(Exercise.ExerciseType.MCQ);
        exercise.setChoicesJson(choicesJson);
        exercise.setAnswer(answer);
        return exercise;
    }
}
