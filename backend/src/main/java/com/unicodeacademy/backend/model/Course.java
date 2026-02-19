package com.unicodeacademy.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // e.g. "C", "CPP", "CSharp", "JS", "HTMLCSS"

    @Column(nullable = false)
    private String title; // e.g. "C Programming"

    @Column(length = 1000)
    private String description;

    @ManyToOne(optional = false)
    @JoinColumn(name = "language_id", nullable = false)
    private ProgrammingLanguage language;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<Lesson> lessons = new ArrayList<>();

    public ProgrammingLanguage getLanguage() {
        return language;
    }

    public void setLanguage(ProgrammingLanguage language) {
        this.language = language;
    }
}
