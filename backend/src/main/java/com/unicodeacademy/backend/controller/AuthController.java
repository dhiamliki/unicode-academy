package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.GoogleAuthRequest;
import com.unicodeacademy.backend.dto.LoginRequest;
import com.unicodeacademy.backend.dto.LoginResponse;
import com.unicodeacademy.backend.dto.RefreshTokenRequest;
import com.unicodeacademy.backend.dto.RegisterRequest;
import com.unicodeacademy.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/google")
    public LoginResponse googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
        return authService.googleLogin(request);
    }

    @PostMapping("/refresh")
    public LoginResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request);
    }
}
