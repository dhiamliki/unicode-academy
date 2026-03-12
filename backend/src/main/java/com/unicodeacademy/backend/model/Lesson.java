package com.unicodeacademy.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 4000)
    private String content;

    @Column(columnDefinition = "TEXT")
    private String starterCode;

    @Column(length = 50)
    private String editorLanguage;

    @Column(length = 40)
    private String executionType;

    @Column(columnDefinition = "TEXT")
    private String sampleOutput;

    @Column(nullable = false)
    private Integer orderIndex;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<Exercise> exercises = new ArrayList<>();
}
