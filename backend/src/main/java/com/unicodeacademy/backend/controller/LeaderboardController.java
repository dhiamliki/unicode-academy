package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.LeaderboardEntryResponse;
import com.unicodeacademy.backend.repository.UserRepository;
import com.unicodeacademy.backend.util.TextEncodingFixer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final UserRepository userRepository;

    @GetMapping
    public List<LeaderboardEntryResponse> leaderboard(@RequestParam(defaultValue = "20") int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        List<UserRepository.LeaderboardProjection> rows = userRepository.findLeaderboard(PageRequest.of(0, safeLimit));

        List<LeaderboardEntryResponse> response = new ArrayList<>();
        for (int i = 0; i < rows.size(); i++) {
            UserRepository.LeaderboardProjection row = rows.get(i);
            String username = row.getUsername() != null && !row.getUsername().isBlank()
                    ? row.getUsername()
                    : "User-" + row.getUserId();
            response.add(new LeaderboardEntryResponse(
                    i + 1,
                    TextEncodingFixer.fix(username),
                    row.getPoints() != null ? row.getPoints() : 0L,
                    row.getCompletedLessons() != null ? row.getCompletedLessons() : 0L,
                    row.getCorrectExercises() != null ? row.getCorrectExercises() : 0L
            ));
        }

        return response;
    }
}
