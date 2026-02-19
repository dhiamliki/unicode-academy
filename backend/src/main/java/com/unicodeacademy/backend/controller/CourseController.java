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
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

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
                .orElseThrow();
    }

    @GetMapping("/{id}/lessons")
    public List<LessonResponse> lessonsByCourse(@PathVariable Long id) {
        return lessonRepository.findByCourseIdOrderByOrderIndexAsc(id)
                .stream()
                .map(this::toLessonResponse)
                .collect(Collectors.toList());
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

        List<LessonResponse> lessons = Collections.emptyList();
        if (course.getLessons() != null) {
            lessons = course.getLessons()
                    .stream()
                    .map(this::toLessonResponse)
                    .collect(Collectors.toList());
        }

        return new CourseResponse(
                course.getId(),
                course.getCode(),
                TextEncodingFixer.fix(course.getTitle()),
                TextEncodingFixer.fix(course.getDescription()),
                languageResponse,
                lessons
        );
    }

    private LessonResponse toLessonResponse(Lesson lesson) {
        return new LessonResponse(
                lesson.getId(),
                TextEncodingFixer.fix(lesson.getTitle()),
                TextEncodingFixer.fix(lesson.getContent()),
                lesson.getOrderIndex()
        );
    }
}
