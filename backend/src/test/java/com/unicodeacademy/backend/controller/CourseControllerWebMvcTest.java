package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.model.Course;
import com.unicodeacademy.backend.model.Lesson;
import com.unicodeacademy.backend.model.ProgrammingLanguage;
import com.unicodeacademy.backend.repository.CourseRepository;
import com.unicodeacademy.backend.repository.LessonRepository;
import com.unicodeacademy.backend.security.AuthRateLimitFilter;
import com.unicodeacademy.backend.security.JwtAuthFilter;
import com.unicodeacademy.backend.service.AiService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CourseController.class)
@AutoConfigureMockMvc(addFilters = false)
class CourseControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CourseRepository courseRepository;

    @MockBean
    private LessonRepository lessonRepository;

    @MockBean
    private AiService aiService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private AuthRateLimitFilter authRateLimitFilter;

    @Test
    void allCoursesFiltersByLanguageWhenQueryParamIsPresent() throws Exception {
        Course course = createCourse(1L, "JAVA-101", "Programmation Java", "java");
        when(courseRepository.findByLanguage_CodeIgnoreCase("java")).thenReturn(List.of(course));

        mockMvc.perform(get("/api/courses").param("language", "java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].code").value("JAVA-101"))
                .andExpect(jsonPath("$[0].title").value("Programmation Java"))
                .andExpect(jsonPath("$[0].language.code").value("java"))
                .andExpect(jsonPath("$[0].lessons").isArray());

        verify(courseRepository).findByLanguage_CodeIgnoreCase("java");
        verify(courseRepository, never()).findAll();
    }

    @Test
    void lessonsByCourseUsesFallbackPracticeLanguageAndSafeStarterCode() throws Exception {
        Course course = createCourse(1L, "JAVA-101", "Programmation Java", "java");
        Lesson lesson = new Lesson();
        lesson.setId(10L);
        lesson.setTitle("Introduction");
        lesson.setContent("Basics");
        lesson.setOrderIndex(1);
        lesson.setStarterCode("12345");
        lesson.setEditorLanguage("code");
        lesson.setCourse(course);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(lessonRepository.findByCourseIdOrderByOrderIndexAsc(1L)).thenReturn(List.of(lesson));

        mockMvc.perform(get("/api/courses/1/lessons"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].title").value("Introduction"))
                .andExpect(jsonPath("$[0].starterCode").value(""))
                .andExpect(jsonPath("$[0].practiceLanguage").value("java"))
                .andExpect(jsonPath("$[0].orderIndex").value(1));
    }

    @Test
    void courseByIdReturnsNotFoundWhenCourseDoesNotExist() throws Exception {
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/courses/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("request_failed"))
                .andExpect(jsonPath("$.message").value("Cours introuvable"));
    }

    private Course createCourse(Long id, String code, String title, String languageCode) {
        ProgrammingLanguage language = new ProgrammingLanguage();
        language.setCode(languageCode);
        language.setName("Java");

        Course course = new Course();
        course.setId(id);
        course.setCode(code);
        course.setTitle(title);
        course.setLanguage(language);
        return course;
    }
}
