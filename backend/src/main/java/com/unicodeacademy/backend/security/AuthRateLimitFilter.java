package com.unicodeacademy.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_WINDOW = 5;
    private static final long WINDOW_MS = Duration.ofMinutes(1).toMillis();
    private static final String TOO_MANY_REQUESTS_BODY =
            "{\"error\":\"too_many_requests\",\"message\":\"Trop de tentatives de connexion. Reessayez plus tard.\"}";

    private final Map<String, AttemptWindow> requestWindows = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String servletPath = request.getServletPath();
        return !HttpMethod.POST.matches(request.getMethod())
                || (!"/api/auth/login".equals(servletPath) && !"/api/auth/google".equals(servletPath));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        long now = System.currentTimeMillis();
        String clientIp = resolveClientIp(request);

        AttemptWindow attemptWindow = requestWindows.compute(clientIp, (ip, currentWindow) -> {
            if (currentWindow == null || now - currentWindow.windowStartMs() >= WINDOW_MS) {
                return new AttemptWindow(1, now);
            }
            return new AttemptWindow(currentWindow.requestCount() + 1, currentWindow.windowStartMs());
        });

        cleanupExpiredWindows(now);

        if (attemptWindow != null && attemptWindow.requestCount() > MAX_REQUESTS_PER_WINDOW) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(TOO_MANY_REQUESTS_BODY);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void cleanupExpiredWindows(long now) {
        requestWindows.entrySet()
                .removeIf(entry -> now - entry.getValue().windowStartMs() >= WINDOW_MS);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record AttemptWindow(int requestCount, long windowStartMs) {
    }
}
