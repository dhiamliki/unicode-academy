import { getLessonSummaries } from "../api/courses";
import CoursePathView from "../components/CoursePathView";

export default function ApprendrePage() {
  return <CoursePathView loadLessons={getLessonSummaries} />;
}
