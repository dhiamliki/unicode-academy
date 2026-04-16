package com.unicodeacademy.backend.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private static final String SECRET = "test-secret-key-minimum-32-characters-long";
    private static final long EXPIRATION_MS = 3_600_000L;
    private static final String ISSUER = "unicode-academy";
    private static final String EMAIL = "student@unicode.test";

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", SECRET);
        ReflectionTestUtils.setField(jwtService, "issuer", ISSUER);
        ReflectionTestUtils.setField(jwtService, "expirationMs", EXPIRATION_MS);
        ReflectionTestUtils.setField(jwtService, "refreshExpirationMs", EXPIRATION_MS * 2);
        jwtService.validateConfiguration();
    }

    @Test
    void generateTokenReturnsNonNullNonEmptyString() {
        String token = jwtService.generateToken(EMAIL);

        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void extractEmailReturnsEmailUsedToGenerateToken() {
        String token = jwtService.generateToken(EMAIL);

        assertEquals(EMAIL, jwtService.extractEmail(token));
    }

    @Test
    void isTokenValidReturnsTrueForMatchingUser() {
        String token = jwtService.generateToken(EMAIL);
        UserDetails userDetails = User.withUsername(EMAIL)
                .password("ignored")
                .authorities("ROLE_USER")
                .build();

        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void isTokenValidReturnsFalseForWrongEmail() {
        String token = jwtService.generateToken(EMAIL);
        UserDetails otherUser = User.withUsername("other@unicode.test")
                .password("ignored")
                .authorities("ROLE_USER")
                .build();

        assertFalse(jwtService.isTokenValid(token, otherUser));
    }

    @Test
    void generatedTokenIsNotExpired() {
        String token = jwtService.generateToken(EMAIL);

        Claims claims = ReflectionTestUtils.invokeMethod(jwtService, "extractAllClaims", token);

        assertNotNull(claims);
        assertFalse(claims.getExpiration().before(new Date()));
    }

    @Test
    void accessValidationRejectsRefreshToken() {
        String refreshToken = jwtService.generateRefreshToken(EMAIL);
        UserDetails userDetails = User.withUsername(EMAIL)
                .password("ignored")
                .authorities("ROLE_USER")
                .build();

        assertFalse(jwtService.isTokenValid(refreshToken, userDetails));
        assertTrue(jwtService.isRefreshTokenValid(refreshToken, EMAIL));
    }
}
