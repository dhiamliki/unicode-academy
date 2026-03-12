package com.unicodeacademy.backend.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.unicodeacademy.backend.dto.GoogleAuthRequest;
import com.unicodeacademy.backend.dto.LoginRequest;
import com.unicodeacademy.backend.dto.LoginResponse;
import com.unicodeacademy.backend.dto.RegisterRequest;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.repository.UserRepository;
import com.unicodeacademy.backend.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final String googleClientId;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService,
                          @Value("${app.google.client-id:}") String googleClientId) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleClientId = googleClientId;
        this.googleIdTokenVerifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        ).build();
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Cet e-mail est deja utilise"));
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);

        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Compte cree avec succes"));
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou mot de passe invalide");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou mot de passe invalide");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token);
    }

    @PostMapping("/google")
    public LoginResponse googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
        GoogleIdToken.Payload payload = verifyGoogleToken(request.getIdToken());

        String email = payload.getEmail();
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "L'e-mail du compte Google est manquant");
        }
        if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "L'e-mail du compte Google n'est pas verifie");
        }

        String displayName = extractDisplayName(payload, email);
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createGoogleUser(email, displayName));

        if (user.getUsername() == null || user.getUsername().isBlank()) {
            user.setUsername(displayName);
            userRepository.save(user);
        }

        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token);
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idToken) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "La connexion Google n'est pas configuree");
        }

        GoogleIdToken parsedToken;
        try {
            parsedToken = googleIdTokenVerifier.verify(idToken);
        } catch (GeneralSecurityException | IOException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Jeton Google invalide");
        }

        if (parsedToken == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Jeton Google invalide");
        }

        GoogleIdToken.Payload payload = parsedToken.getPayload();
        Object audience = payload.getAudience();
        if (!audienceMatches(audience)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Audience du jeton Google invalide");
        }
        return payload;
    }

    private User createGoogleUser(String email, String displayName) {
        User user = new User();
        user.setEmail(email);
        user.setUsername(displayName);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setRole(User.Role.USER);
        return userRepository.save(user);
    }

    private String extractDisplayName(GoogleIdToken.Payload payload, String email) {
        Object nameClaim = payload.get("name");
        if (nameClaim instanceof String name && !name.isBlank()) {
            return name;
        }
        int atIndex = email.indexOf('@');
        if (atIndex > 0) {
            return email.substring(0, atIndex);
        }
        return email;
    }

    private boolean audienceMatches(Object audienceClaim) {
        if (audienceClaim instanceof String singleAudience) {
            return googleClientId.equals(singleAudience);
        }

        if (audienceClaim instanceof Collection<?> audiences) {
            return audiences.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .anyMatch(googleClientId::equals);
        }

        return false;
    }
}
