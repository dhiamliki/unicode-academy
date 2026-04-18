package com.unicodeacademy.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.unicodeacademy.backend.dto.AdminCourseRequest;
import com.unicodeacademy.backend.dto.AdminCourseResponse;
import com.unicodeacademy.backend.dto.AdminExerciseRequest;
import com.unicodeacademy.backend.dto.AdminExerciseResponse;
import com.unicodeacademy.backend.dto.AdminLessonRequest;
import com.unicodeacademy.backend.dto.AdminLessonResponse;
import com.unicodeacademy.backend.dto.AdminProgrammingLanguageRequest;
import com.unicodeacademy.backend.dto.AdminProgrammingLanguageResponse;
import com.unicodeacademy.backend.model.Course;
import com.unicodeacademy.backend.model.CourseAttachment;
import com.unicodeacademy.backend.model.Exercise;
import com.unicodeacademy.backend.model.Lesson;
import com.unicodeacademy.backend.model.ProgrammingLanguage;
import com.unicodeacademy.backend.model.UserCourseProgress;
import com.unicodeacademy.backend.model.UserLessonProgress;
import com.unicodeacademy.backend.repository.CourseAttachmentRepository;
import com.unicodeacademy.backend.repository.CourseRepository;
import com.unicodeacademy.backend.repository.ExerciseRepository;
import com.unicodeacademy.backend.repository.LessonRepository;
import com.unicodeacademy.backend.repository.ProgrammingLanguageRepository;
import com.unicodeacademy.backend.repository.UserCourseProgressRepository;
import com.unicodeacademy.backend.repository.UserExerciseAttemptRepository;
import com.unicodeacademy.backend.repository.UserLessonProgressRepository;
import com.unicodeacademy.backend.util.TextEncodingFixer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

 @Service
 @RequiredArgsConstructor
 @Transactional
 public class AdminContentService {

     /**
      * Service centralisant toutes les operations d'administration pedagogique.
      * Fournit le CRUD pour les langages, cours, lecons et exercices, ainsi que la gestion
      * des pieces jointes de cours. Tous les validateurs de metier (contraintes d'unicite,
      * formats, dependances) sont appliques ici avant persistance.
      *
      * <p><strong>Regles de suppression:</strong>
      * <ul>
      *   <li>Langage : interdit si des cours y sont rattaches (verification prealable).</li>
      *   <li>Cours : supprime ses pieces jointes et les donnees de progression associees.</li>
      *   <li>Lecon : supprime les tentatives d'exercices liees et recalcule la progression du cours.</li>
      *   <li>Exercice : supprime les tentatives liees.</li>
      * </ul>
      *
      * <p><strong>Auto-incrementation des ordres:</strong>
      * Des methodes utilitaires calculent le prochain index d'ordre disponible pour les lecons
      * d'un cours et les exercices d'une lecon en se basant sur le maximum existant.
      */
    private static final Pattern LANGUAGE_CODE_PATTERN = Pattern.compile("^[a-z0-9+#.-]{1,30}$");
    private static final Pattern COURSE_CODE_PATTERN = Pattern.compile("^[A-Z0-9_-]{2,40}$");

    private final ProgrammingLanguageRepository languageRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final ExerciseRepository exerciseRepository;
    private final CourseAttachmentRepository courseAttachmentRepository;
    private final UserLessonProgressRepository userLessonProgressRepository;
    private final UserCourseProgressRepository userCourseProgressRepository;
     private final UserExerciseAttemptRepository userExerciseAttemptRepository;
     private final CourseAttachmentService courseAttachmentService;
     private final ProgressService progressService;
     private final ObjectMapper objectMapper;

     @Transactional(readOnly = true)
    public List<AdminProgrammingLanguageResponse> listLanguages() {
        return languageRepository.findAll(Sort.by(Sort.Order.asc("name"), Sort.Order.asc("id")))
                .stream()
                .map(this::toLanguageResponse)
                .toList();
    }

    public AdminProgrammingLanguageResponse createLanguage(AdminProgrammingLanguageRequest request) {
        ProgrammingLanguage language = new ProgrammingLanguage();
        applyLanguage(language, request, null);
        return toLanguageResponse(languageRepository.save(language));
    }

    public AdminProgrammingLanguageResponse updateLanguage(Long id, AdminProgrammingLanguageRequest request) {
        ProgrammingLanguage language = getLanguage(id);
        applyLanguage(language, request, id);
        return toLanguageResponse(languageRepository.save(language));
    }

    public void deleteLanguage(Long id) {
        ProgrammingLanguage language = getLanguage(id);
        long dependentCourses = courseRepository.countByLanguageId(id);
        if (dependentCourses > 0) {
            throw new IllegalStateException("Supprimez ou reaffectez d'abord les cours lies a ce langage");
        }

        languageRepository.delete(language);
    }

    @Transactional(readOnly = true)
    public List<AdminCourseResponse> listCourses() {
        return courseRepository.findAll(Sort.by(Sort.Order.asc("title"), Sort.Order.asc("id")))
                .stream()
                .map(this::toCourseResponse)
                .toList();
    }

    public AdminCourseResponse createCourse(AdminCourseRequest request) {
        Course course = new Course();
        applyCourse(course, request, null);
        return toCourseResponse(courseRepository.save(course));
    }

    public AdminCourseResponse updateCourse(Long id, AdminCourseRequest request) {
        Course course = getCourse(id);
        applyCourse(course, request, id);
        return toCourseResponse(courseRepository.save(course));
    }

    public void deleteCourse(Long id) {
        Course course = getCourse(id);

        List<CourseAttachment> attachments = courseAttachmentRepository.findByCourseIdOrderByUploadedAtDesc(id);
        for (CourseAttachment attachment : attachments) {
            courseAttachmentService.delete(id, attachment.getId());
        }

        userExerciseAttemptRepository.deleteByExercise_Lesson_Course_Id(id);
        userLessonProgressRepository.deleteByLesson_Course_Id(id);
        userCourseProgressRepository.deleteByCourse_Id(id);
        courseRepository.delete(course);
    }

    @Transactional(readOnly = true)
    public List<AdminLessonResponse> listLessons(Long courseId) {
        Course course = getCourse(courseId);
        return lessonRepository.findByCourseIdOrderByOrderIndexAsc(course.getId())
                .stream()
                .map(this::toLessonResponse)
                .toList();
    }

    public AdminLessonResponse createLesson(Long courseId, AdminLessonRequest request) {
        Course course = getCourse(courseId);
        Lesson lesson = new Lesson();
        lesson.setCourse(course);
        applyLesson(lesson, request, null);
        return toLessonResponse(lessonRepository.save(lesson));
    }

    public AdminLessonResponse updateLesson(Long lessonId, AdminLessonRequest request) {
        Lesson lesson = getLesson(lessonId);
        applyLesson(lesson, request, lessonId);
        return toLessonResponse(lessonRepository.save(lesson));
    }

    public void deleteLesson(Long lessonId) {
        Lesson lesson = getLesson(lessonId);
        Long courseId = lesson.getCourse().getId();

        userExerciseAttemptRepository.deleteByExercise_Lesson_Id(lessonId);
        userLessonProgressRepository.deleteByLesson_Id(lessonId);
        lessonRepository.delete(lesson);
        progressService.recalculateCourseProgressForAllUsers(courseId);
    }

    @Transactional(readOnly = true)
    public List<AdminExerciseResponse> listExercises(Long lessonId) {
        Lesson lesson = getLesson(lessonId);
        return exerciseRepository.findByLessonIdOrderByOrderIndexAsc(lesson.getId())
                .stream()
                .map(this::toExerciseResponse)
                .toList();
    }

    public AdminExerciseResponse createExercise(Long lessonId, AdminExerciseRequest request) {
        Lesson lesson = getLesson(lessonId);
        Exercise exercise = new Exercise();
        exercise.setLesson(lesson);
        applyExercise(exercise, request, null);
        return toExerciseResponse(exerciseRepository.save(exercise));
    }

    public AdminExerciseResponse updateExercise(Long exerciseId, AdminExerciseRequest request) {
        Exercise exercise = getExercise(exerciseId);
        applyExercise(exercise, request, exerciseId);
        return toExerciseResponse(exerciseRepository.save(exercise));
    }

    public void deleteExercise(Long exerciseId) {
        Exercise exercise = getExercise(exerciseId);
        userExerciseAttemptRepository.deleteByExercise_Id(exerciseId);
        exerciseRepository.delete(exercise);
    }

    private void applyLanguage(ProgrammingLanguage language,
                               AdminProgrammingLanguageRequest request,
                               Long currentId) {
        String code = normalizeLanguageCode(request.getCode());
        if (!LANGUAGE_CODE_PATTERN.matcher(code).matches()) {
            throw new IllegalArgumentException("Le code du langage doit utiliser des lettres minuscules, chiffres, +, #, . ou -");
        }

        ProgrammingLanguage existing = languageRepository.findByCodeIgnoreCase(code).orElse(null);
        if (isDifferentEntity(existing != null ? existing.getId() : null, currentId)) {
            throw new IllegalStateException("Un langage avec ce code existe deja");
        }

        language.setCode(code);
        language.setName(requiredText(request.getName(), "Le nom du langage est obligatoire", 60));
    }

    private void applyCourse(Course course, AdminCourseRequest request, Long currentId) {
        String code = normalizeCourseCode(request.getCode());
        if (!COURSE_CODE_PATTERN.matcher(code).matches()) {
            throw new IllegalArgumentException("Le code du cours doit contenir seulement des lettres majuscules, chiffres, tirets ou underscores");
        }

        Course existing = courseRepository.findByCodeIgnoreCase(code).orElse(null);
        if (isDifferentEntity(existing != null ? existing.getId() : null, currentId)) {
            throw new IllegalStateException("Un cours avec ce code existe deja");
        }

        course.setCode(code);
        course.setTitle(requiredText(request.getTitle(), "Le titre du cours est obligatoire", 160));
        course.setDescription(optionalText(request.getDescription(), 1000));
        course.setLanguage(getLanguage(request.getLanguageId()));
    }

    private void applyLesson(Lesson lesson, AdminLessonRequest request, Long currentId) {
        Long courseId = lesson.getCourse().getId();
        Integer orderIndex = request.getOrderIndex();
        boolean duplicateOrder = currentId == null
                ? lessonRepository.existsByCourseIdAndOrderIndex(courseId, orderIndex)
                : lessonRepository.existsByCourseIdAndOrderIndexAndIdNot(courseId, orderIndex, currentId);
        if (duplicateOrder) {
            throw new IllegalStateException("Une autre lecon utilise deja cet ordre dans ce cours");
        }

        lesson.setTitle(requiredText(request.getTitle(), "Le titre de la lecon est obligatoire", 255));
        lesson.setContent(optionalText(request.getContent(), 4000));
        lesson.setOrderIndex(orderIndex);
        lesson.setStarterCode(optionalText(request.getStarterCode(), 20000));
        lesson.setEditorLanguage(optionalText(request.getEditorLanguage(), 50));
        lesson.setExecutionType(optionalText(request.getExecutionType(), 40));
        lesson.setSampleOutput(optionalText(request.getSampleOutput(), 4000));
    }

    private void applyExercise(Exercise exercise, AdminExerciseRequest request, Long currentId) {
        Long lessonId = exercise.getLesson().getId();
        Integer orderIndex = request.getOrderIndex();
        boolean duplicateOrder = currentId == null
                ? exerciseRepository.existsByLessonIdAndOrderIndex(lessonId, orderIndex)
                : exerciseRepository.existsByLessonIdAndOrderIndexAndIdNot(lessonId, orderIndex, currentId);
        if (duplicateOrder) {
            throw new IllegalStateException("Un autre exercice utilise deja cet ordre dans cette lecon");
        }

        Exercise.ExerciseType type = parseExerciseType(request.getType());
        List<String> choices = sanitizeChoices(request.getChoices());
        if (type == Exercise.ExerciseType.MCQ) {
            if (choices.size() < 3 || choices.size() > 6) {
                throw new IllegalArgumentException("Un QCM doit contenir entre 3 et 6 choix");
            }
        } else if (type == Exercise.ExerciseType.TRUE_FALSE) {
            if (choices.isEmpty()) {
                choices = List.of("true", "false");
            }
            if (choices.size() != 2) {
                throw new IllegalArgumentException("Un exercice vrai/faux doit contenir exactement 2 choix");
            }
        } else {
            choices = List.of();
        }

        String answer = requiredText(request.getAnswer(), "La reponse attendue est obligatoire", 1000);
        if (type == Exercise.ExerciseType.MCQ || type == Exercise.ExerciseType.TRUE_FALSE) {
            answer = findMatchingChoice(answer, choices)
                    .orElseThrow(() -> new IllegalArgumentException("La reponse attendue doit correspondre a l'un des choix"));
        }

        exercise.setType(type);
        exercise.setQuestion(requiredText(request.getQuestion(), "La question de l'exercice est obligatoire", 2000));
        exercise.setChoicesJson(writeChoices(choices));
        exercise.setAnswer(answer);
        exercise.setExplanation(optionalText(request.getExplanation(), 4000));
        exercise.setOrderIndex(orderIndex);
    }

    private Exercise.ExerciseType parseExerciseType(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Le type d'exercice est obligatoire");
        }

        try {
            return Exercise.ExerciseType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Le type d'exercice doit etre MCQ, CODE ou TRUE_FALSE");
        }
    }

    private List<String> sanitizeChoices(List<String> rawChoices) {
        if (rawChoices == null) {
            return List.of();
        }

        List<String> result = new ArrayList<>();
        for (String choice : rawChoices) {
            if (choice == null) {
                continue;
            }

            String cleaned = choice.trim();
            if (cleaned.isBlank()) {
                continue;
            }
            if (cleaned.length() > 255) {
                throw new IllegalArgumentException("Chaque choix doit rester inferieur ou egal a 255 caracteres");
            }
            if (result.stream().noneMatch(existing -> existing.equalsIgnoreCase(cleaned))) {
                result.add(cleaned);
            }
        }

        return result;
    }

    private String writeChoices(List<String> choices) {
        if (choices == null || choices.isEmpty()) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(choices);
        } catch (Exception exception) {
            throw new IllegalStateException("Impossible d'enregistrer les choix de l'exercice");
        }
    }

    private List<String> readChoices(String choicesJson) {
        if (choicesJson == null || choicesJson.isBlank()) {
            return List.of();
        }

        try {
            List<String> rawChoices = objectMapper.readValue(choicesJson, new TypeReference<List<String>>() {
            });
            if (rawChoices == null) {
                return List.of();
            }
            return rawChoices.stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(value -> !value.isBlank())
                    .toList();
        } catch (Exception exception) {
            return List.of();
        }
    }

    private java.util.Optional<String> findMatchingChoice(String candidate, List<String> choices) {
        return choices.stream()
                .filter(choice -> choice.equalsIgnoreCase(candidate.trim()))
                .findFirst();
    }

    private ProgrammingLanguage getLanguage(Long id) {
        return languageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Langage introuvable"));
    }

    private Course getCourse(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cours introuvable"));
    }

    private Lesson getLesson(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lecon introuvable"));
    }

    private Exercise getExercise(Long id) {
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercice introuvable"));
    }

    private AdminProgrammingLanguageResponse toLanguageResponse(ProgrammingLanguage language) {
        return new AdminProgrammingLanguageResponse(
                language.getId(),
                TextEncodingFixer.fix(language.getCode()),
                TextEncodingFixer.fix(language.getName()),
                courseRepository.countByLanguageId(language.getId())
        );
    }

    private AdminCourseResponse toCourseResponse(Course course) {
        ProgrammingLanguage language = course.getLanguage();
        long enrolledCount = userCourseProgressRepository.countByCourse_Id(course.getId());
        long completedCount = userCourseProgressRepository.countByCourse_IdAndStatus(course.getId(), UserCourseProgress.Status.COMPLETED);

        return new AdminCourseResponse(
                course.getId(),
                TextEncodingFixer.fix(course.getCode()),
                TextEncodingFixer.fix(course.getTitle()),
                TextEncodingFixer.fix(course.getDescription()),
                language != null ? language.getId() : null,
                language != null ? TextEncodingFixer.fix(language.getCode()) : null,
                language != null ? TextEncodingFixer.fix(language.getName()) : null,
                lessonRepository.countByCourseId(course.getId()),
                courseAttachmentRepository.countByCourseId(course.getId()),
                enrolledCount,
                completedCount
        );
    }

    private AdminLessonResponse toLessonResponse(Lesson lesson) {
        Course course = lesson.getCourse();
        return new AdminLessonResponse(
                lesson.getId(),
                course != null ? course.getId() : null,
                course != null ? TextEncodingFixer.fix(course.getTitle()) : null,
                TextEncodingFixer.fix(lesson.getTitle()),
                TextEncodingFixer.fix(lesson.getContent()),
                lesson.getOrderIndex(),
                TextEncodingFixer.fix(lesson.getStarterCode()),
                TextEncodingFixer.fix(lesson.getEditorLanguage()),
                TextEncodingFixer.fix(lesson.getExecutionType()),
                TextEncodingFixer.fix(lesson.getSampleOutput()),
                exerciseRepository.countByLessonId(lesson.getId())
        );
    }

    private AdminExerciseResponse toExerciseResponse(Exercise exercise) {
        Lesson lesson = exercise.getLesson();
        return new AdminExerciseResponse(
                exercise.getId(),
                lesson != null ? lesson.getId() : null,
                lesson != null ? TextEncodingFixer.fix(lesson.getTitle()) : null,
                exercise.getType() != null ? exercise.getType().name() : null,
                TextEncodingFixer.fix(exercise.getQuestion()),
                readChoices(exercise.getChoicesJson()),
                TextEncodingFixer.fix(exercise.getAnswer()),
                TextEncodingFixer.fix(exercise.getExplanation()),
                exercise.getOrderIndex()
        );
    }

    private boolean isDifferentEntity(Long existingId, Long currentId) {
        if (existingId == null) {
            return false;
        }
        if (currentId == null) {
            return true;
        }
        return !existingId.equals(currentId);
    }

    private String normalizeLanguageCode(String value) {
        return requiredText(value, "Le code du langage est obligatoire", 30)
                .toLowerCase(Locale.ROOT);
    }

    private String normalizeCourseCode(String value) {
        return requiredText(value, "Le code du cours est obligatoire", 40)
                .toUpperCase(Locale.ROOT);
    }

    private String requiredText(String value, String message, int maxLength) {
        String cleaned = value == null ? "" : value.trim();
        if (cleaned.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        if (cleaned.length() > maxLength) {
            throw new IllegalArgumentException("Le texte depasse la taille maximale autorisee");
        }
        return cleaned;
    }

    private String optionalText(String value, int maxLength) {
        if (value == null) {
            return null;
        }

        String cleaned = value.trim();
        if (cleaned.isBlank()) {
            return null;
        }
        if (cleaned.length() > maxLength) {
            throw new IllegalArgumentException("Le texte depasse la taille maximale autorisee");
        }
         return cleaned;
     }

     /**
      * Calculates the next order index for a new lesson in the given course.
      * Based on the current maximum orderIndex among existing lessons.
      *
      * @param courseId the course identifier
      * @return the next order index (1 if no lessons exist, otherwise max + 1)
      */
     public int getNextLessonOrderIndex(Long courseId) {
         Integer maxOrder = lessonRepository.findMaxOrderIndexByCourseId(courseId);
         return (maxOrder == null ? 0 : maxOrder) + 1;
     }

     /**
      * Calculates the next order index for a new exercise in the given lesson.
      * Based on the current maximum orderIndex among existing exercises.
      *
      * @param lessonId the lesson identifier
      * @return the next order index (1 if no exercises exist, otherwise max + 1)
      */
     public int getNextExerciseOrderIndex(Long lessonId) {
         Integer maxOrder = exerciseRepository.findMaxOrderIndexByLessonId(lessonId);
         return (maxOrder == null ? 0 : maxOrder) + 1;
     }
 }
