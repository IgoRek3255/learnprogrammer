import { Routes, Route } from 'react-router-dom';
import { useAuth } from './store/authContext.jsx';
import Layout from './components/Layout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import CourseDetailPage from './pages/CourseDetailPage.jsx';
import TopicDetailPage from './pages/TopicDetailPage.jsx';
import ExercisePage from './pages/ExercisePage.jsx';
import TopicManagerPage from './pages/TopicManagerPage.jsx';
import ExerciseManagerPage from './pages/ExerciseManagerPage.jsx';
import CourseManagerPage from './pages/CourseManagerPage.jsx';
import TestManagerPage from './pages/TestManagerPage.jsx';
import TestPage from './pages/TestPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AIAssistantPage from './pages/AIAssistantPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="lg" text="Завантаження..." />;
  }

  return (
    <Layout>
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId"
          element={
            <ProtectedRoute>
              <CourseDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId/topics/:topicId"
          element={
            <ProtectedRoute>
              <TopicDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exercises/:exerciseId"
          element={
            <ProtectedRoute>
              <ExercisePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute roles={['ADMIN', 'TEACHER']}>
              <CourseManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/topics/:courseId"
          element={
            <ProtectedRoute roles={['ADMIN', 'TEACHER']}>
              <TopicManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/exercises/:topicId"
          element={
            <ProtectedRoute roles={['ADMIN', 'TEACHER']}>
              <ExerciseManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tests/:courseId"
          element={
            <ProtectedRoute roles={['ADMIN', 'TEACHER']}>
              <TestManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tests/:testId"
          element={
            <ProtectedRoute>
              <TestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['ADMIN', 'TEACHER']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <AIAssistantPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </ErrorBoundary>
    </Layout>
  );
}
