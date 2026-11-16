
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import TeachersDashboard from './pages/TeachersDashboard.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Courses from './pages/Courses.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import BecomeTeacher from './pages/BecomeTeacher.jsx'
import CourseDetails from './pages/CourseDetails.jsx'
import LearningSession from './pages/LearningSession.jsx'
import Checkout from './pages/Checkout.jsx'


function ProtectedRoute({ children, allowedRole }) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  const location = useLocation()

  const isDashboard = ['/admin', '/teacher', '/student'].includes(
    location.pathname
  )

  return (
    <>
      {!isDashboard && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/become-teacher" element={<BecomeTeacher />} />
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeachersDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/courses/:courseId" element={<CourseDetails />} />
        <Route path="/learning/:enrollmentId" element={<LearningSession />} />

        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
        path="/checkout/:courseId"
        element={
          <ProtectedRoute allowedRole="student">
            <Checkout />
          </ProtectedRoute>
        }
      />
      </Routes>
    </>
  )
}

export default App
