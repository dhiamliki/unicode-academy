package com.unicodeacademy.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "programming_languages")
public class ProgrammingLanguage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Example: "C", "JAVA", "PYTHON"
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    // Example: "C", "Java", "Python"
    @Column(nullable = false, length = 60)
    private String name;

    public ProgrammingLanguage() {
    }

    public ProgrammingLanguage(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
