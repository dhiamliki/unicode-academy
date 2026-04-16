package com.unicodeacademy.backend.service;

import com.unicodeacademy.backend.dto.LoginRequest;
import com.unicodeacademy.backend.dto.LoginResponse;
import com.unicodeacademy.backend.dto.RegisterRequest;
import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.repository.UserRepository;
import com.unicodeacademy.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtService, "");
    }

    @Test
    void registerWithNewEmailSavesUserAndReturnsTokens() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("  Alice  ");
        request.setEmail("  alice@unicode.test  ");
        request.setPassword("Password1");

        when(userRepository.existsByEmail("alice@unicode.test")).thenReturn(false);
        when(passwordEncoder.encode("Password1")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        when(jwtService.generateAccessToken("alice@unicode.test")).thenReturn("access-token");
        when(jwtService.generateRefreshToken("alice@unicode.test")).thenReturn("refresh-token");

        LoginResponse response = authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertNotNull(response);
        assertEquals("access-token", response.getToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals("Alice", savedUser.getUsername());
        assertEquals("alice@unicode.test", savedUser.getEmail());
        assertEquals("encoded-password", savedUser.getPassword());
        assertEquals(User.Role.USER, savedUser.getRole());
    }

    @Test
    void registerWithExistingEmailThrowsConflict() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("taken@unicode.test");
        request.setPassword("Password1");

        when(userRepository.existsByEmail("taken@unicode.test")).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.register(request));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertTrue(exception.getReason().contains("deja utilise"));
        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(passwordEncoder, jwtService);
    }

    @Test
    void loginWithCorrectCredentialsReturnsLoginResponseWithToken() {
        LoginRequest request = new LoginRequest();
        request.setEmail("  alice@unicode.test  ");
        request.setPassword("Password1");

        User user = new User();
        user.setId(1L);
        user.setEmail("alice@unicode.test");
        user.setPassword("encoded-password");

        when(userRepository.findByEmail("alice@unicode.test")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password1", "encoded-password")).thenReturn(true);
        when(jwtService.generateAccessToken("alice@unicode.test")).thenReturn("access-token");
        when(jwtService.generateRefreshToken("alice@unicode.test")).thenReturn("refresh-token");

        LoginResponse response = authService.login(request);

        assertEquals("access-token", response.getToken());
        assertEquals("refresh-token", response.getRefreshToken());
        verify(passwordEncoder).matches("Password1", "encoded-password");
    }

    @Test
    void loginWithWrongEmailThrowsUnauthorized() {
        LoginRequest request = new LoginRequest();
        request.setEmail("missing@unicode.test");
        request.setPassword("Password1");

        when(userRepository.findByEmail("missing@unicode.test")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.login(request));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        verify(passwordEncoder, never()).matches(any(), any());
        verifyNoInteractions(jwtService);
    }

    @Test
    void loginWithWrongPasswordThrowsUnauthorized() {
        LoginRequest request = new LoginRequest();
        request.setEmail("alice@unicode.test");
        request.setPassword("WrongPassword1");

        User user = new User();
        user.setEmail("alice@unicode.test");
        user.setPassword("encoded-password");

        when(userRepository.findByEmail("alice@unicode.test")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword1", "encoded-password")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.login(request));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        verifyNoInteractions(jwtService);
    }
}
