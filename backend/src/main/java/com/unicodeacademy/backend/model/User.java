package com.unicodeacademy.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    public enum Role {
        USER,
        ADMIN
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    @Column(unique = true)
    private String email;

    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Role role = Role.USER;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @ManyToOne
    @JoinColumn(name = "preferred_language_id")
    private ProgrammingLanguage preferredLanguage;

    @PrePersist
    public void applyDefaults() {
        if (role == null) {
            role = Role.USER;
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
