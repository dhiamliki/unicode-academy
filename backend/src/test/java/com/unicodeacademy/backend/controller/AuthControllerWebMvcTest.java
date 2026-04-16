package com.unicodeacademy.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unicodeacademy.backend.dto.LoginResponse;
import com.unicodeacademy.backend.dto.RegisterRequest;
import com.unicodeacademy.backend.security.AuthRateLimitFilter;
import com.unicodeacademy.backend.security.JwtAuthFilter;
import com.unicodeacademy.backend.service.AiService;
import com.unicodeacademy.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private AiService aiService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private AuthRateLimitFilter authRateLimitFilter;

    @Test
    void registerReturnsCreatedAndDelegatesToService() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("Alice");
        request.setEmail("alice@unicode.test");
        request.setPassword("Password1");

        when(authService.register(any(RegisterRequest.class)))
                .thenReturn(new LoginResponse("access-token", "refresh-token"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"));

        ArgumentCaptor<RegisterRequest> captor = ArgumentCaptor.forClass(RegisterRequest.class);
        verify(authService).register(captor.capture());
        assertEquals("Alice", captor.getValue().getUsername());
        assertEquals("alice@unicode.test", captor.getValue().getEmail());
        assertEquals("Password1", captor.getValue().getPassword());
    }

    @Test
    void loginReturnsOkAndTokenPayload() throws Exception {
        when(authService.login(any()))
                .thenReturn(new LoginResponse("access-token", "refresh-token"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "alice@unicode.test",
                                  "password": "Password1"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"));
    }

    @Test
    void loginReturnsBadRequestWhenValidationFails() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "password": "Password1"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("validation_error"))
                .andExpect(jsonPath("$.message").value("L'email est obligatoire"));

        verifyNoInteractions(authService);
    }

    @Test
    void refreshReturnsUnauthorizedWhenServiceRejectsToken() throws Exception {
        when(authService.refresh(any()))
                .thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token invalide"));

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "refreshToken": "expired-refresh-token"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("request_failed"))
                .andExpect(jsonPath("$.message").value("Refresh token invalide"));
    }
}
