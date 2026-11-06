import { Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import TeachersDashboard from './pages/TeachersDashboard.jsx'
import Courses from './pages/Courses.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/teacher"
          element={<TeachersDashboard />}
        />
        <Route path="/courses" element={<Courses />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  )
}

export default App