package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.AdminExerciseRequest;
import com.unicodeacademy.backend.dto.AdminExerciseResponse;
import com.unicodeacademy.backend.service.AdminContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AdminExerciseController {

    private final AdminContentService adminContentService;

    @GetMapping("/api/admin/lessons/{lessonId}/exercises")
    public List<AdminExerciseResponse> listExercises(@PathVariable Long lessonId) {
        return adminContentService.listExercises(lessonId);
    }

    @PostMapping("/api/admin/lessons/{lessonId}/exercises")
    public AdminExerciseResponse createExercise(@PathVariable Long lessonId,
                                                @Valid @RequestBody AdminExerciseRequest request) {
        return adminContentService.createExercise(lessonId, request);
    }

    @PutMapping("/api/admin/exercises/{exerciseId}")
    public AdminExerciseResponse updateExercise(@PathVariable Long exerciseId,
                                                @Valid @RequestBody AdminExerciseRequest request) {
        return adminContentService.updateExercise(exerciseId, request);
    }

    @DeleteMapping("/api/admin/exercises/{exerciseId}")
    public void deleteExercise(@PathVariable Long exerciseId) {
        adminContentService.deleteExercise(exerciseId);
    }

    @GetMapping("/api/admin/lessons/{lessonId}/exercises/next-order")
    public int nextExerciseOrder(@PathVariable Long lessonId) {
        return adminContentService.getNextExerciseOrderIndex(lessonId);
    }
}
