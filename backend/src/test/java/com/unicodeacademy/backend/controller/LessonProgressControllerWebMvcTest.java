package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.model.Course;
import com.unicodeacademy.backend.model.Lesson;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.model.UserLessonProgress;
import com.unicodeacademy.backend.repository.UserLessonProgressRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import com.unicodeacademy.backend.security.AuthRateLimitFilter;
import com.unicodeacademy.backend.security.JwtAuthFilter;
import com.unicodeacademy.backend.service.AiService;
import com.unicodeacademy.backend.service.LessonProgressService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LessonProgressController.class)
@AutoConfigureMockMvc(addFilters = false)
class LessonProgressControllerWebMvcTest {

    private static final String EMAIL = "student@unicode.test";
    private static final Instant COMPLETED_AT = Instant.parse("2026-04-11T10:15:30Z");

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private UserLessonProgressRepository lessonProgressRepository;

    @MockBean
    private LessonProgressService lessonProgressService;

    @MockBean
    private AiService aiService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private AuthRateLimitFilter authRateLimitFilter;

    @Test
    void myLessonProgressReturnsMappedResponses() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setEmail(EMAIL);

        UserLessonProgress progress = createProgress(UserLessonProgress.Status.COMPLETED, COMPLETED_AT);

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(lessonProgressRepository.findByUserIdWithLessonAndCourse(1L)).thenReturn(List.of(progress));

        mockMvc.perform(get("/api/progress/lessons/me")
                        .principal(authentication()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].lessonId").value(10))
                .andExpect(jsonPath("$[0].courseId").value(100))
                .andExpect(jsonPath("$[0].lessonTitle").value("Intro lesson"))
                .andExpect(jsonPath("$[0].orderIndex").value(1))
                .andExpect(jsonPath("$[0].status").value("COMPLETED"))
                .andExpect(jsonPath("$[0].completed").value(true))
                .andExpect(jsonPath("$[0].completedAt").value(COMPLETED_AT.toString()));
    }

    @Test
    void completeLessonReturnsCompletedProgressPayload() throws Exception {
        when(lessonProgressService.markLessonCompleted(10L))
                .thenReturn(createProgress(UserLessonProgress.Status.COMPLETED, COMPLETED_AT));

        mockMvc.perform(post("/api/progress/lessons/10/complete")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lessonId").value(10))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.completed").value(true))
                .andExpect(jsonPath("$.completedAt").value(COMPLETED_AT.toString()));

        verify(lessonProgressService).markLessonCompleted(10L);
    }

    @Test
    void toggleLessonReturnsUpdatedProgressPayload() throws Exception {
        when(lessonProgressService.toggleLessonCompletion(10L))
                .thenReturn(createProgress(UserLessonProgress.Status.IN_PROGRESS, null));

        mockMvc.perform(post("/api/progress/lessons/10/toggle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lessonId").value(10))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.completed").value(false))
                .andExpect(jsonPath("$.completedAt").isEmpty());
    }

    @Test
    void completeLessonReturnsBadRequestWhenBusinessRuleFails() throws Exception {
        when(lessonProgressService.markLessonCompleted(10L))
                .thenThrow(new IllegalStateException("Vous devez d'abord terminer la lecon precedente"));

        mockMvc.perform(post("/api/progress/lessons/10/complete"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("bad_request"))
                .andExpect(jsonPath("$.message").value("Vous devez d'abord terminer la lecon precedente"));
    }

    @Test
    void uncompleteLessonReturnsConfirmationMessage() throws Exception {
        mockMvc.perform(delete("/api/progress/lesson/10/complete"))
                .andExpect(status().isOk())
                .andExpect(content().string("Lecon marquee comme non terminee"));

        verify(lessonProgressService).markLessonIncomplete(10L);
    }

    private Authentication authentication() {
        return new UsernamePasswordAuthenticationToken(EMAIL, "ignored");
    }

    private UserLessonProgress createProgress(UserLessonProgress.Status status, Instant completedAt) {
        Course course = new Course();
        course.setId(100L);

        Lesson lesson = new Lesson();
        lesson.setId(10L);
        lesson.setTitle("Intro lesson");
        lesson.setOrderIndex(1);
        lesson.setCourse(course);

        UserLessonProgress progress = new UserLessonProgress();
        progress.setLesson(lesson);
        progress.setStatus(status);
        progress.setCompletedAt(completedAt);
        return progress;
    }
}
