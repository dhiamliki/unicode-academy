package com.unicodeacademy.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "user_exercise_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserExerciseAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "submitted_answer", nullable = false, length = 4000)
    private String submittedAnswer;

    @Column(name = "is_correct", nullable = false)
    private boolean correct;

    @Column(name = "attempted_at", nullable = false)
    private Instant attemptedAt = Instant.now();
}
