package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.AiHintResponse;
import com.unicodeacademy.backend.service.AiService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private final AiService aiService;

    public GlobalExceptionHandler(AiService aiService) {
        this.aiService = aiService;
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<?> badRequest(RuntimeException ex, HttpServletRequest request) {
        if (isAiHintRequest(request)) {
            log.warn("AI hint request rejected, returning local fallback", ex);
            return ResponseEntity.ok(aiFallbackResponse(request));
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", "bad_request",
                        "message", ex.getMessage()
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> validation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        if (isAiHintRequest(request)) {
            log.warn("AI hint request validation failed, returning local fallback", ex);
            return ResponseEntity.ok(aiFallbackResponse(request));
        }

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .findFirst()
                .orElse("Validation echouee");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", "validation_error",
                        "message", message
                ));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> malformedBody(HttpMessageNotReadableException ex, HttpServletRequest request) {
        if (isAiHintRequest(request)) {
            log.warn("AI hint request body could not be parsed, returning local fallback", ex);
            return ResponseEntity.ok(aiFallbackResponse(request));
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", "bad_request",
                        "message", "Le contenu de la requete est invalide"
                ));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> responseStatus(ResponseStatusException ex, HttpServletRequest request) {
        if (isAiHintRequest(request)) {
            log.warn("AI hint request returned a response status error, returning local fallback", ex);
            return ResponseEntity.ok(aiFallbackResponse(request));
        }

        String reason = ex.getReason() != null ? ex.getReason() : "La requete a echoue";
        return ResponseEntity.status(ex.getStatusCode())
                .body(Map.of(
                        "error", "request_failed",
                        "message", reason
                ));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> serverError(RuntimeException ex, HttpServletRequest request) {
        if (isAiHintRequest(request)) {
            log.warn("AI hint request failed unexpectedly, returning local fallback", ex);
            return ResponseEntity.ok(aiFallbackResponse(request));
        }

        log.error("Erreur inattendue", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error", "server_error",
                        "message", "Une erreur interne s'est produite."
                ));
    }

    private boolean isAiHintRequest(HttpServletRequest request) {
        return request != null && request.getRequestURI() != null && request.getRequestURI().startsWith("/api/ai/hint/");
    }

    private AiHintResponse aiFallbackResponse(HttpServletRequest request) {
        if (request != null && request.getRequestURI() != null && request.getRequestURI().endsWith("/pratique")) {
            return aiService.buildPratiqueFallbackResponse(null);
        }

        return aiService.buildExerciseFallbackResponse(null);
    }
}
