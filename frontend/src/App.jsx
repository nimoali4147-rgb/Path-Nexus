
import { Routes, Route, Navigate } from 'react-router-dom'

import { useAuth } from './context/AuthContext.jsx'

import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import TeachersDashboard from './pages/TeachersDashboard.jsx'
import Courses from './pages/Courses.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
 import BecomeTeacher from './pages/BecomeTeacher'

// Protect pages according to authentication and role
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
  return (
    <>
      <Navbar />

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Teacher Dashboard */}
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
     <Route
        path="/become-teacher"
        element={<BecomeTeacher />}
      />
      </Routes>
    </>
  )
}

export default App
