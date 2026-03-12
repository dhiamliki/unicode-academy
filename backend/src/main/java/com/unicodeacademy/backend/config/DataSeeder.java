package com.unicodeacademy.backend.config;

import com.unicodeacademy.backend.model.Course;
import com.unicodeacademy.backend.model.Exercise;
import com.unicodeacademy.backend.model.Lesson;
import com.unicodeacademy.backend.model.ProgrammingLanguage;
import com.unicodeacademy.backend.repository.CourseRepository;
import com.unicodeacademy.backend.repository.ProgrammingLanguageRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seed(CourseRepository courseRepository,
                           ProgrammingLanguageRepository languageRepository) {
        return args -> {
            if (courseRepository.count() > 0) return;

            ProgrammingLanguage langC = languageRepository.findByCode("C")
                    .orElseGet(() -> languageRepository.save(new ProgrammingLanguage("C", "C")));
            ProgrammingLanguage langJava = languageRepository.findByCode("JAVA")
                    .orElseGet(() -> languageRepository.save(new ProgrammingLanguage("JAVA", "Java")));

            Course c = new Course();
            c.setCode("C-101");
            c.setTitle("Programmation C");
            c.setDescription("Bases du C : variables, conditions, boucles.");
            c.setLanguage(langC);

            Lesson l1 = new Lesson();
            l1.setTitle("Variables et types");
            l1.setOrderIndex(1);
            l1.setContent("En C, int sert aux entiers, char sert aux caracteres...");

            Exercise e1 = new Exercise();
            e1.setType(Exercise.ExerciseType.MCQ);
            e1.setOrderIndex(1);
            e1.setQuestion("Quel type est utilise pour les entiers en C ?");
            e1.setChoicesJson("[\"char\",\"int\",\"float\",\"double\"]");
            e1.setAnswer("int");
            e1.setExplanation("int est le type entier standard.");

            e1.setLesson(l1);
            l1.getExercises().add(e1);

            l1.setCourse(c);
            c.getLessons().add(l1);

            courseRepository.save(c);

            Course javaCourse = new Course();
            javaCourse.setCode("JAVA-101");
            javaCourse.setTitle("Programmation Java");
            javaCourse.setDescription("Bases de Java : classes, methodes, objets.");
            javaCourse.setLanguage(langJava);

            courseRepository.save(javaCourse);
        };
    }
}
