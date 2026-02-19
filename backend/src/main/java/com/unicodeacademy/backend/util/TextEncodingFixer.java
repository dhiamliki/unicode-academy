package com.unicodeacademy.backend.util;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public final class TextEncodingFixer {

    private static final Charset WINDOWS_1252 = Charset.forName("windows-1252");

    private TextEncodingFixer() {
    }

    public static String fix(String value) {
        if (value == null || value.isEmpty()) {
            return value;
        }

        String current = value;
        for (int i = 0; i < 3; i++) {
            int currentScore = mojibakeScore(current);
            if (currentScore == 0) {
                break;
            }

            String candidate = recodeWindows1252ToUtf8(current);
            int candidateScore = mojibakeScore(candidate);
            if (candidateScore >= currentScore) {
                break;
            }

            current = candidate;
        }

        return current;
    }

    public static List<String> fixList(List<String> values) {
        if (values == null) {
            return List.of();
        }
        return values.stream()
                .filter(Objects::nonNull)
                .map(TextEncodingFixer::fix)
                .collect(Collectors.toList());
    }

    private static String recodeWindows1252ToUtf8(String input) {
        try {
            byte[] bytes = input.getBytes(WINDOWS_1252);
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (Exception ex) {
            return input;
        }
    }

    private static int mojibakeScore(String value) {
        int score = 0;
        score += count(value, "\u00C3") * 2; // Ã
        score += count(value, "\u00C2") * 2; // Â
        score += count(value, "\u00E2") * 2; // â
        score += count(value, "\uFFFD") * 5; // replacement char
        return score;
    }

    private static int count(String value, String token) {
        int count = 0;
        int fromIndex = 0;
        int idx;
        while ((idx = value.indexOf(token, fromIndex)) >= 0) {
            count++;
            fromIndex = idx + token.length();
        }
        return count;
    }
}