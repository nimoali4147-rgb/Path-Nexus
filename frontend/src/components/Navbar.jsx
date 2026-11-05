
import { useState } from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-5">

        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="text-2xl font-bold">
            PATH<span className="text-purple-500">NEXUS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className="hover:text-purple-400 transition">
              Home
            </Link>

            <Link to="/courses" className="hover:text-purple-400 transition">
              Courses
            </Link>

            <Link to="/about" className="hover:text-purple-400 transition">
              About Us
            </Link>

            <Link to="/become-teacher" className="hover:text-purple-400 transition">
              Become a Teacher
            </Link>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-5">
            <Link to="/login" className="hover:text-purple-400 transition">
              Sign In
            </Link>

            <Link
              to="/register"
              className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-lg font-semibold transition"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-3xl text-white focus:outline-none"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? '×' : '☰'}
          </button>

        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="lg:hidden mt-6 pb-4 border-t border-slate-800 pt-5 flex flex-col gap-5">

            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="hover:text-purple-400"
            >
              Home
            </Link>

            <Link
              to="/courses"
              onClick={() => setMenuOpen(false)}
              className="hover:text-purple-400"
            >
              Courses
            </Link>

            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="hover:text-purple-400"
            >
              About Us
            </Link>

            <Link
              to="/become-teacher"
              onClick={() => setMenuOpen(false)}
              className="hover:text-purple-500"
            >
              Become a Teacher
            </Link>

            <hr className="border-slate-800" />

            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="hover:text-purple-500"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="bg-purple-600 hover:bg-purple-700 text-center px-5 py-3 rounded-lg font-semibold"
            >
              Get Started
            </Link>

          </div>
        )}

      </div>
    </nav>
  )
}

export default Navbar
