package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.StatsResponse;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.model.UserCourseProgress;
import com.unicodeacademy.backend.repository.UserCourseProgressRepository;
import com.unicodeacademy.backend.repository.UserExerciseAttemptRepository;
import com.unicodeacademy.backend.repository.UserLessonProgressRepository;
import com.unicodeacademy.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final UserRepository userRepository;
    private final UserCourseProgressRepository courseProgressRepository;
    private final UserLessonProgressRepository lessonProgressRepository;
    private final UserExerciseAttemptRepository attemptRepository;

    public StatsController(UserRepository userRepository,
                           UserCourseProgressRepository courseProgressRepository,
                           UserLessonProgressRepository lessonProgressRepository,
                           UserExerciseAttemptRepository attemptRepository) {
        this.userRepository = userRepository;
        this.courseProgressRepository = courseProgressRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.attemptRepository = attemptRepository;
    }

    @GetMapping("/me")
    public StatsResponse myStats(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();

        long coursesCompleted = courseProgressRepository.findByUserId(user.getId())
                .stream()
                .filter(p -> p.getStatus() == UserCourseProgress.Status.COMPLETED)
                .count();

        long lessonsCompleted = lessonProgressRepository.findByUserId(user.getId())
                .stream()
                .filter(p -> p.getStatus() == com.unicodeacademy.backend.model.UserLessonProgress.Status.COMPLETED)
                .count();

        var attempts = attemptRepository.findByUserId(user.getId());
        long exercisesAttempted = attempts.size();
        long exercisesCorrect = attempts.stream().filter(a -> a.isCorrect()).count();

        double accuracy = exercisesAttempted == 0 ? 0.0 : (double) exercisesCorrect / exercisesAttempted;

        return new StatsResponse(coursesCompleted, lessonsCompleted, exercisesAttempted, exercisesCorrect, accuracy);
    }
}
