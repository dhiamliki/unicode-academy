import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicOnlyRoute from "./auth/PublicOnlyRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import SearchPage from "./pages/Search";
import Courses from "./pages/Courses";
import Attachments from "./pages/Attachments";
import CourseDetails from "./pages/CourseDetails";
import LessonDetails from "./pages/LessonDetails";
import Account from "./pages/Account";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import ProtectedLayout from "./auth/ProtectedLayout";
import AdminUsers from "./pages/AdminUsers";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Navigate to="/" replace />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/attachments" element={<Attachments />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/lessons/:lessonId" element={<LessonDetails />} />
          <Route path="/account" element={<Account />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

