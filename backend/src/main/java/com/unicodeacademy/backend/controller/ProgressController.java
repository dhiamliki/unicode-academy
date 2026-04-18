package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.CourseProgressSummaryItem;
import com.unicodeacademy.backend.dto.ProgressSummaryResponse;
import com.unicodeacademy.backend.dto.ProgressSummaryTotals;
import com.unicodeacademy.backend.dto.ProgressResponse;
import org.springframework.security.core.Authentication;
import com.unicodeacademy.backend.service.ProgressService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping("/me")
    public List<ProgressResponse> myProgress(Authentication auth) {
        return progressService.getMyCourseProgress(auth.getName());
    }

    @GetMapping("/summary")
    public ProgressSummaryResponse mySummary(Authentication auth) {
        return progressService.getMySummary(auth.getName());
    }

    @PostMapping("/course/{courseId}/complete")
    public ProgressResponse completeCourse(@PathVariable Long courseId,
                                           Authentication auth) {
        return progressService.refreshCourseProgress(auth.getName(), courseId);
    }
}
