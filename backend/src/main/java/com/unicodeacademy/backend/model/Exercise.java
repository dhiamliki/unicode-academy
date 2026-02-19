package com.unicodeacademy.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "exercises",
        uniqueConstraints = @UniqueConstraint(name = "uk_exercises_lesson_question", columnNames = {"lesson_id", "question"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Exercise {

    public enum ExerciseType { MCQ, CODE, TRUE_FALSE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExerciseType type;

    @Column(nullable = false, length = 2000)
    private String question;

    @Column(length = 4000)
    private String choicesJson;

    @Column(nullable = false)
    private String answer;

    @Column(length = 4000)
    private String explanation;

    @Column(nullable = false)
    private Integer orderIndex;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;
}
