package com.unicodeacademy.backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.unicodeacademy.backend.dto.GoogleAuthRequest;
import com.unicodeacademy.backend.dto.LoginRequest;
import com.unicodeacademy.backend.dto.LoginResponse;
import com.unicodeacademy.backend.dto.RefreshTokenRequest;
import com.unicodeacademy.backend.dto.RegisterRequest;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.repository.UserRepository;
import com.unicodeacademy.backend.security.JwtService;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final String googleClientId;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       @Value("${app.google.client-id:}") String googleClientId) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleClientId = googleClientId != null ? googleClientId.trim() : "";
        GoogleIdTokenVerifier.Builder verifierBuilder = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        );
        if (!this.googleClientId.isBlank()) {
            verifierBuilder.setAudience(Collections.singletonList(this.googleClientId));
        }
        this.googleIdTokenVerifier = verifierBuilder.build();
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail() == null ? "" : request.getEmail().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet e-mail est deja utilise");
        }

        User user = new User();
        user.setUsername(request.getUsername() == null ? null : request.getUsername().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);

        User savedUser = userRepository.save(user);
        return issueTokens(savedUser);
    }

    public LoginResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail() == null ? "" : request.getEmail().trim();
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou mot de passe invalide");
        }

        return issueTokens(user);
    }

    @Transactional
    public LoginResponse googleLogin(GoogleAuthRequest request) {
        GoogleIdToken.Payload payload = verifyGoogleToken(request.getIdToken());

        String email = payload.getEmail();
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "L'e-mail du compte Google est manquant");
        }
        if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "L'e-mail du compte Google n'est pas verifie");
        }

        String normalizedEmail = email.trim();
        String displayName = extractDisplayName(payload, normalizedEmail);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> createGoogleUser(normalizedEmail, displayName));

        if (user.getUsername() == null || user.getUsername().isBlank()) {
            user.setUsername(displayName);
            user = userRepository.save(user);
        }

        return issueTokens(user);
    }

    public LoginResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        String email;
        try {
            email = jwtService.extractEmail(refreshToken);
        } catch (JwtException | IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token invalide");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        if (!jwtService.isRefreshTokenValid(refreshToken, user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token invalide");
        }

        return issueTokens(user);
    }

    private LoginResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());
        return new LoginResponse(accessToken, refreshToken);
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idToken) {
        if (googleClientId.isBlank()) {
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

        return parsedToken.getPayload();
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
}
