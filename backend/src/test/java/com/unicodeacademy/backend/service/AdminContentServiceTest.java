package com.unicodeacademy.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unicodeacademy.backend.dto.AdminExerciseRequest;
import com.unicodeacademy.backend.model.Course;
import com.unicodeacademy.backend.model.CourseAttachment;
import com.unicodeacademy.backend.model.Lesson;
import com.unicodeacademy.backend.model.ProgrammingLanguage;
import com.unicodeacademy.backend.repository.CourseAttachmentRepository;
import com.unicodeacademy.backend.repository.CourseRepository;
import com.unicodeacademy.backend.repository.ExerciseRepository;
import com.unicodeacademy.backend.repository.LessonRepository;
import com.unicodeacademy.backend.repository.ProgrammingLanguageRepository;
import com.unicodeacademy.backend.repository.UserCourseProgressRepository;
import com.unicodeacademy.backend.repository.UserExerciseAttemptRepository;
import com.unicodeacademy.backend.repository.UserLessonProgressRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminContentServiceTest {

    @Mock
    private ProgrammingLanguageRepository languageRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private CourseAttachmentRepository courseAttachmentRepository;

    @Mock
    private UserLessonProgressRepository userLessonProgressRepository;

    @Mock
    private UserCourseProgressRepository userCourseProgressRepository;

    @Mock
    private UserExerciseAttemptRepository userExerciseAttemptRepository;

    @Mock
    private CourseAttachmentService courseAttachmentService;

    @Mock
    private ProgressService progressService;

    @Test
    void deleteLanguageRejectsRemovalWhenCoursesStillUseIt() {
        AdminContentService service = buildService();
        ProgrammingLanguage language = new ProgrammingLanguage();
        language.setCode("python");
        language.setName("Python");

        when(languageRepository.findById(5L)).thenReturn(Optional.of(language));
        when(courseRepository.countByLanguageId(5L)).thenReturn(2L);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> service.deleteLanguage(5L));

        assertEquals("Supprimez ou reaffectez d'abord les cours lies a ce langage", exception.getMessage());
        verify(languageRepository, never()).delete(language);
    }

    @Test
    void createExerciseRejectsMcqAnswerOutsideConfiguredChoices() {
        AdminContentService service = buildService();
        Lesson lesson = new Lesson();
        setId(lesson, 10L);

        when(lessonRepository.findById(10L)).thenReturn(Optional.of(lesson));
        when(exerciseRepository.existsByLessonIdAndOrderIndex(10L, 1)).thenReturn(false);

        AdminExerciseRequest request = new AdminExerciseRequest();
        request.setType("MCQ");
        request.setQuestion("Quel mot-cle affiche un texte ?");
        request.setChoices(List.of("print", "while", "return"));
        request.setAnswer("printf");
        request.setOrderIndex(1);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> service.createExercise(10L, request));

        assertEquals("La reponse attendue doit correspondre a l'un des choix", exception.getMessage());
    }

    @Test
    void deleteCourseRemovesAttachmentsAndLearnerDataBeforeDeletingCourse() {
        AdminContentService service = buildService();
        Course course = new Course();
        setId(course, 7L);

        CourseAttachment attachmentOne = new CourseAttachment();
        setId(attachmentOne, 100L);
        attachmentOne.setCourse(course);

        CourseAttachment attachmentTwo = new CourseAttachment();
        setId(attachmentTwo, 101L);
        attachmentTwo.setCourse(course);

        when(courseRepository.findById(7L)).thenReturn(Optional.of(course));
        when(courseAttachmentRepository.findByCourseIdOrderByUploadedAtDesc(7L))
                .thenReturn(List.of(attachmentOne, attachmentTwo));

        service.deleteCourse(7L);

        verify(courseAttachmentService).delete(7L, 100L);
        verify(courseAttachmentService).delete(7L, 101L);
        verify(userExerciseAttemptRepository).deleteByExercise_Lesson_Course_Id(7L);
        verify(userLessonProgressRepository).deleteByLesson_Course_Id(7L);
        verify(userCourseProgressRepository).deleteByCourse_Id(7L);
        verify(courseRepository).delete(course);
    }

    @Test
    void deleteLessonRemovesLearnerDataThenRecalculatesCourseProgressWithoutDeletingAllRows() {
        AdminContentService service = buildService();
        Course course = new Course();
        setId(course, 9L);

        Lesson lesson = new Lesson();
        setId(lesson, 44L);
        lesson.setCourse(course);

        when(lessonRepository.findById(44L)).thenReturn(Optional.of(lesson));

        service.deleteLesson(44L);

        verify(userExerciseAttemptRepository).deleteByExercise_Lesson_Id(44L);
        verify(userLessonProgressRepository).deleteByLesson_Id(44L);
        verify(lessonRepository).delete(lesson);
        verify(progressService).recalculateCourseProgressForAllUsers(9L);
        verify(userCourseProgressRepository, never()).deleteByCourse_Id(anyLong());
    }

    private AdminContentService buildService() {
        return new AdminContentService(
                languageRepository,
                courseRepository,
                lessonRepository,
                exerciseRepository,
                courseAttachmentRepository,
                userLessonProgressRepository,
                userCourseProgressRepository,
                userExerciseAttemptRepository,
                courseAttachmentService,
                progressService,
                new ObjectMapper()
        );
    }

    private void setId(Object entity, Long id) {
        try {
            entity.getClass().getMethod("setId", Long.class).invoke(entity, id);
        } catch (Exception exception) {
            throw new AssertionError(exception);
        }
    }
}
