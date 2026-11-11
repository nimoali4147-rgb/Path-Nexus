
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const displayName =
    user?.first_name ||
    user?.username ||
    user?.name ||
    user?.email?.split('@')[0] ||
    'User'

  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  function handleLogout() {
    logout()
    setProfileOpen(false)
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className="relative z-50 border-b border-amber-600/20 bg-neutral-950 text-stone-100 shadow-lg shadow-black/20">
      <div className="mx-auto max-w-7xl px-6 py-4">

        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold tracking-wide text-stone-100 transition hover:opacity-80"
          >
            PATH<span className="text-amber-400">NEXUS</span>
            <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.35em] text-stone-500">
              Learn. Build. Grow.
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 lg:flex">
            <Link
              to="/"
              className="text-sm font-medium text-stone-300 transition hover:text-amber-400"
            >
              Home
            </Link>

            <Link
              to="/courses"
              className="text-sm font-medium text-stone-300 transition hover:text-amber-400"
            >
              Courses
            </Link>

            <Link
              to="/about"
              className="text-sm font-medium text-stone-300 transition hover:text-amber-400"
            >
              About Us
            </Link>

            {!isAuthenticated && (
              <Link
                to="/become-teacher"
                className="text-sm font-medium text-stone-300 transition hover:text-amber-400"
              >
                Become a Teacher
              </Link>
            )}
          </div>

          {/* Desktop Authentication */}
          <div className="hidden items-center gap-5 lg:flex">

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-stone-300 transition hover:text-amber-400"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="rounded-lg bg-amber-400 px-5 py-3 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-400/10 transition hover:bg-amber-500"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="relative">

                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 rounded-xl border border-amber-600/20 bg-neutral-900 px-3 py-2 transition hover:border-amber-500/50 hover:bg-neutral-800"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 font-bold text-neutral-950">
                    {initials}
                  </div>

                  <div className="text-left">
                    <p className="font-semibold text-stone-100">
                      {displayName}
                    </p>
                    <p className="text-xs capitalize text-amber-500">
                      {user?.role || 'User'}
                    </p>
                  </div>

                  <span className="text-xs text-amber-500">
                    {profileOpen ? '▲' : '▼'}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-60 overflow-hidden rounded-xl border border-amber-600/20 bg-neutral-900 shadow-2xl shadow-black/40">

                    <div className="border-b border-amber-600/20 px-4 py-4">
                      <p className="font-semibold text-stone-100">
                        {displayName}
                      </p>
                      <p className="mt-1 break-all text-sm text-stone-400">
                        {user?.email}
                      </p>
                    </div>

                    {user?.role === 'student' && (
                      <Link
                        to="/student"
                        onClick={() => setProfileOpen(false)}
                        className="block px-5 py-3 text-sm text-stone-300 transition hover:bg-neutral-800 hover:text-amber-500"
                      >
                        Student Dashboard
                      </Link>
                    )}

                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                      >
                        Logout
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}

          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-amber-600/20 bg-neutral-900 px-3 py-2 text-2xl text-amber-500 transition hover:border-amber-500/50 lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? '×' : '☰'}
          </button>

        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="mt-5 flex flex-col gap-5 border-t border-amber-600/20 pt-5 pb-4 lg:hidden">

            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="font-medium text-stone-300 transition hover:text-amber-500"
            >
              Home
            </Link>

            <Link
              to="/courses"
              onClick={() => setMenuOpen(false)}
              className="font-medium text-stone-300 transition hover:text-amber-500"
            >
              Courses
            </Link>

            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="font-medium text-stone-300 transition hover:text-amber-500"
            >
              About Us
            </Link>

            {!isAuthenticated ? (
              <>
                <Link
                  to="/become-teacher"
                  onClick={() => setMenuOpen(false)}
                  className="font-medium text-stone-300 transition hover:text-amber-500"
                >
                  Become a Teacher
                </Link>

                <div className="border-t border-amber-600/20" />

                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="font-semibold text-stone-300 transition hover:text-amber-500"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg bg-amber-500 px-5 py-3 text-center font-bold text-neutral-950 transition hover:bg-amber-600"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 border-t border-amber-600/20 pt-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 font-bold text-neutral-950">
                    {initials}
                  </div>

                  <div>
                    <p className="font-semibold text-stone-100">
                      {displayName}
                    </p>
                    <p className="text-sm capitalize text-amber-500">
                      {user?.role}
                    </p>
                  </div>
                </div>

                {user?.role === 'student' && (
                  <Link
                    to="/student"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-stone-300 transition hover:bg-neutral-800 hover:text-amber-500"
                  >
                    Student Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="rounded-lg px-4 py-2 text-left font-medium text-red-400 transition hover:bg-red-500/10"
                >
                  Logout
                </button>
              </>
            )}

          </div>
        )}

      </div>
    </nav>
  )
}

export default Navbar
