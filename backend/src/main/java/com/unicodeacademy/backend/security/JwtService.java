package com.unicodeacademy.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final int MIN_SECRET_LENGTH = 32;
    private static final String TOKEN_TYPE_CLAIM = "token_type";
    private static final String TOKEN_TYPE_ACCESS = "access";
    private static final String TOKEN_TYPE_REFRESH = "refresh";

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.issuer:unicode-academy}")
    private String issuer;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    @PostConstruct
    public void validateConfiguration() {
        if (secret == null || secret.length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException(
                    "JWT secret invalide: fournissez au moins 32 caracteres pour app.jwt.secret"
            );
        }
        if (issuer == null || issuer.isBlank()) {
            throw new IllegalStateException("JWT issuer invalide: app.jwt.issuer ne doit pas etre vide");
        }
    }

    public String generateToken(String email) {
        return generateAccessToken(email);
    }

    public String generateAccessToken(String email) {
        return generateToken(email, expirationMs, TOKEN_TYPE_ACCESS);
    }

    public String generateRefreshToken(String email) {
        return generateToken(email, refreshExpirationMs, TOKEN_TYPE_REFRESH);
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        return isTokenOfTypeValid(token, userDetails.getUsername(), TOKEN_TYPE_ACCESS);
    }

    public boolean isRefreshTokenValid(String token, String expectedEmail) {
        return isTokenOfTypeValid(token, expectedEmail, TOKEN_TYPE_REFRESH);
    }

    private String generateToken(String email, long ttlMs, String tokenType) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + ttlMs);

        return Jwts.builder()
                .issuer(issuer)
                .subject(email)
                .issuedAt(now)
                .expiration(exp)
                .claim(TOKEN_TYPE_CLAIM, tokenType)
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    private boolean isTokenOfTypeValid(String token, String expectedEmail, String requiredType) {
        Claims claims = extractAllClaims(token);
        String email = claims.getSubject();
        String tokenType = claims.get(TOKEN_TYPE_CLAIM, String.class);
        return expectedEmail.equals(email)
                && requiredType.equals(tokenType)
                && !claims.getExpiration().before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
