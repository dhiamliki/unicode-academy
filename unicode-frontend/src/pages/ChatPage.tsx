import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { getCourses } from "../api/courses";
import ChatWidget from "../components/ChatWidget";
import { queryKeys } from "../lib/queryKeys";
import { getErrorMessage } from "../utils/errorMessage";

export default function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCourseId = Number(searchParams.get("courseId"));

  const coursesQuery = useQuery({
    queryKey: queryKeys.courses(),
    queryFn: () => getCourses(),
  });

  useEffect(() => {
    if (coursesQuery.error) {
      toast.error(getErrorMessage(coursesQuery.error, "Impossible de charger les salons de cours."));
    }
  }, [coursesQuery.error]);

  const courses = coursesQuery.data ?? [];
  const selectedCourseId = useMemo(() => {
    if (!Number.isFinite(requestedCourseId)) {
      return null;
    }

    return courses.some((course) => course.id === requestedCourseId) ? requestedCourseId : null;
  }, [courses, requestedCourseId]);
  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId]
  );

  return (
    <div className="page page-stack">
      <section className="card content-section">
        <div className="section-head">
          <div className="page-stack" style={{ gap: 6 }}>
            <p className="section-kicker">Discussion</p>
            <h1 className="section-title">
              {selectedCourseId ? "Salon du cours" : "Salon global"}
            </h1>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <label htmlFor="chat-room-select" className="field-label" style={{ marginBottom: 0 }}>
              Salon
            </label>
            <select
              id="chat-room-select"
              className="field"
              style={{ minWidth: 240 }}
              value={selectedCourseId ?? ""}
              onChange={(event) => {
                const nextValue = event.target.value;
                const nextParams = new URLSearchParams(searchParams);
                if (!nextValue) {
                  nextParams.delete("courseId");
                } else {
                  nextParams.set("courseId", nextValue);
                }
                setSearchParams(nextParams, { replace: true });
              }}
            >
              <option value="">Salon global</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-muted">
          {selectedCourseId
            ? "Tu ecris maintenant dans le salon lie a ce parcours. Les fichiers envoyes ici restent associes a ce cours."
            : "Le salon global reste ouvert a toute la plateforme. Choisis un cours pour passer dans un salon cible."}
        </p>
      </section>

      <ChatWidget
        variant="page"
        courseId={selectedCourseId}
        roomName={selectedCourse?.title ?? undefined}
      />
    </div>
  );
}
