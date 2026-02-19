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
            c.setTitle("C Programming");
            c.setDescription("Basics of C: variables, conditions, loops.");
            c.setLanguage(langC);

            Lesson l1 = new Lesson();
            l1.setTitle("Variables & Types");
            l1.setOrderIndex(1);
            l1.setContent("In C, int is for integers, char is for characters...");

            Exercise e1 = new Exercise();
            e1.setType(Exercise.ExerciseType.MCQ);
            e1.setOrderIndex(1);
            e1.setQuestion("Which type is used for integers in C?");
            e1.setChoicesJson("[\"char\",\"int\",\"float\",\"double\"]");
            e1.setAnswer("int");
            e1.setExplanation("int is the standard integer type.");

            e1.setLesson(l1);
            l1.getExercises().add(e1);

            l1.setCourse(c);
            c.getLessons().add(l1);

            courseRepository.save(c);

            Course javaCourse = new Course();
            javaCourse.setCode("JAVA-101");
            javaCourse.setTitle("Java Programming");
            javaCourse.setDescription("Basics of Java: classes, methods, objects.");
            javaCourse.setLanguage(langJava);

            courseRepository.save(javaCourse);
        };
    }
}
