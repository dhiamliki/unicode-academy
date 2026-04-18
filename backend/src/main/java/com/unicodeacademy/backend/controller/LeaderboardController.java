package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.LeaderboardEntryResponse;
import com.unicodeacademy.backend.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
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

    private final LeaderboardService leaderboardService;

    @GetMapping
    public List<LeaderboardEntryResponse> leaderboard(@RequestParam(defaultValue = "20") int limit) {
        return leaderboardService.getLeaderboard(limit);
    }
}
