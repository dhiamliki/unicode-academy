# 1. Executive Overview

- Project title: **UniCode Academy**
- One-paragraph summary: UniCode Academy is a full-stack learning web application built as a separate React single-page frontend and Spring Boot backend. The implemented product combines a seeded programming-course catalog, lesson reading, inline practice/code execution, exercise submission, progress tracking, leaderboard ranking, user profile/settings management, course resources, real-time chat, AI hint generation, and an admin area for user/attachment management. The current codebase is clearly centered on academic programming learning rather than generic LMS functionality. [Evidence: `unicode-frontend/src/App.tsx`; `unicode-frontend/src/pages/AccueilPage.tsx`; `unicode-frontend/src/pages/LeconPage.tsx`; `unicode-frontend/src/pages/ExercicesPage.tsx`; `unicode-frontend/src/pages/AdminPage.tsx`; `backend/src/main/java/com/unicodeacademy/backend/controller`; `backend/src/main/resources/data.sql`]
- Main objective: Inference from the seeded catalog and implemented workflows: centralize programming learning for a curriculum-oriented audience by letting users study course content, practice code, answer exercises, and monitor progress in one application. [Evidence: `backend/src/main/resources/data.sql:1-22`; `unicode-frontend/src/components/CoursePathView.tsx`; `unicode-frontend/src/pages/LeconPage.tsx`; `unicode-frontend/src/pages/ExercicesPage.tsx`; `backend/src/main/java/com/unicodeacademy/backend/controller/ProgressController.java:54-99`]
- Target users: The codebase supports authenticated learners (`USER`), administrators (`ADMIN`), and an unauthenticated visitor state for login/registration and public read access to some catalog/content endpoints. There is no separate instructor role in the persisted domain model. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/User.java:34-46`; `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:46-58`; `unicode-frontend/src/App.tsx:31-91`]
- Core value proposition: The strongest product proposition visible in code is "one place for course content, guided practice, quizzes/exercises, progress analytics, community interaction, and administration around programming education." [Evidence: `unicode-frontend/src/pages/AccueilPage.tsx`; `unicode-frontend/src/pages/ProfilPage.tsx`; `unicode-frontend/src/components/ChatWidget.tsx`; `backend/src/main/java/com/unicodeacademy/backend/repository/UserRepository.java:29-77`]

# 2. Functional Overview

## Feature: Authentication and session management

- What it does: Supports account registration, email/password login, Google Sign-In login, JWT refresh, protected routing, and logout. Access tokens and refresh tokens are issued by the backend and stored in browser `localStorage`, then automatically refreshed on `401` responses. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/AuthController.java:27-43`; `backend/src/main/java/com/unicodeacademy/backend/service/AuthService.java:56-132`; `backend/src/main/java/com/unicodeacademy/backend/security/JwtService.java:35-105`; `unicode-frontend/src/api/http.ts:28-97`; `unicode-frontend/src/auth/session.ts:1-29`; `unicode-frontend/src/auth/authState.ts:4-11`]
- Which user role uses it: Anonymous users for registration/login; `USER` and `ADMIN` after authentication. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:49-58`; `unicode-frontend/src/App.tsx:31-91`]
- Main frontend files involved: `unicode-frontend/src/pages/LoginPage.tsx`, `unicode-frontend/src/pages/RegisterPage.tsx`, `unicode-frontend/src/api/auth.ts`, `unicode-frontend/src/api/http.ts`, `unicode-frontend/src/auth/session.ts`, `unicode-frontend/src/auth/authState.ts`, `unicode-frontend/src/App.tsx`, `unicode-frontend/src/main.tsx`
- Main backend files involved: `backend/src/main/java/com/unicodeacademy/backend/controller/AuthController.java`, `backend/src/main/java/com/unicodeacademy/backend/service/AuthService.java`, `backend/src/main/java/com/unicodeacademy/backend/security/JwtService.java`, `backend/src/main/java/com/unicodeacademy/backend/security/JwtAuthFilter.java`, `backend/src/main/java/com/unicodeacademy/backend/security/CustomUserDetailsService.java`, `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java`, `backend/src/main/java/com/unicodeacademy/backend/security/AuthRateLimitFilter.java`
- Any related database models/tables/collections: `users` / `User` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/User.java:9-46`]
- Notes about completeness or limitations: Implemented and productized. Google login is environment-dependent because both frontend and backend require a configured Google client ID. Refresh tokens are stateless and not stored server-side, so no revocation list/session registry is visible. [Evidence: `unicode-frontend/src/pages/LoginPage.tsx:24-69,205-228`; `backend/src/main/java/com/unicodeacademy/backend/service/AuthService.java:135-152`; `backend/src/main/resources/application.properties:19-24`]

## Feature: Course catalog and language taxonomy

- What it does: Exposes programming languages and courses, with optional course filtering by language code. The seeded catalog includes C, Java, Python, C++, MySQL, C#/.NET, HTML, CSS, and JavaScript. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/CourseController.java:35-55`; `backend/src/main/java/com/unicodeacademy/backend/controller/LanguageController.java:23-37`; `backend/src/main/resources/data.sql:1-22`]
- Which user role uses it: Catalog endpoints are public at backend level, but the SPA primarily surfaces them inside authenticated learning pages. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:54-56`; `unicode-frontend/src/App.tsx:73-90`]
- Main frontend files involved: `unicode-frontend/src/api/courses.ts`, `unicode-frontend/src/api/users.ts`, `unicode-frontend/src/pages/ApprendrePage.tsx`, `unicode-frontend/src/pages/CoursPathPage.tsx`, `unicode-frontend/src/components/CoursePathView.tsx`
- Main backend files involved: `backend/src/main/java/com/unicodeacademy/backend/controller/CourseController.java`, `backend/src/main/java/com/unicodeacademy/backend/controller/LanguageController.java`, `backend/src/main/java/com/unicodeacademy/backend/repository/CourseRepository.java`, `backend/src/main/java/com/unicodeacademy/backend/repository/ProgrammingLanguageRepository.java`
- Any related database models/tables/collections: `programming_languages` / `ProgrammingLanguage`, `courses` / `Course` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/ProgrammingLanguage.java:5-19`; `backend/src/main/java/com/unicodeacademy/backend/model/Course.java:9-36`]
- Notes about completeness or limitations: Implemented. The backend allows unauthenticated reads of course and lesson content, which may be either an intentional public-content choice or a security/product mismatch with the protected frontend navigation. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:54-56`; `unicode-frontend/src/App.tsx:73-90`]

## Feature: Course path and unitized learning journey

- What it does: Organizes each course into a navigable path, with lesson summaries, completion percentages, attachment access, and a course-specific chat entry point. On the frontend, lessons are grouped into "units" of four lessons for navigation and progress display. [Evidence: `unicode-frontend/src/components/CoursePathView.tsx:89-90,193-248,274-311`; `unicode-frontend/src/lib/academy.ts:133-245`; `backend/src/main/java/com/unicodeacademy/backend/controller/CourseController.java:57-93`]
- Which user role uses it: Authenticated learners and admins. [Evidence: `unicode-frontend/src/App.tsx:73-90`]
- Main frontend files involved: `unicode-frontend/src/components/CoursePathView.tsx`, `unicode-frontend/src/pages/ApprendrePage.tsx`, `unicode-frontend/src/pages/CoursPathPage.tsx`, `unicode-frontend/src/lib/academy.ts`, `unicode-frontend/src/api/courses.ts`, `unicode-frontend/src/api/progress.ts`, `unicode-frontend/src/api/attachments.ts`
- Main backend files involved: `backend/src/main/java/com/unicodeacademy/backend/controller/CourseController.java`, `backend/src/main/java/com/unicodeacademy/backend/controller/CourseAttachmentController.java`, `backend/src/main/java/com/unicodeacademy/backend/repository/LessonRepository.java`, `backend/src/main/java/com/unicodeacademy/backend/repository/CourseRepository.java`
- Any related database models/tables/collections: `courses`, `lessons`, `course_attachments`, `user_lesson_progress`, `user_course_progress` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/Course.java`; `backend/src/main/java/com/unicodeacademy/backend/model/Lesson.java`; `backend/src/main/java/com/unicodeacademy/backend/model/CourseAttachment.java`; `backend/src/main/java/com/unicodeacademy/backend/model/UserLessonProgress.java`; `backend/src/main/java/com/unicodeacademy/backend/model/UserCourseProgress.java`]
- Notes about completeness or limitations: Implemented. The "unit" concept is frontend-only and not persisted as a backend entity; it is a presentation grouping strategy rather than a real domain model. [Evidence: `unicode-frontend/src/lib/academy.ts:133-184`; absence of a backend `Unit`/`Module` model under `backend/src/main/java/com/unicodeacademy/backend/model`]

## Feature: Lesson reading and practice playground

- What it does: Displays lesson content using Markdown rendering, provides starter code/sample output metadata, supports inline practice flows, and runs code through either backend execution or client-side web previews depending on language. The page also stores recent lessons locally to power "resume learning". [Evidence: `unicode-frontend/src/pages/LeconPage.tsx:4-15,468-637,715-759,942-952`; `unicode-frontend/src/utils/recentLessons.ts:6-54`; `backend/src/main/java/com/unicodeacademy/backend/controller/LessonController.java:39-112`; `backend/src/main/java/com/unicodeacademy/backend/controller/CodeExecutionController.java:13-23`; `backend/src/main/java/com/unicodeacademy/backend/service/CodeExecutionService.java:41-107`]
- Which user role uses it: Authenticated learners and admins. [Evidence: `unicode-frontend/src/App.tsx:48-70`]
- Main frontend files involved: `unicode-frontend/src/pages/LeconPage.tsx`, `unicode-frontend/src/components/PratiqueInline.tsx`, `unicode-frontend/src/components/CodeEditor.tsx`, `unicode-frontend/src/utils/webPlayground.ts`, `unicode-frontend/src/utils/recentLessons.ts`, `unicode-frontend/src/api/http.ts`, `unicode-frontend/src/components/AiAssistant.tsx`
- Main backend files involved: `backend/src/main/java/com/unicodeacademy/backend/controller/LessonController.java`, `backend/src/main/java/com/unicodeacademy/backend/controller/CodeExecutionController.java`, `backend/src/main/java/com/unicodeacademy/backend/service/CodeExecutionService.java`, `backend/src/main/java/com/unicodeacademy/backend/repository/LessonRepository.java`
- Any related database models/tables/collections: `lessons`, `courses`, `programming_languages`, `exercises` for embedded lesson exercise display [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/Lesson.java:9-48`; `backend/src/main/java/com/unicodeacademy/backend/model/Course.java:9-36`; `backend/src/main/java/com/unicodeacademy/backend/model/ProgrammingLanguage.java:5-19`; `backend/src/main/java/com/unicodeacademy/backend/model/Exercise.java:6-44`]
- Notes about completeness or limitations: Implemented but partly environment-dependent. Backend code execution needs local toolchains for Python/Java/C/C++/C#; SQL runs in an embedded H2 sandbox; HTML/CSS/JavaScript are treated as web languages and handled client-side. The editor only has dedicated syntax extensions for HTML, CSS, JavaScript, and Python; Java currently falls back to plain editor mode. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/service/CodeExecutionService.java:41-107,126-317`; `backend/src/main/resources/application.properties:45-48`; `unicode-frontend/src/components/CodeEditor.tsx:3-10,97-110`; `unicode-frontend/package.json`]

## Feature: Exercise series and answer validation

- What it does: Loads exercises per lesson, accepts answer submissions, stores attempts, returns correctness/explanations, invalidates cached progress, and celebrates successful series completion in the UI. The model supports `MCQ`, `CODE`, and `TRUE_FALSE` exercise types. [Evidence: `unicode-frontend/src/pages/ExercicesPage.tsx:346-376,583-674`; `backend/src/main/java/com/unicodeacademy/backend/controller/ExerciseAttemptController.java:47-133`; `backend/src/main/java/com/unicodeacademy/backend/model/Exercise.java:23-44`]
- Which user role uses it: Authenticated learners and admins. [Evidence: `unicode-frontend/src/App.tsx:64-70`; `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:58`]
- Main frontend files involved: `unicode-frontend/src/pages/ExercicesPage.tsx`, `unicode-frontend/src/components/AiAssistant.tsx`, `unicode-frontend/src/components/XPCelebration.tsx`, `unicode-frontend/src/api/http.ts`, `unicode-frontend/src/lib/queryKeys.ts`
- Main backend files involved: `backend/src/main/java/com/unicodeacademy/backend/controller/ExerciseAttemptController.java`, `backend/src/main/java/com/unicodeacademy/backend/repository/ExerciseRepository.java`, `backend/src/main/java/com/unicodeacademy/backend/repository/UserExerciseAttemptRepository.java`
- Any related database models/tables/collections: `exercises`, `user_exercise_attempts`, indirectly `lessons` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/Exercise.java`; `backend/src/main/java/com/unicodeacademy/backend/model/UserExerciseAttempt.java`; `backend/src/main/java/com/unicodeacademy/backend/model/Lesson.java`]
- Notes about completeness or limitations: Implemented. Specialized validation is strongest for MCQ flows: the backend enforces that submitted MCQ answers match configured choices. `CODE` exercises exist in the data model, but no dedicated code-grading engine is visible inside the exercise-attempt pipeline; code practice is mainly handled through the separate lesson playground/code runner. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/ExerciseAttemptController.java:64-80`; `backend/src/main/java/com/unicodeacademy/backend/model/Exercise.java:23-25`; `unicode-frontend/src/pages/LeconPage.tsx:468-637`]

## Feature: Progress tracking and completion gating

- What it does: Tracks lesson completion, course progress summaries, and exercise attempt statistics. Lesson completion is gated by sequential order and minimum exercise participation. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/LessonProgressController.java:34-67`; `backend/src/main/java/com/unicodeacademy/backend/service/LessonProgressService.java:28-151`; `backend/src/main/java/com/unicodeacademy/backend/controller/ProgressController.java:42-99`; `backend/src/main/java/com/unicodeacademy/backend/repository/CourseRepository.java:23-36`]
- Which user role uses it: Authenticated learners and admins. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:58`; `unicode-frontend/src/App.tsx:48-90`]
- Main frontend files involved: `unicode-frontend/src/api/http.ts`, `unicode-frontend/src/api/progress.ts`, `unicode-frontend/src/pages/LeconPage.tsx`, `unicode-frontend/src/pages/ExercicesPage.tsx`, `unicode-frontend/src/pages/AccueilPage.tsx`, `unicode-frontend/src/components/AppShell.tsx`, `unicode-frontend/src/components/CoursePathView.tsx`
- Main backend files involved: `backend/src/main/java/com/unicodeacademy/backend/controller/LessonProgressController.java`, `backend/src/main/java/com/unicodeacademy/backend/service/LessonProgressService.java`, `backend/src/main/java/com/unicodeacademy/backend/controller/ProgressController.java`, `backend/src/main/java/com/unicodeacademy/backend/repository/UserLessonProgressRepository.java`, `backend/src/main/java/com/unicodeacademy/backend/repository/UserCourseProgressRepository.java`, `backend/src/main/java/com/unicodeacademy/backend/repository/UserExerciseAttemptRepository.java`
- Any related database models/tables/collections: `user_lesson_progress`, `user_course_progress`, `user_exercise_attempts`, `lessons`, `courses` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/UserLessonProgress.java`; `backend/src/main/java/com/unicodeacademy/backend/model/UserCourseProgress.java`; `backend/src/main/java/com/unicodeacademy/backend/model/UserExerciseAttempt.java`]
- Notes about completeness or limitations: Implemented, but there is some duplication in the course-progress model. The SPA uses `/api/progress/summary`, which derives completion from lesson progress, while `/api/progress/me` and `/api/progress/course/{courseId}/complete` rely on the dedicated `user_course_progress` table. The explicit course-completion endpoint does not itself verify that all lessons are complete. [Evidence: `unicode-frontend/src/api/progress.ts:17-24`; `backend/src/main/java/com/unicodeacademy/backend/controller/ProgressController.java:42-125`; `backend/src/main/java/com/unicodeacademy/backend/model/UserCourseProgress.java:8-39`]

## Feature: Dashboard and learner analytics

- What it does: Builds a learner home dashboard and profile analytics view with streaks, recently completed lessons, course percentages, resume targets, 28-day activity, and progress totals. [Evidence: `unicode-frontend/src/pages/AccueilPage.tsx:61-168,193-256,486-705`; `unicode-frontend/src/pages/ProfilPage.tsx:52-145,280-390`; `unicode-frontend/src/lib/academy.ts:51-89`; `backend/src/main/java/com/unicodeacademy/backend/controller/ProgressController.java:54-99`]
- Which user role uses it: Authenticated learners and admins. [Evidence: `unicode-frontend/src/App.tsx:73-90`]
- Main frontend files involved: `unicode-frontend/src/pages/AccueilPage.tsx`, `unicode-frontend/src/pages/ProfilPage.tsx`, `unicode-frontend/src/components/AppShell.tsx`, `unicode-frontend/src/lib/academy.ts`, `unicode-frontend/src/utils/recentLessons.ts`, `unicode-frontend/src/api/progress.ts`
- Main backend files involved: `backend/src/main/java/com/unicodeacademy/backend/controller/ProgressController.java`, `backend/src/main/java/com/unicodeacademy/backend/controller/StatsController.java`, `backend/src/main/java/com/unicodeacademy/backend/repository/CourseRepository.java`, `backend/src/main/java/com/unicodeacademy/backend/repository/UserExerciseAttemptRepository.java`
- Any related database models/tables/collections: Primarily `user_lesson_progress`, `user_exercise_attempts`, `courses`, `lessons`; `StatsResponse` is also backed by `user_course_progress`. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/StatsController.java:36-57`; `backend/src/main/java/com/unicodeacademy/backend/model/UserLessonProgress.java`; `backend/src/main/java/com/unicodeacademy/backend/model/UserExerciseAttempt.java`; `backend/src/main/java/com/unicodeacademy/backend/model/UserCourseProgress.java`]
- Notes about completeness or limitations: The learner-facing dashboard/profile are implemented. The backend also exposes `/api/stats/me`, but the current SPA does not appear to consume that endpoint; it is effectively backend-only in the present UI. Resume learning is browser-local because recent lessons are stored in `localStorage`, not in the backend. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/StatsController.java:36-57`; `unicode-frontend/src/utils/recentLessons.ts:6-54`; `unicode-frontend/src/api/progress.ts:17-24`]

## Feature: Leaderboard and gamification

- What it does: Computes a ranked leaderboard excluding admins, with points based on completed lessons, correct exercises, and fully completed courses. The frontend renders a podium/full ranking experience. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/LeaderboardController.java:23-44`; `backend/src/main/java/com/unicodeacademy/backend/repository/UserRepository.java:29-77`; `unicode-frontend/src/pages/ClassementPage.tsx`; `unicode-frontend/src/api/leaderboard.ts`]
- Which user role uses it: Authenticated learners and admins. [Evidence: `unicode-frontend/src/App.tsx:78-81`; `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:58`]
- Main frontend files involved: `unicode-frontend/src/pages/ClassementPage.tsx`, `unicode-frontend/src/api/leaderboard.ts`, `unicode-frontend/src/lib/queryKeys.ts`
- Main backend files involved: `backend/src/main/java/com/unicodeacademy/backend/controller/LeaderboardController.java`, `backend/src/main/java/com/unicodeacademy/backend/repository/UserRepository.java`
- Any related database models/tables/collections: `users`, `user_lesson_progress`, `user_exercise_attempts`, `lessons` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/repository/UserRepository.java:29-77`]
- Notes about completeness or limitations: Implemented. Point logic is hard-coded in a native SQL query: `10` points per completed lesson, `2` per correct exercise, and `50` per fully completed course. There is no separate gamification configuration table visible. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/repository/UserRepository.java:67-69`]

## Feature: Profile, avatar, settings, and account lifecycle

- What it does: Exposes current-user information, avatar upload/display, password change, preferred-language display, logout, and self-account deletion. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/UserController.java:52-178,208-235`; `unicode-frontend/src/pages/ProfilPage.tsx:46-233,330-390`; `unicode-frontend/src/pages/ParametresPage.tsx:17-140,271-360`; `unicode-frontend/src/api/users.ts:27-69`]
- Which user role uses it: Authenticated learners and admins. [Evidence: `unicode-frontend/src/App.tsx:79-81`; `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:50-58`]
- Main frontend files involved: `unicode-frontend/src/pages/ProfilPage.tsx`, `unicode-frontend/src/pages/ParametresPage.tsx`, `unicode-frontend/src/api/users.ts`, `unicode-frontend/src/components/AppShell.tsx`
- Main backend files involved: `backend/src/main/java/com/unicodeacademy/backend/controller/UserController.java`, `backend/src/main/java/com/unicodeacademy/backend/dto/ChangePasswordRequest.java`
- Any related database models/tables/collections: `users`, plus dependent cleanup in `user_lesson_progress`, `user_course_progress`, and `user_exercise_attempts` during account deletion [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/User.java`; `backend/src/main/java/com/unicodeacademy/backend/controller/UserController.java:168-177`]
- Notes about completeness or limitations: Implemented. Avatar upload has explicit size/type/path checks. Password policy is inconsistent: registration requires a stronger password pattern, but password change only enforces a six-character minimum on the backend. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/UserController.java:75-93,96-165`; `backend/src/main/java/com/unicodeacademy/backend/dto/RegisterRequest.java:16-21`; `backend/src/main/java/com/unicodeacademy/backend/dto/ChangePasswordRequest.java:3-24`]

## Feature: Preferred language personalization

- What it does: Lets a user store a preferred programming language and uses that preference in the shell/profile display. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/UserPreferenceController.java:27-54`; `unicode-frontend/src/pages/ParametresPage.tsx:56-86,220-267`; `unicode-frontend/src/components/AppShell.tsx`; `unicode-frontend/src/pages/ProfilPage.tsx:123-145,202-205`]
- Which user role uses it: Authenticated learners and admins. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/UserPreferenceController.java:15-54`]
- Main frontend files involved: `unicode-frontend/src/pages/ParametresPage.tsx`, `unicode-frontend/src/pages/ProfilPage.tsx`, `unicode-frontend/src/components/AppShell.tsx`, `unicode-frontend/src/api/users.ts`
- Main backend files involved: `backend/src/main/java/com/unicodeacademy/backend/controller/UserPreferenceController.java`, `backend/src/main/java/com/unicodeacademy/backend/repository/ProgrammingLanguageRepository.java`, `backend/src/main/java/com/unicodeacademy/backend/repository/UserRepository.java`
- Any related database models/tables/collections: `users.preferred_language_id`, `programming_languages` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/User.java:44-46`; `backend/src/main/java/com/unicodeacademy/backend/model/ProgrammingLanguage.java:5-19`]
- Notes about completeness or limitations: Implemented. Preference affects personalization, but no evidence was found of deep adaptive curriculum logic based on that field. [Evidence: `unicode-frontend/src/pages/ParametresPage.tsx`; `unicode-frontend/src/components/AppShell.tsx`; absence of a backend recommendation/adaptive service]

## Feature: Course attachments and learning resources

- What it does: Allows admins to upload PDF/image attachments per course and lets learners download them from the course path. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/AdminCourseAttachmentController.java:21-45`; `backend/src/main/java/com/unicodeacademy/backend/service/CourseAttachmentService.java:44-160`; `backend/src/main/java/com/unicodeacademy/backend/controller/CourseAttachmentController.java`; `unicode-frontend/src/components/CoursePathView.tsx:89-90,193-195,274-311`; `unicode-frontend/src/pages/AdminPage.tsx:413-520`]
- Which user role uses it: `ADMIN` uploads/deletes; authenticated learners and admins download. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:53-55`; `unicode-frontend/src/pages/AdminPage.tsx:413-520`; `unicode-frontend/src/components/CoursePathView.tsx:274-311`]
- Main frontend files involved: `unicode-frontend/src/pages/AdminPage.tsx`, `unicode-frontend/src/components/CoursePathView.tsx`, `unicode-frontend/src/api/attachments.ts`
- Main backend files involved: `backend/src/main/java/com/unicodeacademy/backend/controller/AdminCourseAttachmentController.java`, `backend/src/main/java/com/unicodeacademy/backend/controller/CourseAttachmentController.java`, `backend/src/main/java/com/unicodeacademy/backend/service/CourseAttachmentService.java`, `backend/src/main/java/com/unicodeacademy/backend/repository/CourseAttachmentRepository.java`
- Any related database models/tables/collections: `course_attachments`, `courses`; files are stored on disk under `uploads/course-attachments` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/CourseAttachment.java:11-40`; `backend/src/main/java/com/unicodeacademy/backend/service/CourseAttachmentService.java:30-31`]
- Notes about completeness or limitations: Implemented for upload/download/delete. Validation is stronger here than in chat uploads: size is capped at `10 MB`, only PDF/images are allowed, and path traversal is checked. The admin upload also publishes a `/topic/notifications` message, but no current frontend consumer was found, so that notification channel is backend-only today. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/service/CourseAttachmentService.java:30-76,131-145`; `backend/src/main/java/com/unicodeacademy/backend/controller/AdminCourseAttachmentController.java:26-36`; search evidence from this audit showing no frontend `/topic/notifications` subscriber]

## Feature: Real-time chat and attachment sharing

- What it does: Provides global and course-specific chat rooms with persisted message history, real-time WebSocket delivery, and chat attachments stored on disk. A floating chat widget is available outside the dedicated `/chat` page. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/ChatRestController.java:45-131`; `backend/src/main/java/com/unicodeacademy/backend/controller/ChatWebSocketController.java:21-33`; `backend/src/main/java/com/unicodeacademy/backend/config/WebSocketConfig.java:28-44`; `unicode-frontend/src/components/ChatWidget.tsx:108-213,242-401`; `unicode-frontend/src/pages/ChatPage.tsx:12-89`; `unicode-frontend/src/components/AppShell.tsx:161,534`]
- Which user role uses it: Authenticated learners and admins. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:58`; `backend/src/main/java/com/unicodeacademy/backend/security/JwtStompChannelInterceptor.java:35-72`]
- Main frontend files involved: `unicode-frontend/src/components/ChatWidget.tsx`, `unicode-frontend/src/pages/ChatPage.tsx`, `unicode-frontend/src/api/chat.ts`, `unicode-frontend/src/components/AppShell.tsx`
- Main backend files involved: `backend/src/main/java/com/unicodeacademy/backend/controller/ChatRestController.java`, `backend/src/main/java/com/unicodeacademy/backend/controller/ChatWebSocketController.java`, `backend/src/main/java/com/unicodeacademy/backend/service/ChatMessageService.java`, `backend/src/main/java/com/unicodeacademy/backend/config/WebSocketConfig.java`, `backend/src/main/java/com/unicodeacademy/backend/security/JwtStompChannelInterceptor.java`, `backend/src/main/java/com/unicodeacademy/backend/config/ChatRetentionScheduler.java`, `backend/src/main/java/com/unicodeacademy/backend/repository/ChatMessageRepository.java`
- Any related database models/tables/collections: `chat_messages`; files are stored on disk under `uploads/chat` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/ChatMessage.java:10-46`; `backend/src/main/java/com/unicodeacademy/backend/controller/ChatRestController.java:42-43`; `backend/src/main/java/com/unicodeacademy/backend/service/ChatMessageService.java:191-198`]
- Notes about completeness or limitations: Implemented and surfaced in the UI. Reliability measures include history retrieval and retention cleanup, but moderation, richer room governance, and upload content validation are not visible. Chat attachments have a `10 MB` size limit and safe path resolution on download, but unlike course attachments/avatars they do not appear to restrict MIME types. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/ChatRestController.java:42-85,112-129`; `backend/src/main/java/com/unicodeacademy/backend/service/ChatMessageService.java:35-36,146-182`; `backend/src/main/java/com/unicodeacademy/backend/config/ChatRetentionScheduler.java:16-21`]

## Feature: AI pedagogical hints

- What it does: Offers hint endpoints for exercises and practice tasks, with French pedagogical prompting and a fallback mode when the Anthropic provider is unavailable or unconfigured. The hint assistant is embedded into lesson and exercise pages. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/AiController.java:21-67`; `backend/src/main/java/com/unicodeacademy/backend/service/AiService.java:33-34,42,88-125,161-179,767`; `unicode-frontend/src/components/AiAssistant.tsx`; `unicode-frontend/src/pages/LeconPage.tsx:942-952`; `unicode-frontend/src/pages/ExercicesPage.tsx:583-587`; `unicode-frontend/src/api/ai.ts`]
- Which user role uses it: Authenticated learners and admins, because AI hint endpoints require authentication. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:49-58`]
- Main frontend files involved: `unicode-frontend/src/components/AiAssistant.tsx`, `unicode-frontend/src/api/ai.ts`, `unicode-frontend/src/pages/LeconPage.tsx`, `unicode-frontend/src/pages/ExercicesPage.tsx`
- Main backend files involved: `backend/src/main/java/com/unicodeacademy/backend/controller/AiController.java`, `backend/src/main/java/com/unicodeacademy/backend/service/AiService.java`, `backend/src/main/java/com/unicodeacademy/backend/controller/GlobalExceptionHandler.java`
- Any related database models/tables/collections: None clearly persisted for hints. [Evidence: no AI-specific entity under `backend/src/main/java/com/unicodeacademy/backend/model`; `backend/src/main/java/com/unicodeacademy/backend/service/AiService.java`]
- Notes about completeness or limitations: Implemented but environment-dependent for provider-backed behavior. The fallback path is robust and intentional, which improves resilience, but there is no hint history/audit trail persisted. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/service/AiService.java:88-125,161-179,767`; `backend/src/main/java/com/unicodeacademy/backend/controller/GlobalExceptionHandler.java:29-47,63-81,92-111`]

## Feature: Admin control panel

- What it does: Gives administrators a dedicated `/admin` page to list users, promote/demote roles, delete users, inspect course catalog rows, and manage course attachments. [Evidence: `unicode-frontend/src/App.tsx:82-89,129-159`; `unicode-frontend/src/pages/AdminPage.tsx:25-120,231-520`; `backend/src/main/java/com/unicodeacademy/backend/controller/AdminUserController.java:34-119`; `backend/src/main/java/com/unicodeacademy/backend/controller/AdminCourseAttachmentController.java:21-45`]
- Which user role uses it: `ADMIN` only. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:52-53`; `unicode-frontend/src/App.tsx:129-159`]
- Main frontend files involved: `unicode-frontend/src/pages/AdminPage.tsx`, `unicode-frontend/src/api/adminUsers.ts`, `unicode-frontend/src/api/attachments.ts`, `unicode-frontend/src/api/courses.ts`, `unicode-frontend/src/App.tsx`
- Main backend files involved: `backend/src/main/java/com/unicodeacademy/backend/controller/AdminUserController.java`, `backend/src/main/java/com/unicodeacademy/backend/controller/AdminCourseAttachmentController.java`, `backend/src/main/java/com/unicodeacademy/backend/service/AccountTerminationEmailService.java`, `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java`
- Any related database models/tables/collections: `users`, dependent progress/attempt tables on deletion, `course_attachments`, `courses` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/AdminUserController.java:75-81`; `backend/src/main/java/com/unicodeacademy/backend/model/CourseAttachment.java`; `backend/src/main/java/com/unicodeacademy/backend/model/User.java`]
- Notes about completeness or limitations: Partially surfaced. User and attachment management are actionable, but the course tab is read-only in practice: the UI button says "Ajouter un cours" but currently only triggers a placeholder toast, and no backend course-CRUD admin endpoints are present. [Evidence: `unicode-frontend/src/pages/AdminPage.tsx:380-409`; `unicode-frontend/src/pages/AdminPage.tsx:387-393`; absence of backend admin course CRUD controller beyond attachments]

## Feature: Email notification on admin account termination

- What it does: Sends an email to a user whose account was deleted by an administrator, after the transaction commits. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/AdminUserController.java:72-81,108-119`; `backend/src/main/java/com/unicodeacademy/backend/service/AccountTerminationEmailService.java:35-102`]
- Which user role uses it: Triggered by `ADMIN`; affects deleted users. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/AdminUserController.java:58-81`]
- Main frontend files involved: Indirectly `unicode-frontend/src/pages/AdminPage.tsx`
- Main backend files involved: `backend/src/main/java/com/unicodeacademy/backend/controller/AdminUserController.java`, `backend/src/main/java/com/unicodeacademy/backend/service/AccountTerminationEmailService.java`
- Any related database models/tables/collections: `users`; no email-outbox table is visible. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/User.java`; absence of mail entity under `backend/src/main/java/com/unicodeacademy/backend/model`]
- Notes about completeness or limitations: Implemented but environment-dependent on SMTP configuration. There is no general notification subsystem; this is a focused transactional email feature. [Evidence: `backend/src/main/resources/application.properties:29-41`; `backend/src/main/java/com/unicodeacademy/backend/service/AccountTerminationEmailService.java:22-50`]

# 3. User Roles and Permissions

- Persisted roles present in the system: `USER` and `ADMIN`, stored as an enum on `User.role`. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/User.java:14-19,34-36`]
- Additional access state: Anonymous/unauthenticated access exists in routing and HTTP security, but it is not a stored database role. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:46-58`; `unicode-frontend/src/App.tsx:31-47,97-127`]

## Anonymous / unauthenticated access

- Capabilities: Can reach `/login` and `/register` in the SPA, and can call public backend endpoints for auth, languages, avatars, and `GET` course/lesson content. [Evidence: `unicode-frontend/src/App.tsx:31-47`; `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:49-56`]
- Restrictions: Cannot access protected SPA pages, authenticated REST endpoints, admin endpoints, AI hints, chat actions, or protected downloads. STOMP `CONNECT`/`SEND`/`SUBSCRIBE` are rejected without a valid JWT in the interceptor. [Evidence: `unicode-frontend/src/App.tsx:109-159`; `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:50-58`; `backend/src/main/java/com/unicodeacademy/backend/security/JwtStompChannelInterceptor.java:35-72`]
- Where role logic appears in code: `SecurityConfig`, `App.tsx`, `JwtStompChannelInterceptor`. [Evidence: same files]
- Access-control pattern: Not RBAC in the persisted sense; this is anonymous-versus-authenticated gating in Spring Security and frontend route guards. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:46-58`; `unicode-frontend/src/App.tsx:101-127`]

## USER

- Capabilities: Access learning pages, lessons, exercises, progress summaries, profile/settings, avatar upload, chat, AI hints, code execution, leaderboard, course resources, and self-account deletion. [Evidence: `unicode-frontend/src/App.tsx:48-90`; `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:50-58`; `backend/src/main/java/com/unicodeacademy/backend/controller/UserController.java:52-178`]
- Restrictions: Cannot access `/api/admin/**` or the protected admin page. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:52-53`; `unicode-frontend/src/App.tsx:129-159`]
- Where role logic appears in code: `User.Role`, `CustomUserDetailsService`, `SecurityConfig`, `ProtectedAdmin`. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/User.java`; `backend/src/main/java/com/unicodeacademy/backend/security/CustomUserDetailsService.java:18-27`; `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:46-68`; `unicode-frontend/src/App.tsx:129-159`]
- Access-control pattern: Standard RBAC for admin/non-admin separation, with authenticated access for the rest. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:52-53`; `unicode-frontend/src/App.tsx:155-156`]

## ADMIN

- Capabilities: All learner capabilities plus user listing, role updates, user deletion, and course-attachment upload/delete. The frontend also exposes a dedicated admin control panel. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/AdminUserController.java:34-119`; `backend/src/main/java/com/unicodeacademy/backend/controller/AdminCourseAttachmentController.java:21-45`; `unicode-frontend/src/pages/AdminPage.tsx:231-520`]
- Restrictions: Admins still cannot delete themselves and the system protects against removing the last admin. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/AdminUserController.java:48-52,63-70`]
- Where role logic appears in code: `SecurityConfig` enforces backend admin routes; `ProtectedAdmin` rechecks role on the frontend; admin user mutation logic also parses allowed roles. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:52-53`; `unicode-frontend/src/App.tsx:129-159`; `backend/src/main/java/com/unicodeacademy/backend/controller/AdminUserController.java:84-95`]
- Access-control pattern: RBAC using the `ADMIN` role. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:52-53`; `backend/src/main/java/com/unicodeacademy/backend/model/User.java:14-19`]

# 4. Tech Stack

## Frontend

- Languages: TypeScript/TSX for application code, CSS for styling, HTML for the Vite entry document, JavaScript for build/tooling configuration, JSON for package manifests. [Evidence: `unicode-frontend/src`; `unicode-frontend/index.html`; `unicode-frontend/package.json`; `unicode-frontend/tailwind.config.js`; `unicode-frontend/postcss.config.js`; `unicode-frontend/eslint.config.js`]
- Framework: React `19.2.0` [Evidence: `unicode-frontend/package.json`; `unicode-frontend/src/main.tsx`]
- UI libraries: `lucide-react`, `react-hot-toast`, `react-markdown`, `remark-gfm`, CodeMirror packages, Google OAuth component, SockJS/STOMP client. [Evidence: `unicode-frontend/package.json`; `unicode-frontend/src/main.tsx`; `unicode-frontend/src/components/CodeEditor.tsx`; `unicode-frontend/src/pages/LoginPage.tsx`; `unicode-frontend/src/components/ChatWidget.tsx`]
- Routing: `react-router-dom` with `BrowserRouter`, route guards, nested shell routes, and an admin guard. [Evidence: `unicode-frontend/src/App.tsx:29-91`]
- State management: No Redux-style global store. The app uses React Query for server state, local component state for UI/forms, and browser `localStorage` for auth tokens and recent-lesson memory. [Evidence: `unicode-frontend/src/lib/queryClient.ts:4-11`; `unicode-frontend/src/lib/queryKeys.ts`; `unicode-frontend/src/auth/session.ts:1-29`; `unicode-frontend/src/utils/recentLessons.ts:6-54`]
- Form handling: Hand-rolled controlled forms with `useState`, `FormEvent`, and mutation/query invalidation; no dedicated form library is installed. [Evidence: `unicode-frontend/src/pages/LoginPage.tsx`; `unicode-frontend/src/pages/RegisterPage.tsx`; `unicode-frontend/src/pages/ParametresPage.tsx`; `unicode-frontend/package.json`]
- Styling: Tailwind is configured, but the dominant system is a large custom CSS design system with CSS variables, grids, badges, cards, typography tokens, and responsive media queries. [Evidence: `unicode-frontend/tailwind.config.js`; `unicode-frontend/src/styles/design-system.css`; `unicode-frontend/src/index.css`]
- API communication: Axios through a centralized `http` client, plus SockJS/STOMP for chat. [Evidence: `unicode-frontend/src/api/http.ts`; `unicode-frontend/src/api/chat.ts`; `unicode-frontend/src/components/ChatWidget.tsx`]
- Build tools: Vite, TypeScript, ESLint, PostCSS, Tailwind, npm. [Evidence: `unicode-frontend/package.json`; `unicode-frontend/vite.config.ts`; `unicode-frontend/tsconfig.json`; `unicode-frontend/postcss.config.js`; `unicode-frontend/eslint.config.js`]

## Backend

- Runtime: Java 17 [Evidence: `backend/pom.xml`]
- Framework: Spring Boot `3.5.10` [Evidence: `backend/pom.xml`]
- API style: REST for most features, plus STOMP-over-WebSocket for chat and notifications. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller`; `backend/src/main/java/com/unicodeacademy/backend/config/WebSocketConfig.java:16-44`]
- Middleware / platform services: Spring Security filter chain, JWT filter, auth rate-limit filter, CORS configuration, WebSocket inbound interceptor, `@RestControllerAdvice` global exception handling. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:37-87`; `backend/src/main/java/com/unicodeacademy/backend/security/JwtAuthFilter.java:29-66`; `backend/src/main/java/com/unicodeacademy/backend/security/AuthRateLimitFilter.java:20-57`; `backend/src/main/java/com/unicodeacademy/backend/controller/GlobalExceptionHandler.java:19-117`; `backend/src/main/java/com/unicodeacademy/backend/security/JwtStompChannelInterceptor.java:28-75`]
- Auth libraries: Spring Security, JJWT, Google API Client, BCrypt password encoding. [Evidence: `backend/pom.xml`; `backend/src/main/java/com/unicodeacademy/backend/security/AppConfig.java:11-13`; `backend/src/main/java/com/unicodeacademy/backend/service/AuthService.java`]
- Validation: `spring-boot-starter-validation` plus `@Valid` on auth/code-run requests, bean-validation annotations on selected DTOs, and additional manual validation inside controllers/services. [Evidence: `backend/pom.xml`; `backend/src/main/java/com/unicodeacademy/backend/controller/AuthController.java`; `backend/src/main/java/com/unicodeacademy/backend/controller/CodeExecutionController.java`; `backend/src/main/java/com/unicodeacademy/backend/dto/RegisterRequest.java:8-22`; `backend/src/main/java/com/unicodeacademy/backend/dto/LoginRequest.java:6-12`; `backend/src/main/java/com/unicodeacademy/backend/controller/UserController.java:75-110`; `backend/src/main/java/com/unicodeacademy/backend/controller/ExerciseAttemptController.java:56-80`]
- File upload handling: Spring Multipart with application-level size limits and feature-specific file checks for avatars/course attachments/chat attachments. [Evidence: `backend/src/main/resources/application.properties:26-27`; `backend/src/main/java/com/unicodeacademy/backend/controller/UserController.java:96-132`; `backend/src/main/java/com/unicodeacademy/backend/service/CourseAttachmentService.java:44-76`; `backend/src/main/java/com/unicodeacademy/backend/controller/ChatRestController.java:54-85`]
- Other notable packages: Spring Mail, Spring WebSocket, Lombok, H2 for tests, JaCoCo, PostgreSQL JDBC. [Evidence: `backend/pom.xml`]

## Database / Persistence

- Database type: PostgreSQL is the main runtime target; H2 in-memory is used in tests. [Evidence: `backend/pom.xml`; `backend/src/main/resources/application.properties:5-12`; `backend/src/test/resources/application-test.properties:1-8`]
- ORM/ODM: Spring Data JPA with Hibernate. [Evidence: `backend/pom.xml`; `backend/src/main/java/com/unicodeacademy/backend/model`; `backend/src/main/java/com/unicodeacademy/backend/repository`]
- Schema/model approach: Annotation-based entity classes with repository interfaces, `ddl-auto=update`, SQL seed data, plus runtime schema compatibility/backfill runners. [Evidence: `backend/src/main/resources/application.properties:9-12`; `backend/src/main/resources/data.sql`; `backend/src/main/java/com/unicodeacademy/backend/config/SchemaCompatibilityInitializer.java:22-68`; `backend/src/main/java/com/unicodeacademy/backend/config/LessonStarterCodeBackfill.java:61-99`]
- Migrations or seeders: No Flyway/Liquibase migration tool was found. Seed data comes from `data.sql`, `DataSeeder`, and `AdminSeederConfig`; compatibility/backfill logic exists in `SchemaCompatibilityInitializer` and `LessonStarterCodeBackfill`. [Evidence: `backend/src/main/resources/data.sql`; `backend/src/main/java/com/unicodeacademy/backend/config/DataSeeder.java:16-62`; `backend/src/main/java/com/unicodeacademy/backend/config/AdminSeederConfig.java:20-47`; absence of Flyway/Liquibase dependency in `backend/pom.xml`]

## DevOps / Tooling

- Package manager: npm for frontend; Maven/Maven Wrapper for backend. [Evidence: `unicode-frontend/package.json`; `unicode-frontend/package-lock.json`; `backend/pom.xml`; `backend/mvnw`; `backend/mvnw.cmd`]
- Environment config: Root `.env.example` documents backend and frontend env vars for DB, JWT, Google OAuth, SMTP, chat retention, Anthropic, and code execution; frontend also has its own `.env.example`. [Evidence: `.env.example`; `unicode-frontend/.env.example`; `backend/src/main/resources/application.properties:5-48`]
- Deployment clues: The app is heavily env-driven, but no Dockerfile, container manifest, or cloud deployment descriptor is visible. Deployment target is therefore **Not clearly identifiable from the codebase**. [Evidence: `.env.example`; `backend/src/main/resources/application.properties`; absence of Docker/Kubernetes manifests in repo root]
- Version-control / automation clues: GitHub Actions CI runs backend tests and frontend build; Dependabot updates Maven and npm weekly. [Evidence: `.github/workflows/ci.yml`; `.github/dependabot.yml`]
- Scripts: Frontend defines `dev`, `build`, `lint`, and `preview`. Backend relies on Maven lifecycle goals rather than a custom script file. [Evidence: `unicode-frontend/package.json`; `.github/workflows/ci.yml`]
- Verification notes from this audit on 2026-04-16: frontend production build passed with a Vite large-chunk warning; backend tests passed via `mvn -Dmaven.repo.local=.m2/repository test` with `45` tests; `mvnw.cmd` proved unreliable in this PowerShell environment and should be treated as an environment note rather than a product feature. [Evidence: local verification performed during this audit; `.github/workflows/ci.yml` shows the intended CI equivalents]

# 5. Programming Languages Used

- Java: Used for the backend API, services, repositories, configuration, security, DTOs, and backend tests. It implements all server-side business logic. [Evidence: `backend/src/main/java`; `backend/src/test/java`]
- TypeScript / TSX: Used across the React frontend for pages, components, API clients, auth helpers, and utility layers. It defines the full SPA behavior. [Evidence: `unicode-frontend/src`]
- JavaScript: Used for frontend/build configuration files such as Tailwind, PostCSS, and ESLint. [Evidence: `unicode-frontend/tailwind.config.js`; `unicode-frontend/postcss.config.js`; `unicode-frontend/eslint.config.js`]
- HTML: Used in `unicode-frontend/index.html`, in lesson content for HTML/CSS learning, and in generated email markup. [Evidence: `unicode-frontend/index.html`; `backend/src/main/resources/data.sql`; `backend/src/main/java/com/unicodeacademy/backend/service/AccountTerminationEmailService.java:57-85`]
- CSS: Used in the design system and global styles, and also as a subject matter in seeded lessons and the web playground. [Evidence: `unicode-frontend/src/styles/design-system.css`; `unicode-frontend/src/index.css`; `backend/src/main/resources/data.sql`]
- SQL: Used in `data.sql`, native SQL queries for leaderboard/schema compatibility, and the SQL code-execution mode. [Evidence: `backend/src/main/resources/data.sql`; `backend/src/main/java/com/unicodeacademy/backend/repository/UserRepository.java:29-77`; `backend/src/main/java/com/unicodeacademy/backend/config/SchemaCompatibilityInitializer.java:41-50`; `backend/src/main/java/com/unicodeacademy/backend/service/CodeExecutionService.java:45-49,94,363-386,520-541`]
- XML: Used in Maven configuration and IDE-related metadata such as `.factorypath`. [Evidence: `backend/pom.xml`; `backend/.factorypath`]
- JSON: Used in `package.json`/lockfiles and implicitly in API payloads. [Evidence: `unicode-frontend/package.json`; `backend/package.json`; `unicode-frontend/package-lock.json`; `backend/package-lock.json`; frontend/backend API client and controller DTO files]
- YAML: Used for GitHub Actions and Dependabot automation. [Evidence: `.github/workflows/ci.yml`; `.github/dependabot.yml`]
- Markdown: Used in repository documentation and lesson rendering strategy. Lesson content is rendered with `react-markdown`, indicating Markdown-compatible lesson bodies. [Evidence: `README.md`; `SECURITY.md`; `backend/HELP.md`; `docs/unicode-academy-audit-and-sprint-reconstruction.md`; `unicode-frontend/src/pages/LeconPage.tsx:4-5,715-759`]
- Properties format: Used for Spring Boot runtime/test configuration. [Evidence: `backend/src/main/resources/application.properties`; `backend/src/main/resources/application-dev.properties.example`; `backend/src/test/resources/application-test.properties`]
- SVG: Present as a frontend static asset. [Evidence: `unicode-frontend/public/vite.svg`]

# 6. Project Structure

```text
unicode/
├─ backend/
│  ├─ src/main/java/com/unicodeacademy/backend/
│  │  ├─ config/
│  │  ├─ controller/
│  │  ├─ dto/
│  │  ├─ model/
│  │  ├─ repository/
│  │  ├─ security/
│  │  ├─ service/
│  │  └─ util/
│  ├─ src/main/resources/
│  │  ├─ application.properties
│  │  ├─ application-dev.properties.example
│  │  └─ data.sql
│  ├─ src/test/
│  ├─ pom.xml
│  ├─ mvnw
│  └─ mvnw.cmd
├─ unicode-frontend/
│  ├─ public/
│  ├─ src/
│  │  ├─ api/
│  │  ├─ auth/
│  │  ├─ components/
│  │  ├─ lib/
│  │  ├─ pages/
│  │  ├─ styles/
│  │  ├─ utils/
│  │  └─ main.tsx / App.tsx
│  ├─ package.json
│  ├─ vite.config.ts
│  ├─ tailwind.config.js
│  └─ tsconfig*.json
├─ docs/
├─ .github/
├─ .env.example
├─ README.md
└─ SECURITY.md
```

- `backend/`: Java/Spring Boot backend root. This is the source of truth for the API, security, persistence, business rules, and scheduled/background behaviors. [Evidence: `backend/pom.xml`; `backend/src/main/java/com/unicodeacademy/backend`]
- `backend/src/main/java/com/unicodeacademy/backend/controller/`: HTTP and WebSocket entry points, plus global exception handling. [Evidence: folder contents under `backend/src/main/java/com/unicodeacademy/backend/controller`]
- `backend/src/main/java/com/unicodeacademy/backend/service/`: Core business logic such as auth, code execution, chat, attachments, and email sending. [Evidence: folder contents under `backend/src/main/java/com/unicodeacademy/backend/service`]
- `backend/src/main/java/com/unicodeacademy/backend/model/`: JPA entities defining persisted business data. [Evidence: folder contents under `backend/src/main/java/com/unicodeacademy/backend/model`]
- `backend/src/main/java/com/unicodeacademy/backend/repository/`: Spring Data repositories plus custom JPQL/native SQL queries. [Evidence: folder contents under `backend/src/main/java/com/unicodeacademy/backend/repository`]
- `backend/src/main/java/com/unicodeacademy/backend/security/`: JWT issuance/validation, user-details loading, access control, and rate limiting. [Evidence: folder contents under `backend/src/main/java/com/unicodeacademy/backend/security`]
- `backend/src/main/java/com/unicodeacademy/backend/config/`: Startup seeders, schema compatibility helpers, scheduler, and WebSocket config. [Evidence: folder contents under `backend/src/main/java/com/unicodeacademy/backend/config`]
- `backend/src/main/java/com/unicodeacademy/backend/util/`: Utility layer, currently notable for text-encoding cleanup. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/util/TextEncodingFixer.java`]
- `backend/src/main/resources/`: Spring configuration and seed SQL. [Evidence: `backend/src/main/resources/application.properties`; `backend/src/main/resources/data.sql`]
- `backend/src/test/`: Backend automated tests, including auth, security, controller MVC tests, repository smoke tests, lesson-progress tests, and encoding-fix tests. [Evidence: `backend/src/test/java`; `backend/src/test/resources/application-test.properties`]
- `unicode-frontend/`: React SPA root. [Evidence: `unicode-frontend/package.json`; `unicode-frontend/src`]
- `unicode-frontend/src/api/`: Thin data-access layer over Axios and WebSocket endpoint resolution. [Evidence: folder contents under `unicode-frontend/src/api`]
- `unicode-frontend/src/auth/`: Session/token helpers and authenticated-session lifecycle. [Evidence: `unicode-frontend/src/auth/session.ts`; `unicode-frontend/src/auth/authState.ts`]
- `unicode-frontend/src/pages/`: Route-level pages such as home, learning path, lesson, exercises, profile, settings, chat, ranking, auth pages, and admin. [Evidence: folder contents under `unicode-frontend/src/pages`]
- `unicode-frontend/src/components/`: Reusable UI components and large composites such as `AppShell`, `CoursePathView`, `ChatWidget`, `CodeEditor`, `AiAssistant`, and `PratiqueInline`. [Evidence: folder contents under `unicode-frontend/src/components`]
- `unicode-frontend/src/lib/`: Query-client setup, query keys, and academy-specific route/progress helper logic. [Evidence: `unicode-frontend/src/lib/queryClient.ts`; `unicode-frontend/src/lib/queryKeys.ts`; `unicode-frontend/src/lib/academy.ts`]
- `unicode-frontend/src/styles/`: Custom design system CSS. [Evidence: `unicode-frontend/src/styles/design-system.css`]
- `unicode-frontend/src/utils/`: Small utility modules for formatting, visuals, IDs, error messaging, playground behavior, and recent-lesson persistence. [Evidence: folder contents under `unicode-frontend/src/utils`]
- `docs/`: Project-level documentation. The existing audit doc is secondary context, not the primary truth source. [Evidence: `docs/unicode-academy-audit-and-sprint-reconstruction.md`]
- `.github/`: CI and dependency-update automation. [Evidence: `.github/workflows/ci.yml`; `.github/dependabot.yml`]
- Shared code: No dedicated shared package/library between frontend and backend was identified. API contracts are duplicated across backend DTOs and frontend TypeScript types. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/dto`; `unicode-frontend/src/api`; absence of a `shared/` or common package]
- Runtime/generated artifacts: `backend/tmp-pg-data`, logs, and build outputs exist in the repository but should not be treated as feature evidence. [Evidence: repo inventory from this audit]

# 7. Frontend Architecture

- Application structure: The SPA boots in `main.tsx`, wires `QueryClientProvider`, `Toaster`, and an optional `GoogleOAuthProvider`, then hands control to `App.tsx` for route definition. [Evidence: `unicode-frontend/src/main.tsx:11-43`; `unicode-frontend/src/App.tsx:27-95`]
- Page organization: Route-level screens are concentrated in `src/pages`, while reusable or cross-page components live in `src/components`. This is a conventional page/component split rather than a feature-folder monorepo layout. [Evidence: repo structure under `unicode-frontend/src/pages` and `unicode-frontend/src/components`]
- Component strategy: Large workflow pages compose smaller reusable pieces. Examples: `LeconPage` composes `CodeEditor`, `PratiqueInline`, and `AiAssistant`; `AppShell` wraps most authenticated pages; `ChatWidget` is reusable both on `/chat` and as a floating shell widget. [Evidence: `unicode-frontend/src/pages/LeconPage.tsx`; `unicode-frontend/src/components/AppShell.tsx`; `unicode-frontend/src/components/ChatWidget.tsx`]
- Routing strategy: Three access modes exist. `PublicOnly` protects `/login` and `/register` from authenticated users; `ProtectedShell` wraps dashboard-style pages inside `AppShell`; `ProtectedFullscreen` secures immersive lesson/exercise pages without the shell; `ProtectedAdmin` adds a role check on top. [Evidence: `unicode-frontend/src/App.tsx:31-91,101-159`]
- State and data flow: Server state is fetched via React Query with centralized query keys and modest caching defaults (`staleTime` 5 minutes, `gcTime` 10 minutes, retry once, no refetch-on-focus). Local UI state uses `useState`; auth state uses browser storage; recent lesson resume state is also browser-local. [Evidence: `unicode-frontend/src/lib/queryClient.ts:4-11`; `unicode-frontend/src/lib/queryKeys.ts`; `unicode-frontend/src/auth/session.ts:1-29`; `unicode-frontend/src/utils/recentLessons.ts:6-54`]
- API integration pattern: Each domain has a small `api/*.ts` wrapper. Those wrappers call a shared Axios client that injects bearer tokens, retries requests after refresh, and clears the session on refresh failure. [Evidence: `unicode-frontend/src/api/http.ts:7-97`; `unicode-frontend/src/api/auth.ts`; `unicode-frontend/src/api/users.ts`; `unicode-frontend/src/api/courses.ts`; `unicode-frontend/src/api/progress.ts`]
- Form handling approach: The frontend uses controlled inputs and explicit submit handlers. Validation is partly inline in the UI, such as password confirmation/strength and required fields. There is no visible schema-based client form layer such as React Hook Form or Zod. [Evidence: `unicode-frontend/src/pages/LoginPage.tsx`; `unicode-frontend/src/pages/RegisterPage.tsx`; `unicode-frontend/src/pages/ParametresPage.tsx`; `unicode-frontend/package.json`]
- Authentication handling: Tokens are written to `localStorage` under `token` and `refreshToken`. Starting or ending an authenticated session also clears the React Query cache. [Evidence: `unicode-frontend/src/auth/session.ts:1-29`; `unicode-frontend/src/auth/authState.ts:4-11`]
- Guards / protected routes: Frontend protection is simple and explicit. It first checks token presence, then for `/admin` it fetches the current user and verifies `role === "ADMIN"`. [Evidence: `unicode-frontend/src/App.tsx:109-159`]
- Reusability patterns: `lib/academy.ts` centralizes route construction, streak computation, lesson-state resolution, and unit building. Query keys are centralized in `lib/queryKeys.ts`, and error formatting is centralized in `utils/errorMessage.ts`. [Evidence: `unicode-frontend/src/lib/academy.ts`; `unicode-frontend/src/lib/queryKeys.ts`; `unicode-frontend/src/utils/errorMessage.ts`]
- Styling system: The UI is not generic Bootstrap/Tailwind utility output. It defines a branded design system with teal/indigo accents, custom typography tokens (`Manrope`, `Space Grotesk`, `IBM Plex Mono`), badges, cards, shell layout, and many responsive grid rules. [Evidence: `unicode-frontend/src/styles/design-system.css:1-37,120-178,4721-4983`]
- Responsiveness clues: The design system contains several breakpoint-specific media queries at `1180px`, `980px`, `960px`, `720px`, and `560px`, plus many `minmax`, `clamp`, and width-constrained responsive rules. This strongly suggests intentional desktop/mobile adaptation. [Evidence: `unicode-frontend/src/styles/design-system.css:1174,1278,1365,1664,2068,2144,2304,2640,3471,4721-4983`]
- Dashboard/admin architecture: `AppShell` provides authenticated navigation, resume card, account menu, and floating chat. Admin is a route-specific management surface rather than a separate SPA. [Evidence: `unicode-frontend/src/components/AppShell.tsx:344-446,534`; `unicode-frontend/src/pages/AdminPage.tsx:236-520`]

Important pages/components:

- `AccueilPage`: Learner dashboard with progress cards, streak, recent activity, and recommended next steps. [Evidence: `unicode-frontend/src/pages/AccueilPage.tsx:61-168,193-256`]
- `CoursePathView`: Core course-path component showing lessons, units, attachments, and chat entry. [Evidence: `unicode-frontend/src/components/CoursePathView.tsx:89-90,193-248,274-311`]
- `LeconPage`: Lesson reader/practice page with Markdown content, code runner, and AI assistant. [Evidence: `unicode-frontend/src/pages/LeconPage.tsx:468-637,715-759,942-952`]
- `ExercicesPage`: Exercise-series page with submission flow, cache invalidation, AI assistant, and success celebration. [Evidence: `unicode-frontend/src/pages/ExercicesPage.tsx:346-376,583-674`]
- `ChatWidget`: Real-time chat UI used as both a full page and a floating widget. [Evidence: `unicode-frontend/src/components/ChatWidget.tsx:108-213,242-401`]
- `ProfilPage`: Profile analytics plus avatar update. [Evidence: `unicode-frontend/src/pages/ProfilPage.tsx:147-168,280-390`]
- `ParametresPage`: Preferred language, password change, logout, and account deletion. [Evidence: `unicode-frontend/src/pages/ParametresPage.tsx:56-140,271-360`]
- `AdminPage`: User management, read-only course list, and attachment management. [Evidence: `unicode-frontend/src/pages/AdminPage.tsx:231-520`]

# 8. Backend Architecture

- Server structure: The backend is organized into `controller`, `service`, `repository`, `model`, `dto`, `security`, `config`, and `util` packages, which is a classical layered Spring application. [Evidence: `backend/src/main/java/com/unicodeacademy/backend`]
- Module/layer organization: Controllers expose endpoints; services contain major business logic for auth/chat/code execution/attachments/progress rules; repositories encapsulate queries; models represent persisted entities; DTOs shape API contracts. [Evidence: package structure plus `backend/src/main/java/com/unicodeacademy/backend/controller`, `service`, `repository`, `model`, `dto`]
- Controllers/services/routes/models pattern: Present, but not perfectly strict. Some domains follow the controller-service-repository pattern cleanly (`AuthService`, `CourseAttachmentService`, `ChatMessageService`, `LessonProgressService`), while others place business logic directly in controllers (`ExerciseAttemptController`, `ProgressController`, `StatsController`, parts of `UserController`). [Evidence: `backend/src/main/java/com/unicodeacademy/backend/service/AuthService.java`; `backend/src/main/java/com/unicodeacademy/backend/service/CourseAttachmentService.java`; `backend/src/main/java/com/unicodeacademy/backend/service/ChatMessageService.java`; `backend/src/main/java/com/unicodeacademy/backend/service/LessonProgressService.java`; `backend/src/main/java/com/unicodeacademy/backend/controller/ExerciseAttemptController.java`; `backend/src/main/java/com/unicodeacademy/backend/controller/ProgressController.java`; `backend/src/main/java/com/unicodeacademy/backend/controller/StatsController.java`; `backend/src/main/java/com/unicodeacademy/backend/controller/UserController.java`]
- Request lifecycle: A typical authenticated HTTP request passes through `SecurityFilterChain`, may be limited by `AuthRateLimitFilter` if it targets login/google auth, is decoded by `JwtAuthFilter`, reaches the controller, then controller/service code loads entities through repositories and returns DTOs or entity-derived responses. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:37-68`; `backend/src/main/java/com/unicodeacademy/backend/security/AuthRateLimitFilter.java:27-57`; `backend/src/main/java/com/unicodeacademy/backend/security/JwtAuthFilter.java:29-66`]
- API endpoint organization: Endpoints are grouped by domain under intuitive prefixes such as `/api/auth`, `/api/courses`, `/api/lessons`, `/api/exercises`, `/api/progress`, `/api/users`, `/api/chat`, `/api/leaderboard`, `/api/admin`, `/api/ai`, and `/api/code`. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller` endpoint mappings]
- Middleware usage: Security uses stateless auth, CORS, and a login rate limiter; WebSocket messaging uses a JWT channel interceptor; error handling is centralized in `GlobalExceptionHandler`. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java`; `backend/src/main/java/com/unicodeacademy/backend/security/AuthRateLimitFilter.java`; `backend/src/main/java/com/unicodeacademy/backend/security/JwtStompChannelInterceptor.java`; `backend/src/main/java/com/unicodeacademy/backend/controller/GlobalExceptionHandler.java`]
- Authentication and authorization flow: Registration and login create JWT access/refresh tokens; access tokens are validated on each request; admin routes are role-protected; WebSocket `CONNECT` also validates JWT. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/service/AuthService.java:56-132`; `backend/src/main/java/com/unicodeacademy/backend/security/JwtService.java:51-101`; `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:46-58`; `backend/src/main/java/com/unicodeacademy/backend/security/JwtStompChannelInterceptor.java:35-72`]
- Validation: DTO-level bean validation is used on selected inputs (`RegisterRequest`, `LoginRequest`, `GoogleAuthRequest`, `RefreshTokenRequest`, `CodeRunRequest`), while many business validations are still manual inside controllers/services. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/AuthController.java`; `backend/src/main/java/com/unicodeacademy/backend/controller/CodeExecutionController.java`; `backend/src/main/java/com/unicodeacademy/backend/dto/RegisterRequest.java`; `backend/src/main/java/com/unicodeacademy/backend/dto/LoginRequest.java`; `backend/src/main/java/com/unicodeacademy/backend/dto/GoogleAuthRequest.java`; `backend/src/main/java/com/unicodeacademy/backend/dto/RefreshTokenRequest.java`; `backend/src/main/java/com/unicodeacademy/backend/dto/CodeRunRequest.java`]
- Error handling: `GlobalExceptionHandler` maps validation/body/response-status/runtime exceptions to structured responses; AI hint routes are special-cased to degrade to fallback responses instead of returning hard failures. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/GlobalExceptionHandler.java:19-117`]
- Business logic placement: High-value business logic lives in `AuthService`, `LessonProgressService`, `CodeExecutionService`, `ChatMessageService`, and `CourseAttachmentService`. The heaviest custom backend subsystem is the code runner. [Evidence: those service files]
- File upload/storage logic: Avatars, course attachments, and chat attachments are stored on local disk under `uploads/...` directories, with feature-specific metadata in the database for course attachments and chat messages. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/UserController.java:42-44,96-165`; `backend/src/main/java/com/unicodeacademy/backend/service/CourseAttachmentService.java:30-31,81-89`; `backend/src/main/java/com/unicodeacademy/backend/controller/ChatRestController.java:42-43,79-109`; `backend/src/main/java/com/unicodeacademy/backend/model/CourseAttachment.java`; `backend/src/main/java/com/unicodeacademy/backend/model/ChatMessage.java`]
- Security measures visible in code: Password hashing, typed JWTs, role checks, rate limiting on login, CORS config, upload size/type checks in some domains, path normalization, and auth enforcement on WebSocket messages. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/AppConfig.java:11-13`; `backend/src/main/java/com/unicodeacademy/backend/security/JwtService.java:35-105`; `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:46-87`; `backend/src/main/java/com/unicodeacademy/backend/security/AuthRateLimitFilter.java:20-57`; `backend/src/main/java/com/unicodeacademy/backend/controller/UserController.java:96-165`; `backend/src/main/java/com/unicodeacademy/backend/service/CourseAttachmentService.java:44-145`; `backend/src/main/java/com/unicodeacademy/backend/security/JwtStompChannelInterceptor.java:35-72`]
- Background jobs / schedulers / email systems: Chat retention cleanup runs on startup and on a cron schedule; admin-triggered account termination emails are supported via SMTP when configured. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/config/ChatRetentionScheduler.java:15-23`; `backend/src/main/resources/application.properties:29-43`; `backend/src/main/java/com/unicodeacademy/backend/service/AccountTerminationEmailService.java:35-102`]
- Schema compatibility / legacy handling: The backend actively compensates for evolving schema/content via startup column creation, large-object recovery, starter-code backfill, controller/repository fallback queries, and text-encoding fixes. This is unusual but clearly intentional. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/config/SchemaCompatibilityInitializer.java:22-68`; `backend/src/main/java/com/unicodeacademy/backend/config/LessonStarterCodeBackfill.java:61-99`; `backend/src/main/java/com/unicodeacademy/backend/controller/CourseController.java:63-77`; `backend/src/main/java/com/unicodeacademy/backend/controller/LessonController.java:46-58`; `backend/src/main/java/com/unicodeacademy/backend/util/TextEncodingFixer.java`]

# 9. Database Design

- Primary persistence model: A relational schema centered on users, languages, courses, lessons, exercises, progress records, attachments, and chat messages. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model`]

## Entities / tables and their purpose

- `users`: Stores identity, email, hashed password, role, avatar URL, creation date, and preferred language. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/User.java:24-46`]
- `programming_languages`: Stores catalog languages (`code`, `name`). [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/ProgrammingLanguage.java:11-19`]
- `courses`: Stores course code, title, description, and language reference. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/Course.java:19-32`]
- `lessons`: Stores lesson title, content, starter code, editor language, execution type, sample output, order index, and owning course. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/Lesson.java:19-44`]
- `exercises`: Stores exercise type, question, `choicesJson`, answer, explanation, order index, and owning lesson. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/Exercise.java:21-44`]
- `user_course_progress`: Stores explicit per-user per-course completion state and completion timestamp. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/UserCourseProgress.java:24-39`]
- `user_lesson_progress`: Stores per-user per-lesson state (`IN_PROGRESS`, `COMPLETED`) and timestamp, with a uniqueness constraint on `(user_id, lesson_id)`. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/UserLessonProgress.java:9-42`]
- `user_exercise_attempts`: Stores submitted answers, correctness, and attempt timestamp for each user/exercise pair instance. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/UserExerciseAttempt.java:18-35`]
- `course_attachments`: Stores course-linked resource metadata (original name, stored file name, content type, size, upload time). [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/CourseAttachment.java:21-40`]
- `chat_messages`: Stores denormalized chat history, including sender identity, optional attachment URL/name, room type, optional course ID, and timestamp. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/ChatMessage.java:24-46`]

## Relationships

- `ProgrammingLanguage 1 -> many Course` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/Course.java:30-32`]
- `Course 1 -> many Lesson` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/Course.java:34-36`; `backend/src/main/java/com/unicodeacademy/backend/model/Lesson.java:42-44`]
- `Lesson 1 -> many Exercise` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/Lesson.java:46-48`; `backend/src/main/java/com/unicodeacademy/backend/model/Exercise.java:42-44`]
- `User many -> 1 preferred ProgrammingLanguage` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/User.java:44-46`]
- `User many -> many Course` through `UserCourseProgress` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/UserCourseProgress.java:26-32`]
- `User many -> many Lesson` through `UserLessonProgress` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/UserLessonProgress.java:29-35`]
- `User many -> many Exercise` through `UserExerciseAttempt` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/UserExerciseAttempt.java:20-26`]
- `Course 1 -> many CourseAttachment` [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/CourseAttachment.java:23-25`]
- `ChatMessage` is more denormalized: it stores `userId`, `username`, `senderEmail`, and `courseId` as scalars rather than JPA relations. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/ChatMessage.java:24-46`]

## Textual ER-style explanation

- A language contains multiple courses.
- A course contains ordered lessons.
- A lesson contains ordered exercises.
- A user can prefer one language.
- A user can accumulate progress across many lessons and many courses.
- A user can make many exercise attempts.
- A course can have many resource attachments.
- Chat messages belong either to the global room or to a course-scoped room.

## Data flow through the app

- Curriculum data starts from `programming_languages`, `courses`, `lessons`, and `exercises`, most of which are seeded from `data.sql`. [Evidence: `backend/src/main/resources/data.sql:1-22,25,4415`]
- When a learner opens a course path, the frontend loads courses, lesson summaries, attachments, and aggregated progress. [Evidence: `unicode-frontend/src/components/CoursePathView.tsx`; `unicode-frontend/src/api/courses.ts`; `unicode-frontend/src/api/progress.ts`; `unicode-frontend/src/api/attachments.ts`]
- When a learner completes lessons or submits exercises, rows are written to `user_lesson_progress` and `user_exercise_attempts`, and progress totals are recomputed from those records. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/service/LessonProgressService.java:28-151`; `backend/src/main/java/com/unicodeacademy/backend/controller/ExerciseAttemptController.java:82-93`; `backend/src/main/java/com/unicodeacademy/backend/controller/ProgressController.java:54-99`]
- Course completion can also be stored explicitly in `user_course_progress`, though the current SPA primarily consumes derived summary data instead. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/ProgressController.java:42-125`; `unicode-frontend/src/api/progress.ts:17-24`]
- Course attachments and avatars are split between metadata in the database and binary files on disk. Chat attachments follow the same disk-storage pattern, with metadata embedded in chat messages. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/CourseAttachment.java`; `backend/src/main/java/com/unicodeacademy/backend/model/ChatMessage.java`; `backend/src/main/java/com/unicodeacademy/backend/controller/UserController.java:96-165`; `backend/src/main/java/com/unicodeacademy/backend/controller/ChatRestController.java:54-109`]

## Example lifecycle of a typical record

- Exercise-attempt lifecycle:
  - The frontend loads lesson exercises. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/LessonController.java:39-67`; `unicode-frontend/src/pages/ExercicesPage.tsx`]
  - The learner submits an answer to `/api/exercises/{id}/attempt`. [Evidence: `unicode-frontend/src/pages/ExercicesPage.tsx:346`; `backend/src/main/java/com/unicodeacademy/backend/controller/ExerciseAttemptController.java:47-100`]
  - The backend normalizes/validates the answer, computes correctness, persists a `UserExerciseAttempt`, and returns explanation/correct answer. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/ExerciseAttemptController.java:56-93`]
  - The frontend invalidates progress/lesson queries and updates the UI. [Evidence: `unicode-frontend/src/pages/ExercicesPage.tsx:374-376`]

## Normalization / document-structure patterns

- Core curriculum and progress data are normalized relational entities. [Evidence: model package]
- Chat is semi-denormalized for convenience and resilience, storing sender/course scalars directly on each message. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/ChatMessage.java:24-46`]
- Some lesson detail fields (`starterCode`, `sampleOutput`) have compatibility/backfill logic, suggesting schema evolution over time rather than a perfectly stable first-version schema. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/config/SchemaCompatibilityInitializer.java:28-68`; `backend/src/main/java/com/unicodeacademy/backend/config/LessonStarterCodeBackfill.java:71-99`]

# 10. API and Communication Flow

- Request flow: The frontend calls REST endpoints through Axios wrappers. The shared HTTP client adds the bearer token from `localStorage`. On `401`, it posts the refresh token to `/api/auth/refresh`, stores the new access token, and retries the original request. [Evidence: `unicode-frontend/src/api/http.ts:28-97`; `unicode-frontend/src/auth/session.ts:1-29`; `backend/src/main/java/com/unicodeacademy/backend/controller/AuthController.java:42-43`]
- Authentication flow:
  - Register/login/google login return `token` and `refreshToken`. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/service/AuthService.java:56-132`; `unicode-frontend/src/api/auth.ts:14-49`]
  - Frontend writes those values to `localStorage`. [Evidence: `unicode-frontend/src/auth/session.ts:12-17`]
  - Subsequent HTTP requests send `Authorization: Bearer <token>`. [Evidence: `unicode-frontend/src/api/http.ts:62-68`]
  - Backend validates the JWT, loads the user, and injects authentication into the security context. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/JwtAuthFilter.java:33-59`; `backend/src/main/java/com/unicodeacademy/backend/security/CustomUserDetailsService.java:18-27`]
- Token/session handling: This is a stateless token model, not a server-side HTTP session model. Refresh-token validity is signature/type/expiry based; no persisted token store or revocation registry is visible. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:39-45`; `backend/src/main/java/com/unicodeacademy/backend/security/JwtService.java:63-101`; `backend/src/main/java/com/unicodeacademy/backend/service/AuthService.java:109-126`]
- Endpoint organization: REST endpoints are domain-grouped and largely conventional, though there are a few compatibility/inconsistency traces such as both `/lessons/{id}/complete` and `/lesson/{id}/complete`. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/LessonProgressController.java:45-65`]
- Payload patterns: The backend uses DTOs for major auth, progress, lesson, exercise, stats, leaderboard, attachment, AI-hint, and code-run responses. The frontend mirrors those shapes with TypeScript types inside `api/*.ts`. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/dto`; `unicode-frontend/src/api`]
- Error/response conventions: Most endpoints return JSON or empty success bodies. Validation/runtime exceptions are normalized centrally; AI endpoints uniquely degrade to hint fallbacks instead of propagating many errors. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/GlobalExceptionHandler.java:19-117`]

Typical communication flows:

- Login flow:
  - `LoginPage` submits email/password to `/api/auth/login`. [Evidence: `unicode-frontend/src/pages/LoginPage.tsx:41-46`; `unicode-frontend/src/api/auth.ts:27-30`]
  - `AuthService.login` validates credentials and issues JWTs. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/service/AuthService.java:73-82,129-132`]
  - Frontend stores tokens and redirects into protected routes. [Evidence: `unicode-frontend/src/auth/authState.ts:4-11`; `unicode-frontend/src/App.tsx:97-118`]

- Google login flow:
  - `LoginPage` shows Google login only when `VITE_GOOGLE_CLIENT_ID` exists. [Evidence: `unicode-frontend/src/pages/LoginPage.tsx:24,205-228`]
  - Backend verifies the Google ID token and creates a local user if needed. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/service/AuthService.java:84-106,135-160`]

- Course access flow:
  - Frontend loads courses, summaries, lesson progress, and attachments. [Evidence: `unicode-frontend/src/components/CoursePathView.tsx`; `unicode-frontend/src/api/courses.ts`; `unicode-frontend/src/api/progress.ts`; `unicode-frontend/src/api/attachments.ts`]
  - Backend serves courses/lessons through `CourseController` and `LessonController`, using compatibility fallbacks when lesson columns are missing. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/CourseController.java:57-93`; `backend/src/main/java/com/unicodeacademy/backend/controller/LessonController.java:39-58`]

- Quiz/exercise submission flow:
  - `ExercicesPage` posts to `/api/exercises/{id}/attempt`. [Evidence: `unicode-frontend/src/pages/ExercicesPage.tsx:346`]
  - Backend validates the answer, saves an attempt, and returns correctness/explanation. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/ExerciseAttemptController.java:47-93`]
  - Frontend invalidates progress-related queries. [Evidence: `unicode-frontend/src/pages/ExercicesPage.tsx:374-376`]

- Lesson completion flow:
  - `LeconPage` calls lesson-completion APIs after practice/reading flow. [Evidence: `unicode-frontend/src/pages/LeconPage.tsx:637-645`]
  - `LessonProgressService` checks previous lesson completion and minimum attempted exercises, then writes progress. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/service/LessonProgressService.java:104-151`]

- Admin resource-management flow:
  - `AdminPage` loads users, courses, and attachments into a single dashboard query composition. [Evidence: `unicode-frontend/src/pages/AdminPage.tsx:52-84`]
  - Admin mutations hit `/api/admin/users/...` and `/api/admin/courses/{courseId}/attachments`. [Evidence: `unicode-frontend/src/api/adminUsers.ts`; `unicode-frontend/src/api/attachments.ts`; `backend/src/main/java/com/unicodeacademy/backend/controller/AdminUserController.java`; `backend/src/main/java/com/unicodeacademy/backend/controller/AdminCourseAttachmentController.java`]

- Chat flow:
  - Frontend fetches history through REST and subscribes to live topics via SockJS/STOMP. [Evidence: `unicode-frontend/src/api/chat.ts:27-81`; `unicode-frontend/src/components/ChatWidget.tsx:108-213`]
  - Backend secures STOMP `CONNECT`, routes messages through `/app/chat/...`, and broadcasts to `/topic/chat/...`. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/config/WebSocketConfig.java:29-44`; `backend/src/main/java/com/unicodeacademy/backend/controller/ChatWebSocketController.java:21-33`; `backend/src/main/java/com/unicodeacademy/backend/security/JwtStompChannelInterceptor.java:35-72`]

# 11. Implemented Learning Platform Logic

- Courses: The project ships with a seeded catalog of nine courses mapped to nine programming languages. Course titles are in French and clearly academic/basic-to-intermediate in orientation. [Evidence: `backend/src/main/resources/data.sql:1-22`]
- Lessons / modules / chapters: The persisted pedagogical structure is `Course -> Lesson -> Exercise`. There is no persisted `Module` or `Chapter` entity. The frontend introduces a derived "unit" abstraction by grouping lessons in blocks of four for navigation and progress UX. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/Course.java`; `backend/src/main/java/com/unicodeacademy/backend/model/Lesson.java`; `backend/src/main/java/com/unicodeacademy/backend/model/Exercise.java`; `unicode-frontend/src/lib/academy.ts:133-184`]
- Programming languages taught: C, Java, Python, C++, MySQL, C#/.NET, HTML, CSS, JavaScript. [Evidence: `backend/src/main/resources/data.sql:1-22`]
- Exercises: Exercises are stored with typed metadata (`MCQ`, `CODE`, `TRUE_FALSE`), question text, optional choices JSON, answer, explanation, and order index. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/Exercise.java:23-44`]
- Quizzes / tests: There is no dedicated quiz entity. Lesson summaries infer `FINAL_QUIZ` vs `REGULAR` by searching lesson titles for `quiz`, `test`, or `exercice`, which is a heuristic rather than explicit schema. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/repository/LessonRepository.java:27-44`]
- Practice logic: Lessons can include starter code, expected output, sample output, and practice instructions. Backend code execution supports multiple languages, while frontend web lessons use a browser-side playground path. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/Lesson.java:27-37`; `unicode-frontend/src/pages/LeconPage.tsx:538-603,778-890`; `backend/src/main/java/com/unicodeacademy/backend/service/CodeExecutionService.java:41-107`]
- Progress tracking: Lesson completion requires order progression plus a minimum number of attempted exercises (`min(3, total exercises)`); summary progress is computed course-by-course from completed lessons and attempts. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/service/LessonProgressService.java:109-149`; `backend/src/main/java/com/unicodeacademy/backend/controller/ProgressController.java:59-98`]
- User enrollment / access: No explicit enrollment entity or purchase/subscription flow was identified. Any authenticated user can use the protected learning UI, and the backend even exposes course/lesson reads publicly. [Evidence: absence of enrollment/payment model; `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:54-56`; `unicode-frontend/src/App.tsx:73-90`]
- Admin / instructor management: Admin management exists, but there is no separate instructor/teacher role or authoring workflow beyond admin attachment management and read-only course inspection. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/User.java:14-19`; `unicode-frontend/src/pages/AdminPage.tsx:380-409`; absence of instructor entity/role]
- Content organization: Curriculum content is database-seeded and rendered dynamically through API responses. Course resources are attached at course level, not lesson level. [Evidence: `backend/src/main/resources/data.sql`; `backend/src/main/java/com/unicodeacademy/backend/model/CourseAttachment.java`; `unicode-frontend/src/components/CoursePathView.tsx:274-311`]
- Certifications: **Not clearly identifiable from the codebase**.
- Dashboards / analytics: Learner-facing dashboards exist on the home and profile pages, plus leaderboard ranking. A backend `stats/me` endpoint also exists but is not surfaced in the current frontend. [Evidence: `unicode-frontend/src/pages/AccueilPage.tsx`; `unicode-frontend/src/pages/ProfilPage.tsx`; `unicode-frontend/src/pages/ClassementPage.tsx`; `backend/src/main/java/com/unicodeacademy/backend/controller/StatsController.java:36-57`]

# 12. UI/UX Observations

- General UI design approach: The frontend uses a custom branded dashboard aesthetic rather than default component-library output. The palette is teal/indigo on light surfaces, with custom fonts and badge/card language across dashboard, admin, profile, and chat. [Evidence: `unicode-frontend/src/styles/design-system.css:1-37,120-178`; `unicode-frontend/src/pages/AdminPage.tsx`; `unicode-frontend/src/components/AppShell.tsx`]
- Dashboard/admin panels: The authenticated shell is dashboard-oriented, with sidebar navigation, resume card, user menu, and floating chat. Admin is presented as a control center with stats cards and tabbed management panels. [Evidence: `unicode-frontend/src/components/AppShell.tsx:344-446,534`; `unicode-frontend/src/pages/AdminPage.tsx:236-520`]
- Responsiveness / mobile support clues: The CSS includes multiple breakpoint adaptations and many single-column fallbacks. That is reasonable evidence of responsive intent. [Evidence: `unicode-frontend/src/styles/design-system.css:4721-4983`]
- User-experience strengths:
  - The learning flow is clear: course path -> lesson -> practice -> exercises -> progress update. [Evidence: `unicode-frontend/src/components/CoursePathView.tsx`; `unicode-frontend/src/pages/LeconPage.tsx`; `unicode-frontend/src/pages/ExercicesPage.tsx`]
  - Resume learning is emphasized through shell/profile/dashboard affordances. [Evidence: `unicode-frontend/src/components/AppShell.tsx:159-193,344-359`; `unicode-frontend/src/utils/recentLessons.ts:22-38`]
  - AI assistance is contextual rather than isolated in a separate page. [Evidence: `unicode-frontend/src/pages/LeconPage.tsx:942-952`; `unicode-frontend/src/pages/ExercicesPage.tsx:583-587`]
  - Chat is reachable both globally and from a course context. [Evidence: `unicode-frontend/src/components/CoursePathView.tsx:248`; `unicode-frontend/src/pages/ChatPage.tsx:12-89`; `unicode-frontend/src/components/ChatWidget.tsx`]
- Areas that may need improvement:
  - Some visible text suffers from mojibake/encoding issues in both seeded content and UI strings. [Evidence: `backend/src/main/resources/data.sql:13-22`; `unicode-frontend/src/App.tsx:145-148`; `unicode-frontend/src/pages/ProfilPage.tsx:292,317`; `unicode-frontend/src/pages/AdminPage.tsx:485`]
  - The admin course tab implies editing/creation but does not actually provide it. [Evidence: `unicode-frontend/src/pages/AdminPage.tsx:387-393`]
  - The code editor experience is uneven across languages because syntax extensions are not equally provided. [Evidence: `unicode-frontend/src/components/CodeEditor.tsx:97-110`; `unicode-frontend/package.json`]

# 13. Security and Reliability

Visible security / robustness practices:

- Password hashing uses BCrypt. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/AppConfig.java:11-13`; `backend/src/main/java/com/unicodeacademy/backend/service/AuthService.java:66,158`; `backend/src/main/java/com/unicodeacademy/backend/controller/UserController.java:92`]
- JWT handling distinguishes access and refresh tokens with a `token_type` claim and enforces issuer/secret-length requirements. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/JwtService.java:18-21,35-45,71-101`]
- Backend security is stateless and role-protects `/api/admin/**`. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:39-45,52-58`]
- Login and Google auth are rate-limited to five requests per minute per client IP. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/AuthRateLimitFilter.java:20-57`]
- CORS origins are environment-driven. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:77-95`; `backend/src/main/resources/application.properties:23-24`]
- Avatars and course attachments use size/type/path validation and safe file resolution. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/UserController.java:42-44,96-165,208-235`; `backend/src/main/java/com/unicodeacademy/backend/service/CourseAttachmentService.java:30-76,139-145`]
- Chat message retention is scheduled, reducing unbounded growth. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/config/ChatRetentionScheduler.java:15-23`; `backend/src/main/resources/application.properties:42-43`]
- Validation coverage exists for auth and code-run DTOs, plus manual validation for many business paths. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/dto/RegisterRequest.java`; `backend/src/main/java/com/unicodeacademy/backend/dto/LoginRequest.java`; `backend/src/main/java/com/unicodeacademy/backend/dto/CodeRunRequest.java`; `backend/src/main/java/com/unicodeacademy/backend/controller/UserController.java`; `backend/src/main/java/com/unicodeacademy/backend/controller/ExerciseAttemptController.java`]
- Reliability-oriented compatibility code exists for schema drift, text encoding, and missing lesson columns. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/config/SchemaCompatibilityInitializer.java`; `backend/src/main/java/com/unicodeacademy/backend/config/LessonStarterCodeBackfill.java`; `backend/src/main/java/com/unicodeacademy/backend/controller/CourseController.java:63-77`; `backend/src/main/java/com/unicodeacademy/backend/controller/LessonController.java:46-58`; `backend/src/test/java/com/unicodeacademy/backend/util/TextEncodingFixerTests.java`]

Missing or weak areas visible in code:

- Tokens are stored in browser `localStorage`, not HTTP-only cookies, which increases exposure if the frontend ever suffers XSS. [Evidence: `unicode-frontend/src/auth/session.ts:1-29`]
- A development admin account is seeded in `data.sql`, and the source comment reveals the plaintext password `Admin@123`. This is acceptable only for strictly local/demo use and would be unsafe in shared or production environments. [Evidence: `backend/src/main/resources/data.sql:5067-5070`]
- Refresh tokens are stateless and no server-side revocation/rotation store is visible. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/service/AuthService.java:109-126`; `backend/src/main/java/com/unicodeacademy/backend/security/JwtService.java:67-101`]
- Chat attachment uploads enforce file size but do not visibly enforce MIME/extension restrictions, unlike course attachments and avatars. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/ChatRestController.java:54-85`; compare `backend/src/main/java/com/unicodeacademy/backend/service/CourseAttachmentService.java:60-63`; `backend/src/main/java/com/unicodeacademy/backend/controller/UserController.java:108-110`]
- Code execution launches local processes and compilers directly. Time/output/code limits exist, but no container/jail isolation is visible. This is a meaningful security and operational risk if exposed broadly. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/service/CodeExecutionService.java:65-68,100-107,429-495`]
- The password-change backend path is weaker than the registration path. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/UserController.java:83-85`; `backend/src/main/java/com/unicodeacademy/backend/dto/RegisterRequest.java:16-21`]
- Course/lesson read endpoints are public even though the SPA wraps learning pages behind auth; this may or may not be intentional, but it is a notable exposure difference. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:54-56`; `unicode-frontend/src/App.tsx:48-90`]
- No general rate limiting is visible for chat, AI, or code execution endpoints. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/AuthRateLimitFilter.java:27-32`; absence of additional limiter filters]
- No Flyway/Liquibase migrations are present, so schema evolution depends on `ddl-auto`, startup SQL, and custom compatibility runners. [Evidence: `backend/src/main/resources/application.properties:9-12`; `backend/pom.xml`; `backend/src/main/java/com/unicodeacademy/backend/config/SchemaCompatibilityInitializer.java`]

Reliability / verification notes from this audit:

- Backend test coverage exists and includes auth, JWT, security-access integration, controller MVC tests, repository smoke tests, lesson-progress service tests, and encoding-fix tests. [Evidence: `backend/src/test/java/com/unicodeacademy/backend`]
- On 2026-04-16, backend tests passed locally with `45` tests via `mvn -Dmaven.repo.local=.m2/repository test`. [Evidence: local verification performed during this audit]
- On 2026-04-16, frontend production build passed, but Vite emitted a large-chunk warning about bundle size. [Evidence: local verification performed during this audit]
- Frontend automated tests were not found; `package.json` has no `test` script. [Evidence: `unicode-frontend/package.json`]

# 14. Software Engineering / Architecture Style

- Client-server architecture: The repository is split into a React client (`unicode-frontend`) and a Spring Boot server (`backend`) communicating over HTTP/WebSocket. This is a textbook client-server separation. [Evidence: repo structure; `unicode-frontend/src/api`; `backend/src/main/java/com/unicodeacademy/backend/controller`; `unicode-frontend/src/api/chat.ts`; `backend/src/main/java/com/unicodeacademy/backend/config/WebSocketConfig.java`]
- Backend monolith: The backend is a single deployable Spring Boot application containing auth, learning content, progress, admin, chat, AI, email, and code execution within one process and one codebase. [Evidence: `backend/pom.xml`; `backend/src/main/java/com/unicodeacademy/backend/BackendApplication.java`; package structure under `backend/src/main/java/com/unicodeacademy/backend`]
- Layered architecture: The backend is explicitly layered into controllers, services, repositories, models, and DTOs. [Evidence: backend package structure]
- MVC-influenced style: Although it is a REST API rather than server-rendered MVC, the Spring organization still follows the common controller/domain/repository pattern associated with MVC-style enterprise apps. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller`; `backend/src/main/java/com/unicodeacademy/backend/model`; `backend/src/main/java/com/unicodeacademy/backend/repository`]
- Component-based frontend: The frontend is composed from reusable React components and page-level containers. [Evidence: `unicode-frontend/src/components`; `unicode-frontend/src/pages`]
- RESTful backend with pragmatic exceptions: Most endpoint naming is REST-like and resource-based, but some compatibility routes and singular/plural inconsistencies remain. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller`; `backend/src/main/java/com/unicodeacademy/backend/controller/LessonProgressController.java:45-65`]
- Real-time extension: Chat adds a message-broker style layer via STOMP topics on top of the core REST app. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/config/WebSocketConfig.java:35-44`; `backend/src/main/java/com/unicodeacademy/backend/controller/ChatWebSocketController.java:21-33`; `unicode-frontend/src/components/ChatWidget.tsx:119-124`]

# 15. Key Technical Decisions

- Inference: A relational database was chosen because the domain is strongly relational and query-heavy. Courses, lessons, exercises, user progress, and leaderboard scoring all depend on joins and aggregation that fit SQL very naturally. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model`; `backend/src/main/java/com/unicodeacademy/backend/repository/CourseRepository.java:23-36`; `backend/src/main/java/com/unicodeacademy/backend/repository/UserRepository.java:29-77`]
- Inference: JWT-based stateless auth fits the chosen architecture because the frontend is a separate SPA, the backend is stateless, and WebSocket auth can reuse the same token model. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java:39-45`; `unicode-frontend/src/auth/session.ts:1-29`; `backend/src/main/java/com/unicodeacademy/backend/security/JwtStompChannelInterceptor.java:35-72`]
- Inference: React Query was selected because the product is read-heavy and cache invalidation matters across dashboard, lessons, exercises, profile, and admin surfaces. The centralized query keys and invalidations support that choice well. [Evidence: `unicode-frontend/src/lib/queryClient.ts:4-11`; `unicode-frontend/src/lib/queryKeys.ts`; `unicode-frontend/src/pages/ExercicesPage.tsx:374-376`; `unicode-frontend/src/pages/LeconPage.tsx:640-645`]
- Inference: A custom design system was preferred over a prebuilt component framework to create a more distinctive visual identity for the educational dashboard. [Evidence: `unicode-frontend/src/styles/design-system.css:1-37,120-178`; absence of Material UI/Chakra/Ant Design dependencies in `unicode-frontend/package.json`]
- Inference: Google login was added to reduce friction for student onboarding, but it was implemented as optional rather than mandatory, which is why both the frontend and backend check for configuration before enabling it. [Evidence: `unicode-frontend/src/pages/LoginPage.tsx:24,205-228`; `backend/src/main/java/com/unicodeacademy/backend/service/AuthService.java:135-138`; `backend/src/main/resources/application.properties:23`]
- Inference: Anthropic-backed AI hints were deliberately wrapped with strong fallback logic so the product still works in environments without paid provider access. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/service/AiService.java:88-125,161-179,767`; `backend/src/main/resources/application.properties:44`]
- Inference: Runtime schema/backfill helpers were chosen because the project evolved while content/schema consistency problems existed, and the team opted to heal data on startup rather than introduce a formal migration stack. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/config/SchemaCompatibilityInitializer.java`; `backend/src/main/java/com/unicodeacademy/backend/config/LessonStarterCodeBackfill.java`; `backend/src/main/java/com/unicodeacademy/backend/util/TextEncodingFixer.java`]

# 16. Strengths of the Project

- The project solves a practical educational use case with a coherent end-to-end workflow from content consumption to practice, exercises, and progress measurement. [Evidence: `unicode-frontend/src/components/CoursePathView.tsx`; `unicode-frontend/src/pages/LeconPage.tsx`; `unicode-frontend/src/pages/ExercicesPage.tsx`; `backend/src/main/java/com/unicodeacademy/backend/controller/ProgressController.java`]
- The backend security baseline is serious for a student project: JWT auth, RBAC, hashed passwords, rate-limited login, and WebSocket auth enforcement are all present. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security`]
- The repo structure is maintainable and recognizable, especially on the backend. The layer boundaries are clear even if not always perfectly strict. [Evidence: backend package structure]
- The learning experience is richer than a simple CRUD LMS because it includes code execution, contextual AI hints, leaderboard mechanics, chat, and resources. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/service/CodeExecutionService.java`; `backend/src/main/java/com/unicodeacademy/backend/service/AiService.java`; `backend/src/main/java/com/unicodeacademy/backend/repository/UserRepository.java:29-77`; `backend/src/main/java/com/unicodeacademy/backend/controller/ChatRestController.java`; `backend/src/main/java/com/unicodeacademy/backend/service/CourseAttachmentService.java`]
- The frontend shows strong product thinking: resume learning, floating chat, 28-day activity, course-path visualization, and profile analytics are all above a minimal academic prototype. [Evidence: `unicode-frontend/src/components/AppShell.tsx`; `unicode-frontend/src/utils/recentLessons.ts`; `unicode-frontend/src/pages/ProfilPage.tsx`; `unicode-frontend/src/components/CoursePathView.tsx`]
- The project includes backend tests and CI automation, which improves credibility for a PFA presentation/report. [Evidence: `backend/src/test/java`; `.github/workflows/ci.yml`]
- The codebase shows resilience work: text-encoding repair, schema compatibility recovery, starter-code backfills, and AI fallback behavior suggest the team addressed real integration problems instead of stopping at the happy path. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/util/TextEncodingFixer.java`; `backend/src/main/java/com/unicodeacademy/backend/config/SchemaCompatibilityInitializer.java`; `backend/src/main/java/com/unicodeacademy/backend/config/LessonStarterCodeBackfill.java`; `backend/src/main/java/com/unicodeacademy/backend/service/AiService.java`]

# 17. Limitations / Missing Parts / Improvement Opportunities

## Observed limitations

- Course management is incomplete in the admin UI. The course tab is essentially read-only, and course creation/editing/deletion APIs were not found. [Evidence: `unicode-frontend/src/pages/AdminPage.tsx:380-409`; absence of backend course-CRUD admin controller]
- The project has no instructor-specific role, no explicit enrollment model, and no certification subsystem. Those are meaningful LMS gaps if the product scope expands. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/model/User.java:14-19`; absence of enrollment/certificate models]
- Schema evolution is managed through `ddl-auto`, startup SQL, and custom runners instead of formal migrations, which can become fragile over time. [Evidence: `backend/src/main/resources/application.properties:9-12`; `backend/src/main/java/com/unicodeacademy/backend/config/SchemaCompatibilityInitializer.java`; absence of Flyway/Liquibase in `backend/pom.xml`]
- Some learning logic is heuristic or duplicated. Final-quiz detection depends on lesson-title keywords, and explicit course progress can diverge from derived course-completion summary logic. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/repository/LessonRepository.java:27-44`; `backend/src/main/java/com/unicodeacademy/backend/controller/ProgressController.java:54-125`]
- Code execution is powerful but operationally risky because it depends on local toolchains and lacks visible process isolation beyond time/output/code limits. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/service/CodeExecutionService.java:65-68,126-317,429-495`]
- Chat upload validation is weaker than other upload paths. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/controller/ChatRestController.java:54-85`; compare `backend/src/main/java/com/unicodeacademy/backend/service/CourseAttachmentService.java:60-63`]
- Frontend testing is missing, and backend-only endpoints exist without clear UI consumers (`/api/stats/me`, `/api/progress/me`, `/topic/notifications`, `/api/users/usernames`). [Evidence: `unicode-frontend/package.json`; `backend/src/main/java/com/unicodeacademy/backend/controller/StatsController.java`; `backend/src/main/java/com/unicodeacademy/backend/controller/ProgressController.java:42-52`; `backend/src/main/java/com/unicodeacademy/backend/controller/AdminCourseAttachmentController.java:26-36`; `backend/src/main/java/com/unicodeacademy/backend/controller/UserController.java:66-72`]
- Encoding problems remain visible despite the cleanup utility, which weakens polish in both the product and a presentation/demo context. [Evidence: `backend/src/main/resources/data.sql:13-22`; `unicode-frontend/src/App.tsx:145-148`; `unicode-frontend/src/pages/ProfilPage.tsx:292,317`; `backend/src/test/java/com/unicodeacademy/backend/util/TextEncodingFixerTests.java`]
- A dev admin credential is committed in seed SQL, which is an avoidable security smell. [Evidence: `backend/src/main/resources/data.sql:5067-5070`]

## Possible future improvements

- Add real admin CRUD for courses, lessons, and exercises so curriculum changes do not depend on editing `data.sql`.
- Introduce proper schema migrations with Flyway or Liquibase, and reduce startup compatibility logic over time.
- Harden the code-execution subsystem with containerization, per-user quotas, and broader rate limiting.
- Align password-policy enforcement across registration and password-change flows.
- Restrict or scan chat attachment types, and add moderation/reporting features to chat.
- Move resume-learning state from browser-local storage into backend persistence for cross-device continuity.
- Replace quiz-title heuristics with an explicit lesson-type field.
- Add frontend automated tests and end-to-end tests for the major learner/admin flows.
- Add a true instructor/content-author role if the project scope grows beyond student/admin.
- If content should be private, tighten backend read permissions for course/lesson endpoints to match the protected frontend UX.

# 18. Presentation-Ready Summary

- Problem addressed: Students learning multiple programming languages often need separate tools for course content, coding practice, quizzes, progress monitoring, and communication. UniCode Academy brings those flows together in one platform. [Evidence: `backend/src/main/resources/data.sql:1-22`; `unicode-frontend/src/pages/AccueilPage.tsx`; `unicode-frontend/src/pages/LeconPage.tsx`; `unicode-frontend/src/pages/ExercicesPage.tsx`; `unicode-frontend/src/components/ChatWidget.tsx`]
- Proposed solution: A React frontend and Spring Boot backend deliver a centralized learning environment with courses, lessons, practice playgrounds, exercises, progress summaries, ranking, chat, AI hints, and admin management. [Evidence: `unicode-frontend/src/App.tsx`; `backend/src/main/java/com/unicodeacademy/backend/controller`; `backend/pom.xml`; `unicode-frontend/package.json`]
- Key features: authentication (including Google login), curriculum catalog, guided lesson/practice flow, exercise correction, progress tracking, leaderboard, profile/settings, course resources, real-time chat, AI hints, and admin controls. [Evidence: sections above; key files include `AuthService.java`, `CoursePathView.tsx`, `LeconPage.tsx`, `ExercicesPage.tsx`, `LeaderboardController.java`, `AdminPage.tsx`, `ChatWidget.tsx`, `AiService.java`]
- Tech stack: React 19, TypeScript, Vite, React Query, Axios, SockJS/STOMP, CodeMirror, Spring Boot 3.5, Spring Security, Spring Data JPA, PostgreSQL, JWT, Google API Client, and SMTP mail support. [Evidence: `unicode-frontend/package.json`; `backend/pom.xml`]
- Architecture summary: Separate SPA + monolithic API, with layered backend packages and a component-based frontend. Persistence is relational; chat adds WebSocket/STOMP; code execution and AI hints extend the core learning workflow. [Evidence: repo structure; `backend/src/main/java/com/unicodeacademy/backend`; `unicode-frontend/src`]
- Project strengths: strong scope for a student project, clear backend layering, real educational workflow, useful UX features, and working security fundamentals. [Evidence: sections 7, 8, 13, 16]
- Future improvements: formal migrations, harder code-execution isolation, richer admin content CRUD, frontend tests, and better upload/security hardening. [Evidence: section 17]

# 19. Report-Ready Summary

UniCode Academy is a full-stack educational web application designed around the teaching and practice of programming languages through an integrated digital environment. The implemented system combines a modern React single-page application with a Spring Boot backend API and a relational persistence model. Its functional scope covers authentication, course access, lesson consumption, practice/code execution, exercise submission, progress monitoring, leaderboard ranking, profile management, real-time chat, AI-assisted hints, and administrator operations. [Evidence: `unicode-frontend/src/App.tsx`; `backend/src/main/java/com/unicodeacademy/backend/controller`; `backend/src/main/java/com/unicodeacademy/backend/model`; `backend/pom.xml`; `unicode-frontend/package.json`]

From a methodological perspective, the implementation reflects a layered client-server architecture. The frontend is structured around pages, reusable components, query-driven data fetching, and browser-level session persistence, while the backend is organized into controllers, services, repositories, models, security filters, and startup configuration modules. The pedagogical model is relational and centers on programming languages, courses, lessons, exercises, and user progress records. Additional subsystems such as chat, code execution, AI hint fallback, and SMTP-driven account-termination email show that the project extends beyond a simple CRUD prototype. [Evidence: `unicode-frontend/src/lib/queryClient.ts`; `unicode-frontend/src/lib/queryKeys.ts`; `backend/src/main/java/com/unicodeacademy/backend/service`; `backend/src/main/java/com/unicodeacademy/backend/repository`; `backend/src/main/java/com/unicodeacademy/backend/config`; `backend/src/main/java/com/unicodeacademy/backend/security`]

Technically, the project demonstrates several mature choices for a PFA: stateless JWT authentication, role-based admin protection, a tested backend, GitHub Actions CI, startup compatibility logic for schema/content evolution, and a reasonably polished dashboard-oriented UI. At the same time, the codebase still reveals important limitations suitable for "future work" discussion, including missing course-authoring CRUD, the absence of formal database migrations, localStorage-based token storage, non-isolated server-side code execution, and residual encoding inconsistencies. Overall, the implementation already constitutes a credible academic product with real functional depth and a clear path for technical improvement. [Evidence: `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java`; `backend/src/test/java`; `.github/workflows/ci.yml`; `backend/src/main/java/com/unicodeacademy/backend/config/SchemaCompatibilityInitializer.java`; `unicode-frontend/src/styles/design-system.css`; `backend/src/main/resources/data.sql:5067-5070`; `unicode-frontend/src/auth/session.ts`]

# 20. Appendix: File Evidence Map

- `backend/pom.xml`
  - Role in system: Backend dependency/build definition.
  - What it proves/explains: Spring Boot, Java 17, JPA, Security, WebSocket, Mail, JWT, Google API, PostgreSQL, H2 tests, JaCoCo.

- `backend/src/main/resources/application.properties`
  - Role in system: Runtime configuration.
  - What it proves/explains: DB/JWT/CORS/upload/mail/chat-retention/AI/code-execution settings, plus `ddl-auto=update`.

- `backend/src/main/resources/data.sql`
  - Role in system: Seed curriculum and demo data.
  - What it proves/explains: Supported languages, courses, lesson/exercise seeding, dev admin account, and lesson starter-code/sample-output defaults.

- `backend/src/main/java/com/unicodeacademy/backend/model/User.java`
  - Role in system: User domain entity.
  - What it proves/explains: Roles, avatar support, preferred language relation.

- `backend/src/main/java/com/unicodeacademy/backend/model/Course.java`
  - Role in system: Course entity.
  - What it proves/explains: Course-language relation and lesson ownership.

- `backend/src/main/java/com/unicodeacademy/backend/model/Lesson.java`
  - Role in system: Lesson entity.
  - What it proves/explains: Lesson content, starter code, execution metadata.

- `backend/src/main/java/com/unicodeacademy/backend/model/Exercise.java`
  - Role in system: Exercise entity.
  - What it proves/explains: Exercise types and answer/explanation structure.

- `backend/src/main/java/com/unicodeacademy/backend/model/UserLessonProgress.java`
  - Role in system: Lesson-progress entity.
  - What it proves/explains: Per-user lesson completion tracking.

- `backend/src/main/java/com/unicodeacademy/backend/model/UserExerciseAttempt.java`
  - Role in system: Exercise-attempt entity.
  - What it proves/explains: Stored learner submissions and correctness.

- `backend/src/main/java/com/unicodeacademy/backend/model/CourseAttachment.java`
  - Role in system: Course-resource metadata entity.
  - What it proves/explains: Attachment metadata and course linkage.

- `backend/src/main/java/com/unicodeacademy/backend/model/ChatMessage.java`
  - Role in system: Chat history entity.
  - What it proves/explains: Global/course room model and attachment-capable chat persistence.

- `backend/src/main/java/com/unicodeacademy/backend/security/SecurityConfig.java`
  - Role in system: Main backend security policy.
  - What it proves/explains: Stateless auth, public/private routes, admin protection, CORS.

- `backend/src/main/java/com/unicodeacademy/backend/service/AuthService.java`
  - Role in system: Authentication business logic.
  - What it proves/explains: Registration, login, Google login, refresh-token flow.

- `backend/src/main/java/com/unicodeacademy/backend/security/JwtService.java`
  - Role in system: Token creation/validation.
  - What it proves/explains: Access/refresh token types, issuer enforcement, secret validation.

- `backend/src/main/java/com/unicodeacademy/backend/service/LessonProgressService.java`
  - Role in system: Lesson-completion rules.
  - What it proves/explains: Sequential gating and required attempted exercises.

- `backend/src/main/java/com/unicodeacademy/backend/service/CodeExecutionService.java`
  - Role in system: Multi-language code runner.
  - What it proves/explains: Supported languages, execution limits, SQL sandboxing, toolchain dependency.

- `backend/src/main/java/com/unicodeacademy/backend/service/ChatMessageService.java`
  - Role in system: Chat domain logic.
  - What it proves/explains: Room validation, retention, message creation, course/global split.

- `backend/src/main/java/com/unicodeacademy/backend/service/CourseAttachmentService.java`
  - Role in system: Course-resource upload/download logic.
  - What it proves/explains: File validation, storage path handling, metadata persistence.

- `backend/src/main/java/com/unicodeacademy/backend/controller/AdminUserController.java`
  - Role in system: Admin user management.
  - What it proves/explains: Role changes, deletion safeguards, termination-email trigger.

- `backend/src/main/java/com/unicodeacademy/backend/controller/ChatRestController.java`
  - Role in system: Chat REST API.
  - What it proves/explains: History retrieval, attachment upload, file download.

- `backend/src/main/java/com/unicodeacademy/backend/controller/ChatWebSocketController.java`
  - Role in system: Chat STOMP controller.
  - What it proves/explains: Live broadcast channels.

- `backend/src/main/java/com/unicodeacademy/backend/config/SchemaCompatibilityInitializer.java`
  - Role in system: Startup compatibility helper.
  - What it proves/explains: Runtime schema repair and legacy large-object recovery.

- `backend/src/main/java/com/unicodeacademy/backend/config/LessonStarterCodeBackfill.java`
  - Role in system: Startup lesson-content repair.
  - What it proves/explains: Automatic backfill/generation of lesson starter code.

- `backend/src/main/java/com/unicodeacademy/backend/util/TextEncodingFixer.java`
  - Role in system: Text cleanup utility.
  - What it proves/explains: Encoding remediation efforts in the codebase.

- `backend/src/test/java/com/unicodeacademy/backend`
  - Role in system: Backend test suite.
  - What it proves/explains: Auth, security, controller, repository, lesson-progress, and encoding-fix coverage.

- `unicode-frontend/package.json`
  - Role in system: Frontend dependency/build manifest.
  - What it proves/explains: React/Vite/TypeScript/React Query/Axios/SockJS/STOMP/CodeMirror stack.

- `unicode-frontend/src/App.tsx`
  - Role in system: Frontend routing/guard definition.
  - What it proves/explains: Protected routes, fullscreen lesson flow, admin guard.

- `unicode-frontend/src/main.tsx`
  - Role in system: Frontend bootstrap.
  - What it proves/explains: Query provider, toaster, optional Google OAuth provider.

- `unicode-frontend/src/api/http.ts`
  - Role in system: Shared HTTP client.
  - What it proves/explains: Bearer-token injection, refresh-on-401 behavior, code-run and lesson-progress helper calls.

- `unicode-frontend/src/lib/academy.ts`
  - Role in system: Learning-flow helper library.
  - What it proves/explains: Streak logic, lesson-state mapping, unit grouping, route builders.

- `unicode-frontend/src/components/CoursePathView.tsx`
  - Role in system: Main course-path UI.
  - What it proves/explains: Attachments integration, chat entry, unit/course progress visualization.

- `unicode-frontend/src/pages/LeconPage.tsx`
  - Role in system: Lesson/practice page.
  - What it proves/explains: Markdown lesson rendering, code runner integration, AI hints.

- `unicode-frontend/src/pages/ExercicesPage.tsx`
  - Role in system: Exercise-series page.
  - What it proves/explains: Answer submission, query invalidation, celebration UX, AI hints.

- `unicode-frontend/src/components/ChatWidget.tsx`
  - Role in system: Reusable chat component.
  - What it proves/explains: REST + STOMP chat flow, global/course rooms, attachment support.

- `unicode-frontend/src/pages/AdminPage.tsx`
  - Role in system: Admin console.
  - What it proves/explains: User-role management, attachment management, partial/read-only course admin state.

- `unicode-frontend/src/pages/ProfilPage.tsx`
  - Role in system: Learner profile analytics.
  - What it proves/explains: Avatar UI, 28-day activity, progression by course, account-settings entry.

- `unicode-frontend/src/pages/ParametresPage.tsx`
  - Role in system: Account settings page.
  - What it proves/explains: Preferred language update, password change, logout, account deletion.

- `unicode-frontend/src/styles/design-system.css`
  - Role in system: Core visual system.
  - What it proves/explains: Custom branding, typography, grid layouts, responsive design intent.

- `.github/workflows/ci.yml`
  - Role in system: CI workflow.
  - What it proves/explains: Backend test and frontend build automation.

- `.github/dependabot.yml`
  - Role in system: Dependency automation.
  - What it proves/explains: Weekly update strategy for Maven and npm ecosystems.

- `.env.example`
  - Role in system: Root environment reference.
  - What it proves/explains: Expected operational dependencies and configuration surface.

### A. Best one-sentence description of UniCode Academy

UniCode Academy is a full-stack programming-learning platform that combines course content, hands-on coding, exercises, progress tracking, chat, and administration in one React + Spring Boot system.

### B. Best one-paragraph technical description

UniCode Academy is implemented as a React 19 single-page application backed by a Spring Boot 3.5 monolithic API using Spring Security, JWT authentication, Spring Data JPA, and PostgreSQL-oriented persistence. The backend models languages, courses, lessons, exercises, user progress, attachments, and chat messages; exposes REST endpoints for auth, curriculum, progress, users, admin, AI hints, and code execution; and adds STOMP/WebSocket messaging for real-time chat. The frontend consumes those APIs through Axios and React Query, protects routes with token-based guards, stores session tokens in `localStorage`, and delivers dashboard, lesson, exercise, profile, chat, leaderboard, and admin experiences through reusable React components and a custom CSS design system. [Evidence: `unicode-frontend/package.json`; `unicode-frontend/src/App.tsx`; `unicode-frontend/src/api/http.ts`; `backend/pom.xml`; `backend/src/main/java/com/unicodeacademy/backend/model`; `backend/src/main/java/com/unicodeacademy/backend/controller`; `backend/src/main/java/com/unicodeacademy/backend/config/WebSocketConfig.java`]

### C. Best paragraph explaining the architecture in simple words

In simple terms, the project has two main parts. The frontend is the visual website students use, built with React. The backend is the server that stores data, checks logins, tracks progress, runs code, and sends chat messages, built with Spring Boot. The frontend asks the backend for courses, lessons, exercises, and user data through API requests, and for chat it opens a live WebSocket connection. All learning data is stored in a relational database, while uploaded files such as avatars and attachments are saved on disk and referenced by the backend. [Evidence: `unicode-frontend/src/api`; `backend/src/main/java/com/unicodeacademy/backend/controller`; `backend/src/main/java/com/unicodeacademy/backend/model`; `backend/src/main/java/com/unicodeacademy/backend/controller/ChatRestController.java`; `backend/src/main/java/com/unicodeacademy/backend/config/WebSocketConfig.java`]
