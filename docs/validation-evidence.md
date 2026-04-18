# UniCode Academy - Validation Evidence

Date of evidence: 2026-04-18

## Commands executed

- Backend tests: `mvn test` (from `backend/`, exit code 0 on 2026-04-18)
- Frontend build: `npm run build` (from `unicode-frontend/`, exit code 0 on 2026-04-18)

## Evidence table

| Test ID | Module | Scenario | Expected result | Observed result | Type of proof |
| --- | --- | --- | --- | --- | --- |
| VAL-ADM-01 | Admin / Languages | Delete a language still linked to courses | Deletion must be blocked with a clear business message | `AdminContentServiceTest.deleteLanguageRejectsRemovalWhenCoursesStillUseIt` passed | Automated unit test |
| VAL-ADM-02 | Admin / Courses | Delete a course with linked attachments and learner data | Attachments, lesson progress, course progress and exercise attempts must be cleaned before course deletion | `AdminContentServiceTest.deleteCourseRemovesAttachmentsAndLearnerDataBeforeDeletingCourse` passed | Automated unit test |
| VAL-ADM-03 | Admin / Exercises | Create an MCQ whose correct answer is not one of the choices | Request must be rejected | `AdminContentServiceTest.createExerciseRejectsMcqAnswerOutsideConfiguredChoices` passed | Automated unit test |
| VAL-ADM-04 | Admin / Lessons | Delete one lesson from a course | Learner attempts and lesson progress for that lesson are removed; course progress rows for that course are recalculated, not deleted for all users | `AdminContentServiceTest.deleteLessonRemovesLearnerDataThenRecalculatesCourseProgressWithoutDeletingAllRows` passed | Automated unit test |
| VAL-PROG-01 | Progression / Lessons | Mark a lesson completed | Lesson status becomes `COMPLETED` and course progress sync is triggered | `LessonProgressServiceTest.markLessonCompletedCreatesCompletedProgressAndSyncsCourseProgress` passed | Automated unit test |
| VAL-PROG-02 | Progression / Courses | All lessons of a course are completed | Course status becomes `COMPLETED` with a completion timestamp | `ProgressServiceTest.syncCourseProgressMarksCourseCompletedWhenAllLessonsAreCompleted` passed | Automated unit test |
| VAL-PROG-03 | Progression / Courses | Some lessons of a course remain incomplete | Course status stays `IN_PROGRESS` and completion timestamp is cleared | `ProgressServiceTest.syncCourseProgressMarksCourseInProgressWhenLessonsRemain` passed | Automated unit test |
| VAL-PROG-04 | Progression / Lessons + exercises | Lesson has exercises; learner has a correct attempt on every exercise | Lesson is auto-marked `COMPLETED` and course progress sync runs | `LessonProgressServiceTest.maybeCompleteLessonAfterCorrectExerciseCompletesWhenAllExercisesAnsweredCorrectly` passed | Automated unit test |
| VAL-PROG-05 | Progression / Courses | Recalculate all `UserCourseProgress` rows for a course after a catalog change | Each row is saved with status consistent with completed lesson counts | `ProgressServiceTest.recalculateCourseProgressForAllUsersRefreshesEachStoredRow` passed | Automated unit test |
| VAL-LEAD-01 | Leaderboard | Compute the global ranking for learners while excluding admins | Ranking uses the backend points rule and excludes admin accounts | `LeaderboardServiceTest.getLeaderboardUsesGlobalPointsRuleAndExcludesAdmins` passed | Automated unit test |
| VAL-EX-01 | Exercises / Attempts | Submit a correct MCQ answer | Attempt is persisted and the service checks whether the lesson can be completed via exercises | `ExerciseAttemptControllerWebMvcTest.attemptAcceptsJsonAliasAndSavesCorrectMcqAttempt` verifies `LessonProgressService.maybeCompleteLessonAfterCorrectExercise` | Automated WebMvc test |
| VAL-EX-02 | Exercises / Attempts | Submit an incorrect answer | Attempt is persisted but lesson auto-completion must not run | `ExerciseAttemptControllerWebMvcTest.submitReturnsCorrectAnswerForIncorrectCodeAttempt` verifies `maybeCompleteLessonAfterCorrectExercise` is never called | Automated WebMvc test |
| VAL-BE-01 | Backend integration | Run the full backend automated suite | All tests pass | `mvn test` completed with exit code 0 (55 `@Test` methods under `backend/src/test/java` counted on 2026-04-18) | Automated test run |
| VAL-FE-01 | Frontend | Production build | TypeScript + Vite build succeeds | `npm run build` completed with exit code 0 | Frontend build proof |
| VAL-PRAC-01 | Practice module | Reset workspace while the practice panel is open | `workspaceResetSignal` clears `PratiqueInline` local validation state after Reinitialiser or Retour a la lecon | Implemented in `LeconPage.tsx` + `PratiqueInline.tsx`; verified via successful `npm run build` | Build proof; manual UI demo recommended for screenshots |

## Notes

- Evidence rows map to real automated tests or real build runs; counts and dates reflect the last run in this workspace (2026-04-18).
- No fake screenshots, deployment checks, or browser E2E results are claimed here.
- Weekly leaderboard is not implemented; the product uses a **global** ranking (`LeaderboardService`).
