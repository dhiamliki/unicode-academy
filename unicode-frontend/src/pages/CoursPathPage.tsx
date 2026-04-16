import { getLessonSummaries } from "../api/courses";
import { useParams } from "react-router-dom";
import CoursePathView from "../components/CoursePathView";

export default function CoursPathPage() {
  const params = useParams<{ courseId: string }>();
  const requestedCourseId = Number(params.courseId);

  return (
    <CoursePathView
      requestedCourseId={Number.isFinite(requestedCourseId) ? requestedCourseId : undefined}
      loadLessons={getLessonSummaries}
    />
  );
}
