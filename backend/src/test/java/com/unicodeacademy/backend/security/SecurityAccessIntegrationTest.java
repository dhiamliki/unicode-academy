package com.unicodeacademy.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unicodeacademy.backend.dto.LoginResponse;
import com.unicodeacademy.backend.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityAccessIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void publicRegisterEndpointRemainsAccessibleWithoutJwt() throws Exception {
        LoginResponse response = registerUser("public");

        assertNotNull(response.getToken());
        assertFalse(response.getToken().isBlank());
        assertNotNull(response.getRefreshToken());
        assertFalse(response.getRefreshToken().isBlank());
    }

    @Test
    void protectedProgressEndpointRejectsMissingJwt() throws Exception {
        mockMvc.perform(get("/api/progress/lessons/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedProgressEndpointAcceptsValidJwt() throws Exception {
        LoginResponse response = registerUser("progress");

        mockMvc.perform(get("/api/progress/lessons/me")
                        .header("Authorization", "Bearer " + response.getToken()))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void adminEndpointForbidsRegularUserRole() throws Exception {
        LoginResponse response = registerUser("admin-block");

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + response.getToken()))
                .andExpect(status().isForbidden());
    }

    private LoginResponse registerUser(String prefix) throws Exception {
        RegisterRequest request = new RegisterRequest();
        String uniqueSuffix = prefix + "-" + UUID.randomUUID().toString().replace("-", "");
        request.setUsername("user-" + uniqueSuffix);
        request.setEmail(uniqueSuffix + "@unicode.test");
        request.setPassword("Password1");

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.refreshToken").isString())
                .andReturn();

        return objectMapper.readValue(result.getResponse().getContentAsString(), LoginResponse.class);
    }
}
