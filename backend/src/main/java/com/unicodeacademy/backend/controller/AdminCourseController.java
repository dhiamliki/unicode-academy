package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.AdminCourseRequest;
import com.unicodeacademy.backend.dto.AdminCourseResponse;
import com.unicodeacademy.backend.service.AdminContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/courses")
@RequiredArgsConstructor
public class AdminCourseController {

    private final AdminContentService adminContentService;

    @GetMapping
    public List<AdminCourseResponse> listCourses() {
        return adminContentService.listCourses();
    }

    @PostMapping
    public AdminCourseResponse createCourse(@Valid @RequestBody AdminCourseRequest request) {
        return adminContentService.createCourse(request);
    }

    @PutMapping("/{id}")
    public AdminCourseResponse updateCourse(@PathVariable Long id,
                                            @Valid @RequestBody AdminCourseRequest request) {
        return adminContentService.updateCourse(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable Long id) {
        adminContentService.deleteCourse(id);
    }
}
