# UniCode Academy Audit and Corrected Sprint Reconstruction

## 1. Executive audit summary
This audit reflects the current workspace as of March 29, 2026, not only the last committed `main`. The repository shows a real, academically credible full-stack learning platform with strong delivered scope in auth, course and lesson delivery, practice and code execution, exercises, progress tracking, leaderboard features, and account management, plus a second layer of partially productized extensions such as guided help, admin expansion, attachments, and chat. The original 6-sprint narrative is too compressed and mixes core feature delivery with later corrective work and pre-defense hardening.

Observed readiness signals are mixed but usable for a defense narrative: the frontend production build passes, the backend compile passes, and the backend automated tests now run correctly against the H2 test profile instead of the PostgreSQL demo seed path. The product is defensible as a delivered application, but the report should still separate delivered functionality, partial or hidden modules, and late stabilization work.

Most misplaced work in the original sprint story:

- `Sprint 5: realtime chat` overstates maturity; chat infrastructure exists, but the visible routed product experience is still partial or hidden.
- `Sprint 6: interactive playground and execution engine` is too narrow; practice, execution, lesson flow, and guided help are tightly coupled and should be split into learning-loop delivery plus later support features.
- `Sprint 4: progress tracking` is too isolated; real progress behavior is deeply tied to exercises, completion gating, cache refresh, and dashboard and profile consumption.
- Admin, attachments, guided help, dashboard restructuring, and final UX and security cleanup are missing from the original narrative and need explicit placement.

## 2. Domain-by-domain maturity audit
| Domain | Maturity | Audit note |
| --- | --- | --- |
| Data model and seeded learning content | Fully delivered | Strong core entities exist for users, languages, courses, lessons, exercises, progress, chat, and attachments; the repository includes a large seeded curriculum. |
| Auth and security | Fully delivered | JWT auth, role checks, optional Google login, current-user APIs, protected frontend routes, and later refresh-token, CORS, and rate-limit hardening are present. |
| Public course/language/lesson APIs | Fully delivered | Languages, courses, lesson summaries, lesson details, and exercise retrieval are all implemented and actively used by the frontend. |
| Course path and grouped units | Fully delivered | The student path is productized in the frontend; units are a frontend grouping abstraction over ordered lessons, not a persisted backend entity. |
| Lesson reader with markdown | Fully delivered | Lessons are delivered through a dedicated reader flow with markdown rendering and stepwise navigation. |
| Practice editor and execution flow | Fully delivered | Rich practice flow exists with editor, console or preview, challenge framing, validation feedback, and reset or retry behavior. |
| Backend code execution / frontend preview | Fully delivered, risky for demo | Multi-language execution is implemented for Python, Java, C, C++, C#, and SQL, while HTML, CSS, and JavaScript use client preview; demo success depends on local toolchains and environment preparation. |
| Exercise submission and checking | Fully delivered | Exercise attempt submission, answer checking, feedback, and unit-level exercise flow are implemented. |
| Progress and completion logic | Fully delivered | Lesson completion, exercise gating, course progress summaries, resume flow, and profile/dashboard consumption are all implemented; later refresh and invalidation fixes were necessary. |
| Leaderboard | Fully delivered | Ranking logic, points model, exclusion of admins, and leaderboard UI are implemented. |
| Profile and settings | Partially delivered | Preferred language, password change, account deletion, and profile analytics are real; avatar upload exists backend-side but is not productized in the current frontend, and password reset is still placeholder. |
| Admin | Partially delivered | User management and attachment operations are real; course and content CRUD is not productized and the course tab still contains placeholder behavior. |
| Course attachments | Technically implemented but not productized | Storage, admin upload/delete, and authenticated download APIs exist, but student-facing attachment consumption is not surfaced in the current frontend. |
| Guided help / AI hints | Partially delivered | The feature is usable and integrated, but it is best presented as guided help with reliable local fallback, not as a full AI assistant. |
| Chat | Technically implemented but not productized; risky for demo | REST + WebSocket chat infrastructure exists with room support and attachments, but the current routed UI is placeholder/hidden and should not be claimed as fully delivered product scope. |
| Dashboard restructure and design-system cleanup | Cleanup/polish only | This is substantial late UI work that improves clarity, professionalism, and demo quality rather than introducing a new core domain. |
| CI, security docs, and demo readiness | Partially delivered | CI and security documentation exist, backend tests now run against the H2 test profile, but runtime demos still depend on environment, provider, and toolchain alignment. |

Cross-cutting technical work that should be explicitly acknowledged:

- Architecture setup: Spring Boot + React/Vite split, repository/service/controller layering, DTO-based API design, React Query client, shared design system.
- Security hardening: JWT access/refresh separation, issuer/type validation, role protection, auth rate limiting, HTTP and WebSocket CORS, Google auth optionality.
- State and API orchestration: Axios interceptor refresh flow, centralized query keys, explicit `invalidateQueries` / `refetchQueries` around progress-sensitive screens.
- Content resilience: text-encoding fixer, schema compatibility initializer, starter-code backfill, seeded admin/demo data.
- Error and fallback handling: global exception handling, toast feedback, empty states, AI local fallback, guarded invalid states.
- Demo-readiness work: `.env.example`, README demo path, admin seeder, attachment storage paths, CI/dependabot/security policy, and test-profile cleanup.

## 3. Corrected sprint structure

### Sprint 1 - Platform Foundation and Learning Domain (`Feature`)
**Objective:** Establish the architectural base and the academic learning domain.

**Functional scope:** Users, languages, courses, lessons, exercises, and seed content.

**Technical scope:** Backend entity model, repositories, DTOs, initial APIs, project bootstrap, and seeded curriculum.

**Frontend scope:** Application bootstrap and routing skeleton.

**Backend scope:** JPA model, seeders, public catalog endpoints, and compatibility with core domain queries.

**Deliverables:** Stable data model and seeded catalog.

**What was actually completed:** Fully completed with a rich multi-language dataset, later reinforced by schema compatibility and starter-code backfill.

**What remained partial/incomplete:** Units were not modeled as backend entities.

**Why this sprint belongs here:** Every later sprint depends on this layer.

### Sprint 2 - Secure Access, Roles, and Session Management (`Feature`)
**Objective:** Make the platform accessible only through authenticated and role-aware flows.

**Functional scope:** Register, login, logout, current user, admin gate, and optional Google login.

**Technical scope:** JWT issuance, password hashing, protected routes, and session persistence.

**Frontend scope:** Login/register pages, protected shell/fullscreen routes, and session storage.

**Backend scope:** Auth controller/service, JWT service/filter, current-user API, and role checks.

**Deliverables:** Secure access to student and admin spaces.

**What was actually completed:** Fully completed, then later hardened with refresh tokens, CORS, issuer validation, and rate limiting.

**What remained partial/incomplete:** Password reset remains future work, and Google depends on env setup.

**Why this sprint belongs here:** It is the prerequisite for progress, profile, and admin behavior.

### Sprint 3 - Learning Catalog, Course Path, and Lesson Delivery (`Feature`)
**Objective:** Deliver the main student navigation flow from course discovery to lesson reading.

**Functional scope:** Course browsing, language selection, grouped units, lesson summaries/details, lesson markdown rendering, and recent lesson resume.

**Technical scope:** Lesson-fetch pipelines, frontend unit derivation, encoding fixes, and active navigation shell.

**Frontend scope:** `Accueil`, `Apprendre`, course path view, and lesson reader shell.

**Backend scope:** Course/language/lesson controllers and summary endpoints.

**Deliverables:** A coherent student learning journey from dashboard to lesson.

**What was actually completed:** Fully completed in the current workspace.

**What remained partial/incomplete:** Unit grouping is a frontend abstraction over lesson order rather than a persisted domain.

**Why this sprint belongs here:** The core learning path must exist before practice and assessment.

### Sprint 4 - Interactive Practice and Code Execution (`Feature`)
**Objective:** Turn lesson content into a hands-on practice experience.

**Functional scope:** Practice phase, editor, console, preview, run/reset flow, and practice validation messages.

**Technical scope:** Multi-language execution service, output/time limits, preview generation, starter-code strategy, and sample-output handling.

**Frontend scope:** Lesson practice panel, editor tabs, console/preview layout, and run assessment.

**Backend scope:** `/api/code/run`, execution wrappers, starter-code backfill, and lesson execution metadata.

**Deliverables:** End-to-end practice experience for backend and frontend languages.

**What was actually completed:** Fully completed with strong technical depth.

**What remained partial/incomplete:** Demo quality still depends on installed runtimes/compilers and environment preparation.

**Why this sprint belongs here:** This sprint naturally follows lesson delivery and precedes formal assessment.

### Sprint 5 - Assessment, Progress Tracking, and Motivation Loop (`Feature`)
**Objective:** Validate learning and transform activity into measurable progression.

**Functional scope:** Exercise attempts, answer checking, lesson completion rules, course summaries, streaks, leaderboard, resume logic, and dashboard/profile metrics.

**Technical scope:** Progress queries, completion gating, point calculation, React Query refresh/invalidation, and local resume storage.

**Frontend scope:** Exercises screen, completion states, leaderboard page, and progress-driven dashboard/profile metrics.

**Backend scope:** Exercise attempt controller, lesson progress service, progress summary controller, and leaderboard query/controller.

**Deliverables:** Real progression and motivation loop across content, practice, and ranking.

**What was actually completed:** Fully completed, then improved by later synchronization fixes.

**What remained partial/incomplete:** Automated backend verification originally depended on the database profile setup and was later stabilized by disabling PostgreSQL-only demo seed loading in the H2 test profile.

**Why this sprint belongs here:** This sprint gives academic weight to the platform beyond content display.

### Sprint 6 - Account Experience, Admin Operations, and Learning Resources (`Feature`)
**Objective:** Add account realism and operational management around the learning product.

**Functional scope:** Profile, preferred language, password change, account deletion, admin user management, and course attachment management.

**Technical scope:** Enriched user APIs, preference persistence, avatar API, attachment upload/download/delete, admin protections, and account-termination email.

**Frontend scope:** Profile page, settings page, and admin dashboard with user and attachment tabs.

**Backend scope:** User controller, preference controller, admin user controller, and attachment controllers/services.

**Deliverables:** Personal account space and back-office controls.

**What was actually completed:** Mostly completed for profile/settings, users, and attachments.

**What remained partial/incomplete:** Avatar upload is backend-only in current UI, student-facing attachments are not surfaced, and admin course/content management remains incomplete.

**Why this sprint belongs here:** This operational layer is best placed after the core learning loop exists.

### Sprint 7 - Guided Help and Realtime Collaboration Extensions (`Extension`)
**Objective:** Add contextual support and collaboration features beyond the essential learning loop.

**Functional scope:** Guided help during practice/exercises, global/course chat, and chat attachments.

**Technical scope:** Provider-backed hint generation with fallback, AI-safe prompt framing, STOMP WebSocket messaging, JWT channel auth, and retention scheduler.

**Frontend scope:** AI assistant drawer integrated into practice and exercises, and placeholder chat page/foundation.

**Backend scope:** AI endpoints/service, chat REST/WebSocket controllers, message persistence, room delivery, and retention cleanup.

**Deliverables:** Guided support and collaboration extension layer.

**What was actually completed:** Guided help is integrated and usable, and chat backend is real.

**What remained partial/incomplete:** Chat product exposure is still partial and should not be overstated.

**Why this sprint belongs here:** These are enhancement features that sit after the core product is already functional.

### Sprint 8 - Integration Hardening, UX Cleanup, and Demo Readiness (`Hardening`)
**Objective:** Stabilize the delivered product for defense, demos, and a more professional narrative.

**Functional scope:** Dashboard restructure, clearer resume path, settings cleanup, hiding unfinished chat exposure, safer demo path, CI/security/docs, and environment alignment.

**Technical scope:** Refresh-token flow, CORS hardening, auth rate limiting, schema compatibility, starter-code backfill, progress refresh fixes, design-system and typography cleanup.

**Frontend scope:** Refined dashboard/home, stronger design system, better error/empty states, and removal of misleading controls.

**Backend scope:** Auth hardening, compatibility initializers, admin/demo seeding, CI/dependabot/security policy, and test-profile stabilization.

**Deliverables:** Presentation-ready product with cleaner UX and safer operations.

**What was actually completed:** Much of this work is visible in the current workspace and README.

**What remained partial/incomplete:** Live demos still require toolchain/provider/env preparation.

**Why this sprint belongs here:** This is clearly late corrective and pre-defense work, not original feature delivery.

## 4. Feature-to-sprint mapping table
| Feature / module | Corrected sprint | Note |
| --- | --- | --- |
| Entities / domain model | Sprint 1 | Core persisted model and seeded academic content. |
| Auth / security | Sprint 2, hardened in Sprint 8 | Basic delivery first, refresh/CORS/rate-limit hardening later. |
| Languages / courses / lessons / exercises | Sprint 1-3 | Domain in Sprint 1, productized catalog and lesson flow in Sprint 3. |
| Course path / grouped units | Sprint 3 | Frontend learning-path abstraction over ordered lessons. |
| Lesson reader / markdown | Sprint 3 | Core student consumption flow. |
| Practice editor | Sprint 4 | Editor, preview, console, and challenge UX. |
| Code execution engine | Sprint 4 | Major backend subsystem with runtime/toolchain dependence. |
| Exercise submission and checking | Sprint 5 | Formal assessment layer. |
| Progress tracking | Sprint 5, refreshed in Sprint 8 | Completion rules and summaries, then later sync fixes. |
| Leaderboard | Sprint 5 | Motivation and ranking layer. |
| Dashboard / home | Sprint 5 core, reworked in Sprint 8 | Data-driven home exists, later restructured for clarity. |
| Profile / settings | Sprint 6 | Real account management with some backend-only remnants. |
| Attachments | Sprint 6 | Operationally real, but not fully learner-productized. |
| Admin | Sprint 6 | Users and attachments real; course CRUD incomplete. |
| Guided help | Sprint 7 | Present as guided support, not full AI assistant. |
| Chat | Sprint 7 | Infrastructure real; routed product experience partial/hidden. |
| Design system / typography cleanup | Sprint 8 | Late polish and presentation quality work. |
| Final pre-defense cleanup | Sprint 8 | Demo path, hiding unfinished features, env/security/readiness. |

## 5. Delivered vs partial vs future-work separation
### Delivered scope
- JWT-based authentication, role-based protection, and optional Google login.
- Public APIs for languages, courses, lessons, lesson summaries, and exercises.
- Course-path UX with grouped units, lesson reader, and recent resume flow.
- Practice editor with backend execution for compiled/interpreted languages and frontend preview for web lessons.
- Exercise attempts, lesson completion gating, progress summaries, leaderboard, and progress-driven dashboard/profile metrics.
- Real settings/profile controls for preferred language, password change, and account deletion.
- Admin user management and admin attachment operations.
- Guided help as contextual coaching with stable local fallback.

### Partial scope
- Chat backend and realtime infrastructure are implemented, but the visible routed product experience is still placeholder/hidden.
- Admin area does not yet provide full course/content management.
- Course attachments are operationally real but not surfaced to learners in the main current frontend journey.
- AI help is reliable only when framed as guided help; provider-backed behavior is optional and environment-dependent.
- Avatar upload exists backend-side but is not exposed in the current frontend.
- CI exists, but runtime demos still depend on environment/toolchain/provider alignment.

### Future improvements
- Full productized chat experience with visible rooms, message history UX, and deliberate exposure in navigation.
- Complete admin CRUD for courses, lessons, exercises, and attachments from one coherent admin surface.
- Learner-facing attachment access inside course/lesson pages.
- Frontend avatar management and password recovery/reset flow.
- More robust AI provider configuration, observability, and bounded prompt controls.
- Safer execution isolation and clearer runtime diagnostics for missing compilers/interpreters.
- Stronger automated backend verification across database profiles if the team later adopts PostgreSQL-backed integration tests or Testcontainers.

## 6. Report-ready sprint descriptions
### Sprint 1
This sprint established the technical and pedagogical foundation of UniCode Academy. The core entities of the platform were defined around users, languages, courses, lessons, exercises, and progress, and a seeded curriculum was prepared to support multiple programming tracks. This foundation explains why the project could later evolve into a coherent learning platform rather than a collection of isolated pages.

### Sprint 2
This sprint focused on secure access to the platform through authentication and role management. Registration, login, JWT-based protection, current-user retrieval, and optional Google login were implemented to secure student and administrator access. In the final repository, this area was later reinforced by refresh tokens, stronger validation, CORS hardening, and rate limiting.

### Sprint 3
This sprint delivered the main student learning journey from course discovery to lesson reading. The application exposes languages, courses, lesson summaries, and full lesson content, while the frontend organizes lessons into clear grouped units for a more guided path. It is academically more accurate to present this as a full learning-delivery sprint rather than a simple "courses and lessons" milestone.

### Sprint 4
This sprint introduced the interactive practice dimension of the platform. Students can edit code, run it through the backend execution service or a frontend preview, and validate the immediate result of their work. Because this subsystem spans editor UX, runtime execution, starter code, and validation feedback, it deserves its own major sprint in the project narrative.

### Sprint 5
This sprint connected learning activities to measurable progression. Exercise checking, lesson completion rules, course summaries, leaderboard logic, and progress-driven dashboard/profile indicators transformed the platform into a trackable educational product. Later corrective work mainly improved synchronization and refresh behavior rather than changing the underlying business scope.

### Sprint 6
This sprint extended the platform with account and operational capabilities. Students gained a real profile and settings area, while administrators received user-management and attachment-management functions needed for operating the platform. However, it should be stated clearly that admin content management and learner-facing attachment consumption remained incomplete.

### Sprint 7
This sprint added support-oriented extensions around the core learning loop. Guided help was integrated into practice and exercise contexts, with a design that safely falls back to local guidance when the external provider is unavailable. Realtime chat infrastructure was also implemented, but it remained only partially productized in the visible user experience.

### Sprint 8
This sprint corresponds to the late integration, polish, and demo-readiness phase. It includes dashboard restructuring, design-system cleanup, clearer user flows, authentication hardening, compatibility/backfill utilities, environment/demo guidance, and test-profile stabilization. In the report, this sprint should be presented as corrective and pre-defense stabilization work, not as a new functional delivery sprint.

## 7. Presentation-ready sprint bullets
### Sprint 1
- Built the platform foundation: entities, repositories, seeded multi-language course catalog.
- Prepared the academic learning model that all later features depend on.

### Sprint 2
- Implemented secure access with JWT, roles, and optional Google login.
- Later hardened auth with refresh tokens, CORS control, and rate limiting.

### Sprint 3
- Delivered the student learning path: courses, grouped units, and lesson reader.
- Turned raw lesson data into a guided navigation experience.

### Sprint 4
- Added hands-on practice with editor, console/preview, and execution engine.
- Supported both backend runtime execution and frontend preview-based practice.

### Sprint 5
- Connected exercises to progression, leaderboard, and measurable outcomes.
- Added completion logic, progress summaries, resume flow, and motivation signals.

### Sprint 6
- Added real profile/settings features and operational admin tools.
- User management and attachments are real; full admin content management is not.

### Sprint 7
- Integrated guided help into the learning flow with reliable fallback behavior.
- Implemented chat infrastructure, but kept it out of delivered core scope because product exposure is partial.

### Sprint 8
- Stabilized the application for demo and defense with UX and security hardening.
- Clarified the dashboard, reduced misleading UI, improved readiness/documentation, and stabilized the test profile.

## 8. Final recommendation: how many sprints should be presented and why
Present 8 sprints. This is the most academically defensible structure because it separates:

- Core feature delivery (`S1-S6`)
- Support/extension features that exist but are not equally productized (`S7`)
- Late corrective, UX, security, and demo-readiness work (`S8`)

Keeping only 6 sprints would hide real implemented domains such as admin, attachments, guided help, profile/settings, and final hardening, and it would overstate chat as if it were a fully delivered core milestone. The 8-sprint version matches the repository more truthfully, gives cleaner scope separation for the report and defense, and avoids claiming incomplete areas as finished product scope.

## Assumptions
- The audit is based on the current workspace, including working-tree implementation and polish work, because that is the version intended for PFA/reporting purposes.
- The git history is shallow, so sprint ordering is reconstructed mainly from domain dependencies, visible repository structure, and late hardening artifacts rather than from a detailed chronological commit trail.
- "AI" should be presented as guided help with local fallback, not as a full autonomous assistant.
- "Chat" should be presented as implemented infrastructure with partial product exposure, not as a central delivered feature.
- "Units" should be described as a frontend course-path abstraction over lessons, not as a persisted backend entity.
- Verification baseline for this audit: frontend production build passed, backend compile passed, and backend tests passed with the H2 test profile after disabling PostgreSQL-only demo seed execution during test runs.
