package com.unicodeacademy.backend.config;

import com.unicodeacademy.backend.model.User;
import com.unicodeacademy.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;

@Configuration
public class AdminSeederConfig {

    private static final Logger log = LoggerFactory.getLogger(AdminSeederConfig.class);

    @Bean
    CommandLineRunner adminSeeder(UserRepository userRepository,
                                  PasswordEncoder passwordEncoder,
                                  @Value("${ADMIN_EMAIL:}") String adminEmail,
                                  @Value("${ADMIN_PASSWORD:}") String adminPassword) {
        return args -> {
            if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
                return;
            }

            if (userRepository.existsByRole(User.Role.ADMIN)) {
                return;
            }

            String normalizedEmail = adminEmail.trim().toLowerCase(Locale.ROOT);
            User user = userRepository.findByEmail(normalizedEmail).orElseGet(User::new);

            user.setEmail(normalizedEmail);
            if (user.getUsername() == null || user.getUsername().isBlank()) {
                int at = normalizedEmail.indexOf("@");
                user.setUsername(at > 0 ? normalizedEmail.substring(0, at) : "admin");
            }
            user.setPassword(passwordEncoder.encode(adminPassword));
            user.setRole(User.Role.ADMIN);

            userRepository.save(user);
            log.info("Admin seeded: {}", normalizedEmail);
        };
    }
}
