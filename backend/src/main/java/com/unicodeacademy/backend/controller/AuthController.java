package com.unicodeacademy.backend.controller;

import com.unicodeacademy.backend.dto.GoogleAuthRequest;
import com.unicodeacademy.backend.dto.RegisterRequest;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.unicodeacademy.backend.dto.LoginRequest;
import com.unicodeacademy.backend.dto.LoginResponse;
import com.unicodeacademy.backend.security.JwtService;

import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already exists!";
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);

        userRepository.save(user);
        return "User registered successfully!";
    }
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token);
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleAuthRequest request) {

        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());

        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
        } else {
            user = new User();
            user.setEmail(request.getEmail());
            user.setUsername(request.getName());
            user.setPassword("");
            user.setRole(User.Role.USER);
            userRepository.save(user);
        }

        String token = jwtService.generateToken(user.getEmail());

        return ResponseEntity.ok(Map.of("token", token));
    }



}
