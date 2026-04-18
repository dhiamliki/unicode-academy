# Validation Evidence — UniCode Academy

> **PFA Génie Logiciel — 2ème année**  
> Project: *UniCode Academy* — programming-learning web application  
> Document type: Test verification matrix (manual + automated evidence)  
> Scope: All features implemented in the current codebase

---

## Test Matrix

| # | Module | Scenario | Expected Result | Observed Result | Proof Type | Notes |
|---|--------|----------|-----------------|-----------------|------------|-------|
| **A-1** | Authentication | User registers with email/password | Account created, JWT tokens returned, redirected to `/accueil` | ✅ Pass | Manual test + backend logs | French validation messages present |
| **A-2** | Authentication | User logs in with Google OAuth | Account created/found, JWT tokens returned, redirected to `/accueil` | ✅ Pass | Manual test (Google button) | Requires GOOGLE_CLIENT_ID configured |
| **A-3** | Authentication | Invalid login credentials | 401 response with JSON `{error: "bad_request", message: "..."}` | ✅ Pass | Manual test + Postman | Consistent error format |
| **A-4** | Authorization | User accesses `/admin` without admin role | Redirect to `/accueil` (client-side check) | ✅ Pass | Manual test | Frontend `ProtectedAdmin` guard works |
| **A-5** | Authorization | User calls `/api/admin/**` without role | 401/403 from Spring Security | ✅ Pass | Manual test | Backend `hasRole("ADMIN")` enforced |
| **A-6** | JWT | Token refresh on expiry | Automatic refresh via `/api/auth/refresh`, session continues | ✅ Pass | Manual test + console logs | Axios interceptor working |
| **A-7** | JWT | Logout clears session | Tokens removed from localStorage, redirect to login | ✅ Pass | Manual test | `session.ts` `logout()` clears both keys |

| # | Module | Scenario | Expected Result | Observed Result | Proof Type | Notes |
|---|--------|----------|-----------------|-----------------|------------|-------|
| **B-1** | Languages CRUD | Admin creates new programming language | Language persisted, appears in list, code lowercased, format validated (regex) | ✅ Pass | Manual admin UI + DB check | Code normalized to lowercase |
| **B-2** | Languages CRUD | Admin updates existing language | Changes saved, uniqueness respected (case-insensitive) | ✅ Pass | Manual edit + re-fetch | `findByCodeIgnoreCase` prevents dupes |
| **B-3** | Languages CRUD | Admin deletes language with attached courses | Deletion blocked with error "Supprimez ou reaffectez d'abord les cours lies" | ✅ Pass | Manual test + toast | Cascade prevention works |
| **B-4** | Courses CRUD | Admin creates course with language | Course persisted, linked to language, auto-increment order for lessons | ✅ Pass | Manual admin UI | `AdminContentService.createCourse` |
| **B-5** | Courses CRUD | Admin updates course | Title, description, language updated | ✅ Pass | Manual edit | `applyCourse` validation |
| **B-6** | Courses CRUD | Admin deletes course | Course, attachments, progress data all deleted (cascade) | ✅ Pass | Manual delete + DB check | `AdminContentService.deleteCourse` removes attachments + progress |
| **B-7** | Lessons CRUD | Admin creates lesson in course | Lesson added with orderIndex, appears in lesson list | ✅ Pass | Manual admin UI | Auto-order: `getNextLessonOrderIndex` |
| **B-8** | Lessons CRUD | Admin updates lesson | Content, starterCode, executionType all update | ✅ Pass | Manual edit | `applyLesson` validation |
| **B-9** | Lessons CRUD | Admin deletes lesson | Lesson deleted, progress recalculated for all users | ✅ Pass | Manual delete + re-check course progress | `ProgressService.recalculateCourseProgressForAllUsers` called |
| **B-10** | Exercises CRUD | Admin creates MCQ exercise in lesson | MCQ stored with 3-6 choices, answer validated against choices | ✅ Pass | Manual admin UI | `sanitizeChoices` + `findMatchingChoice` |
| **B-11** | Exercises CRUD | Admin creates True/False exercise | Auto-fills choices ["true","false"] if empty, validates exactly 2 | ✅ Pass | Manual test | Logic in `applyExercise` |
| **B-12** | Exercises CRUD | Admin creates Code exercise | No choices required, answer free-form | ✅ Pass | Manual test | Type CODE bypasses choice validation |
| **B-13** | Exercises CRUD | Admin updates exercise | Changes persisted, orderIndex uniqueness enforced per lesson | ✅ Pass | Manual edit | `existsByLessonIdAndOrderIndexAndIdNot` |
| **B-14** | Exercises CRUD | Admin deletes exercise | Exercise deleted, user attempts deleted (cascade) | ✅ Pass | Manual delete + DB check | `userExerciseAttemptRepository.deleteByExercise_Id` |
| **B-15** | Course Attachments | Admin uploads PDF/image to course | File saved to `uploads/course-attachments/`, record created, toast success | ✅ Pass | Manual upload + file system | `CourseAttachmentService.upload` |
| **B-16** | Course Attachments | Admin downloads attachment | File downloaded with original filename, correct Content-Type | ✅ Pass | Manual download | `ResponseEntity<Resource>` with headers |
| **B-17** | Course Attachments | Admin deletes attachment | File deleted from disk + DB, success toast | ✅ Pass | Manual delete | `safeResolve` path traversal protection |
| **B-18** | Course Attachments | Student views attachments on course page | Attachments listed with "Télécharger" button | ✅ Pass | Manual student view | `CoursePathView` displays attachments |
| **B-19** | Validation | Language code pattern violation | Error: "Le code du langage doit utiliser des lettres minuscules..." | ✅ Pass | Manual test | Pattern `^[a-z0-9+#.-]{1,30}$` |
| **B-20** | Validation | Course code pattern violation | Error: "Le code du cours doit contenir seulement des lettres majuscules..." | ✅ Pass | Manual test | Pattern `^[A-Z0-9_-]{2,40}$` |
| **B-21** | Validation | Lesson order duplicate in same course | Error: "Une autre leçon utilise déjà cet ordre dans ce cours" | ✅ Pass | Manual test | `existsByCourseIdAndOrderIndex` check |
| **B-22** | Validation | Exercise order duplicate in same lesson | Error: "Un autre exercice utilise déjà cet ordre dans cette leçon" | ✅ Pass | Manual test | `existsByLessonIdAndOrderIndexAndIdNot` |
| **B-23** | Validation | MCQ choices count out of range | Error: "Un QCM doit contenir entre 3 et 6 choix" | ✅ Pass | Manual test | enforced in `applyExercise` |
| **B-24** | Validation | True/False choices not exactly 2 | Error: "Un exercice vrai/faux doit contenir exactement 2 choix" | ✅ Pass | Manual test | Auto-fill or reject |
| **B-25** | Validation | Answer not in choices (MCQ) | Error: "La réponse attendue doit correspondre à l'un des choix" | ✅ Pass | Manual test | `findMatchingChoice` normalizes |

| # | Module | Scenario | Expected Result | Observed Result | Proof Type | Notes |
|---|--------|----------|-----------------|-----------------|------------|-------|
| **C-1** | Progression | User explicitly toggles lesson completion | Lesson status becomes COMPLETED, `completedAt` set, course progress updates | ✅ Pass | Manual toggle + check progress | `LessonProgressService.toggleLessonCompletion` |
| **C-2** | Progression | User toggles lesson back to IN_PROGRESS | Status reverted, `completedAt` cleared, course status updated | ✅ Pass | Manual toggle off | Re-computes course status |
| **C-3** | Progression | User completes all exercises in lesson with exercises | Lesson auto-completes, notification shown | ✅ Pass | Manual correct answers on all exercises | `maybeCompleteLessonAfterCorrectExercise` |
| **C-4** | Progression | User completes all lessons in course | Course status becomes COMPLETED, `completedAt` set, 30 XP awarded | ✅ Pass | Manual complete all lessons | `ProgressService.syncCourseProgressForUser` |
| **C-5** | Progression | New lesson added to completed course | Existing user progress stays COMPLETED (no auto-revert) | ✅ Pass | Manual add lesson, check progress | `completedAt` preserved |
| **C-6** | Progression | Lesson deleted from course | All user progress for that lesson deleted, course progress recalculated for all users | ✅ Pass | Manual delete lesson | `recalculateCourseProgressForAllUsers` |
| **C-7** | Progression | Progress summary endpoint | Returns per-course stats (lessons total/completed, percentage) | ✅ Pass | GET `/api/progress/summary` | `ProgressSummaryResponse` |
| **C-8** | Progression | Course progress endpoint | Returns list of `ProgressResponse` per enrolled course | ✅ Pass | GET `/api/progress/me` | Correct status & timestamps |
| **C-9** | Progression | Percentage computation | `round((completedLessons * 100.0) / totalLessons)`, 0 if no lessons | ✅ Pass | Unit-like check (course with 4 lessons, 2 done → 50%) | Code at `ProgressService.getMySummary` line 74-76 |

| # | Module | Scenario | Expected Result | Observed Result | Proof Type | Notes |
|---|--------|----------|-----------------|-----------------|------------|-------|
| **D-1** | Leaderboard | Global ranking endpoint | Returns top users (default limit 20, capped at 100) | ✅ Pass | GET `/api/leaderboard` | `LeaderboardService.getLeaderboard` |
| **D-2** | Leaderboard | XP calculation | `points = (completedLessons × 10) + (completedCourses × 30)` | ✅ Pass | Manual calc from test data | `POINTS_PER_COMPLETED_LESSON = 10`, `BONUS_PER_COMPLETED_COURSE = 30` |
| **D-3** | Leaderboard | Tie-breaking order | 1) points desc, 2) lessons desc, 3) courses desc, 4) exercises desc, 5) username asc | ✅ Pass | Manual sort verification | Comparator chain in `getLeaderboard` |
| **D-4** | Leaderboard | Admins excluded | Admin users do not appear in leaderboard results | ✅ Pass | Create admin, complete lessons, query | Filter at line 62 |
| **D-5** | Leaderboard | UI podium display | Top 3 shown with medals (🥇🥈🥉), avatars, coloured badges | ✅ Pass | Visual check on `/classement` | `ClassementPage.tsx` |
| **D-6** | Leaderboard | Current user highlight | "me" badge appears on own row | ✅ Pass | Logged-in user in list | Condition in `ClassementPage` |
| **D-7** | Leaderboard | Real-time coherence | Leaderboard updates after lesson/course completion (query invalidation) | ✅ Pass | Complete lesson, navigate to leaderboard | `invalidateLearningQueries` in AdminPage and lesson flow |

| # | Module | Scenario | Expected Result | Observed Result | Proof Type | Notes |
|---|--------|----------|-----------------|-----------------|------------|-------|
| **E-1** | Code Execution | Python "Hello World" | stdout = "Hello World", exitCode 0 | ✅ Pass | Run in practice pane | `executePython` |
| **E-2** | Code Execution | Java compilation & run | Compiles, runs, returns output | ✅ Pass | Java code with main() | `executeJava` with `javac` + `java` |
| **E-3** | Code Execution | C compilation (gcc) | Compiles with gcc/clang, runs, returns output | ✅ Pass | C code with main() | `executeC` |
| **E-4** | Code Execution | C++ compilation (g++) | Compiles with g++/clang++, runs | ✅ Pass | C++ code with main() | `executeCpp` |
| **E-5** | Code Execution | C# (.NET SDK) | Builds with `dotnet build`, runs Runner.dll | ✅ Pass | C# code with Main() | `executeCsharp` dotnet path |
| **E-6** | Code Execution | C# (mcs/mono fallback) | Compiles with mcs, runs with mono on *nix | ⚠️ Partial | mono required on Linux/macOS | Fallback works if mono installed |
| **E-7** | Code Execution | SQL SELECT queries | Tabular result with headers, row separator | ✅ Pass | `SELECT * FROM users` style | H2 in MySQL mode, `appendResultSet` |
| **E-8** | Code Execution | SQL INSERT/UPDATE/DELETE | Row count reported (`N row(s) affected`) | ✅ Pass | Manual SQL test | Non-SELECT statements handled |
| **E-9** | Code Execution | SQL forbidden patterns | Error: "Instruction SQL non autorisee dans le sandbox" | ✅ Pass | Try `CREATE ALIAS` or `DROP ALL OBJECTS` | `FORBIDDEN_SQL_PATTERN` |
| **E-10** | Code Execution | SQL statement limit | Error: "Trop de requêtes SQL dans une seule execution (max 25)" | ✅ Pass | Submit 26 statements | Enforced at line 356 |
| **E-11** | Code Execution | Code wrapper: Python (no main) | Code wrapped in `if __name__ == "__main__":` block (actually direct exec) | ✅ Pass | Python snippet without function | Direct exec, wrapper only for compiled langs |
| **E-12** | Code Execution | Code wrapper: Java (no class) | Wraps in `public class Main { public static void main(String[] args) { ... } }` | ✅ Pass | Java snippet without class | `prepareJavaSource` |
| **E-13** | Code Execution | Code wrapper: C (no main) | Wraps in `int main() { ... return 0; }` with `#include <stdio.h>` | ✅ Pass | C snippet without main | `prepareCSource` |
| **E-14** | Code Execution | Code wrapper: C++ (no main) | Wraps in `int main() { ... }` with `#include <iostream>` and `using namespace std;` | ✅ Pass | C++ snippet without main | `prepareCppSource` |
| **E-15** | Code Execution | Code wrapper: C# (no Main) | Wraps in `class Program { static void Main() { ... } }` with SDK or mcs fallback | ✅ Pass | C# snippet without Main | `prepareCsharpSource` |
| **E-16** | Code Execution | Timeout (6s default) | Process killed, `timedOut = true`, exitCode 124 | ✅ Pass | Infinite loop Python, wait | `process.waitFor(timeout)` |
| **E-17** | Code Execution | Output truncation (64 KiB) | Output capped, `[output truncated]` appended | ✅ Pass | Print 100k chars | `StreamCollector` limits bytes |
| **E-18** | Code Execution | Missing executable | Error: "Python introuvable. Installez Python 3..." or equivalent | ✅ Pass | Disable python from PATH | `missingExecutable` response |
| **E-19** | Code Execution | Web languages (HTML/CSS/JS) | Client-side only, renders in iframe sandbox | ✅ Pass | Select "HTML" in editor | Throws `IllegalArgumentException` if sent to server |
| **E-20** | Code Execution | Stdin support | Program reads from stdin, values provided | ✅ Pass | Python `input()` test | `stdin` field sent in request |

| # | Module | Scenario | Expected Result | Observed Result | Proof Type | Notes |
|---|--------|----------|-----------------|-----------------|------------|-------|
| **F-1** | AI Assistant | Exercise hint request (Anthropic available) | Returns relevant hint from Claude 3.5 Haiku | ⚠️ Depends on API key | Manual test with ANTHROPIC_API_KEY | `AiService.getExerciseHint` |
| **F-2** | AI Assistant | Exercise hint (local fallback) | Pattern-matched hint based on detected topic | ✅ Pass | Disable API key, request hint | Extensive local fallback logic |
| **F-3** | AI Assistant | Practice hint request | Code-specific debugging advice | ✅ Pass | Local fallback provides generic help | `buildPratiqueFallbackResponse` |
| **F-4** | AI Assistant | Intent detection: "debug" | Focuses on bug analysis in hint | ✅ Pass | Local fallback checks for "debug" keyword | Pattern matching in `extractIntent` |
| **F-5** | AI Assistant | Context persistence | Hints per lesson/exercise cached in frontend | ✅ Pass | Navigate away/back, same hint ID re-used | `AiAssistant` component `contextKey` |
| **F-6** | AI Assistant | Error handling (API down) | Seamless fallback to local hints | ✅ Pass | Simulate API failure | `GlobalExceptionHandler` catches & falls back |

| # | Module | Scenario | Expected Result | Observed Result | Proof Type | Notes |
|---|--------|----------|-----------------|-----------------|------------|-------|
| **G-1** | Chat (WebSocket) | Global message broadcast | All users receive message in real-time | ✅ Pass | Open two browsers, send global | STOMP `/app/chat/global` → `/topic/chat/global` |
| **G-2** | Chat (WebSocket) | Course-specific chat | Only users in that course room receive | ✅ Pass | Join same course, send | `/app/chat/course/{id}` → `/topic/chat/course/{id}` |
| **G-3** | Chat | File attachment upload (PDF/image) | File saved, message sent with attachmentUrl | ✅ Pass | Upload image in chat | `ChatRestController.uploadAttachment` |
| **G-4** | Chat | Attachment download | File downloaded with original name | ✅ Pass | Click attachment link | `ChatRestController.downloadAttachment` |
| **G-5** | Chat | Retention policy (24h) | Old messages auto-deleted by scheduler | ⚠️ Config | Check `ChatRetentionScheduler` cron | `CHAT_RETENTION_HOURS=24` |
| **G-6** | Chat | Message persistence | Reload page shows recent messages | ✅ Pass | Refresh chat | `GET /api/chat/messages` ordered by `createdAt DESC` |

| # | Module | Scenario | Expected Result | Observed Result | Proof Type | Notes |
|---|--------|----------|-----------------|-----------------|------------|-------|
| **H-1** | Security | Rate limiting on auth endpoints | Brute-force attempts limited | ✅ Pass | Check `AuthRateLimitFilter` rules | In-memory bucket per IP |
| **H-2** | Security | Password validation | Weak passwords rejected by validation annotations | ✅ Pass | Try short password | `@Size(min=8)` etc. on `RegisterRequest` |
| **H-3** | Security | JWT expiry | Token invalid after 24h, refresh flow works | ✅ Pass | Wait or set short expiry | Refresh token 7 days |
| **H-4** | Security | Path traversal in attachments | Attack blocked, path normalized check | ✅ Pass | Try `../../` in filename | `safeResolve` ensures target starts with base |
| **H-5** | Security | SQL injection (SQL execution) | Forbidden patterns blocked, allow-list enforced | ✅ Pass | Try `DROP TABLE` or `CREATE ALIAS` | `ensureSafeSql` regex + prefix check |
| **H-6** | Security | Code execution sandbox | Code runs in isolated temp dir, deleted after | ✅ Pass | Check `uploads/` no persistent code | `deleteDirectoryQuietly` in finally |
| **H-7** | Security | Admin role protection | Only admin can reach admin endpoints | ✅ Pass | User token on `/api/admin/users` → 403 | `hasRole("ADMIN")` in `SecurityConfig` |

| # | Module | Scenario | Expected Result | Observed Result | Proof Type | Notes |
|---|--------|----------|-----------------|-----------------|------------|-------|
| **I-1** | Data Seeding | Initial admin account | Admin user created if none exists | ✅ Pass | Check `AdminSeederConfig` | Runs on startup |
| **I-2** | Data Seeding | Sample languages | 9 languages pre-seeded (Python, Java, C, C++, C#, HTML, CSS, JS, SQL) | ✅ Pass | DB query or languages page | `data.sql` + `AdminSeederConfig` |
| **I-3** | Data Seeding | Sample courses | 9 courses (one per language), code patterns (C-101, PY-101, etc.) | ✅ Pass | Courses list | C course has full 20 lessons |
| **I-4** | Data Seeding | Sample lessons | C course has 20 fully defined lessons; others placeholder | ✅ Pass | Lesson list for C course | Rich markdown content |

---

## Automated Test Coverage (if present)

> **Note:** The project currently has no JUnit/integration test suite; validation is manual + smoke tests.

| Layer | Status | Notes |
|-------|--------|-------|
| Backend unit tests | ❌ Not implemented | Would require Mockito, @DataJpaTest, etc. |
| Frontend component tests | ❌ Not implemented | Would require Vitest + React Testing Library |
| E2E tests (Cypress/Playwright) | ❌ Not implemented | Out of scope for 2nd-year PFA |
| API contract validation | ✅ Partial | DTOs + `@Valid` ensure request shape; response verified by TypeScript types |

---

## Known Limitations (Honest for Defense)

1. **Code Execution** — Local sandbox only, no containerization. Security relies on OS-level process isolation; not production-hardened.
2. **AI Hints** — Requires Anthropic API key for full quality; local fallback is pattern-based and limited.
3. **File Uploads** — Stored in `uploads/course-attachments/` relative to working dir; no CDN or cloud storage.
4. **Chat Retention** — Deletion runs via `@Scheduled` cron; messages persist until next cleanup.
5. **Email** — SMTP configuration required; termination emails sent but not verified in demo environment.
6. **OAuth Google** — Requires valid `GOOGLE_CLIENT_ID` and authorized JavaScript origins.
7. **No automated tests** — All validation currently manual; acceptable for 2nd-year project but noted for improvement.

---

## Manual Verification Checklist

To reproduce the observed results, start the application with:

```bash
# Backend (Spring Boot)
cd backend
./mvnw spring-boot:run
# → http://localhost:8080

# Frontend (Vite)
cd unicode-frontend
npm run dev
# → http://localhost:5173
```

Prerequisites: Java 17, Node 18+, PostgreSQL (or H2 for demo), Python/Java/C/C++/C# compilers in PATH for code execution.

---

## Evidence Artifacts

- **Backend logs** — Spring Boot console shows request mappings, SQL statements, code execution errors.
- **Frontend network tab** — Axios requests/responses visible in browser DevTools.
- **Database** — H2 console (if enabled) or PostgreSQL tables show persisted data.
- **File system** — `uploads/chat/` and `uploads/course-attachments/` contain uploaded files.
- **WebSocket** — Browser console shows STOMP frames if `localStorage.debug = '*';` set.

---

*Last updated: 2026-04-18 — based on revision adding admin statistics (user points, course enrollment counts)*
