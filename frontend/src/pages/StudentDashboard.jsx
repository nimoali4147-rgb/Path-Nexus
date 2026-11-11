
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  GraduationCap,
  BookOpen,
  Clock3,
  ArrowRight,
  Sparkles,
  BookMarked,
  Compass,
  TrendingUp,
} from 'lucide-react'

function StudentDashboard() {
  const { user, accessToken } = useAuth()

  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const displayName =
    user?.first_name ||
    user?.username ||
    user?.name ||
    'Student'

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const response = await fetch('/api/enrollments/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (!response.ok) {
          throw new Error('Unable to load your enrolled courses.')
        }

        const data = await response.json()

        setEnrollments(Array.isArray(data) ? data : data.results || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (accessToken) {
      fetchEnrollments()
    }
  }, [accessToken])

  return (
    <div className="min-h-screen bg-neutral-950 text-stone-100 px-6 py-10">

      <div className="max-w-7xl mx-auto">

        {/* Welcome Section */}
        <section className="relative overflow-hidden bg-neutral-900 border border-amber-600/20 rounded-2xl p-8 md:p-10 mb-10">

          <div className="absolute -top-24 -right-20 w-72 h-72 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">

            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-full px-4 py-2 mb-5">
              <Sparkles size={15} />
              <span className="text-xs font-semibold tracking-wider">
                STUDENT DASHBOARD
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              Welcome back,{' '}
              <span className="text-amber-400">{displayName}!</span>
            </h1>

            <p className="text-stone-400 mt-4 max-w-2xl leading-relaxed">
              Continue learning, explore new skills and grow your knowledge.
              Your next learning milestone starts here.
            </p>

            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 px-6 py-3 rounded-xl font-bold mt-7 transition shadow-lg shadow-amber-400/10"
            >
              Explore Courses
              <ArrowRight size={18} />
            </Link>

          </div>

          <div className="absolute bottom-6 right-10 hidden md:flex items-center justify-center w-32 h-32 rounded-full bg-amber-400/5 border border-amber-400/10">
            <GraduationCap size={65} className="text-amber-400/40" />
          </div>

        </section>

        {/* Statistics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">

          {/* Enrolled Courses */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-amber-400/30 transition">

            <div className="flex items-center justify-between mb-5">

              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                <BookOpen size={24} />
              </div>

              <span className="text-xs text-stone-500 uppercase tracking-wider">
                Learning
              </span>

            </div>

            <p className="text-stone-400 text-sm">
              Enrolled Courses
            </p>

            <h2 className="text-3xl font-bold mt-2 text-stone-100">
              {enrollments.length}
            </h2>

            <p className="text-xs text-stone-500 mt-2">
              Total courses enrolled
            </p>

          </div>

          {/* Learning Status */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-amber-400/30 transition">

            <div className="flex items-center justify-between mb-5">

              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                <TrendingUp size={24} />
              </div>

              <span className="text-xs text-stone-500 uppercase tracking-wider">
                Progress
              </span>

            </div>

            <p className="text-stone-400 text-sm">
              Learning Status
            </p>

            <h2 className="text-xl font-bold mt-3 text-amber-400">
              {enrollments.length > 0
                ? 'Learning in Progress'
                : 'Ready to Start'}
            </h2>

            <p className="text-xs text-stone-500 mt-2">
              {enrollments.length > 0
                ? 'Keep building your knowledge.'
                : 'Your learning journey awaits.'}
            </p>

          </div>

        </section>

        {/* My Courses */}
        <section>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-7">

            <div>
              <h2 className="text-2xl font-bold">
                My Courses
              </h2>

              <p className="text-stone-500 text-sm mt-1">
                Continue with your enrolled courses.
              </p>
            </div>

            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-500 font-semibold text-sm transition"
            >
              Browse Courses
              <ArrowRight size={17} />
            </Link>

          </div>

          {/* Loading */}
          {loading ? (

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl py-14 text-center">

              <div className="w-10 h-10 border-4 border-neutral-700 border-t-amber-400 rounded-full animate-spin mx-auto mb-5" />

              <p className="text-stone-400">
                Loading your courses...
              </p>

            </div>

          ) : error ? (

            /* Error */
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-xl">
              {error}
            </div>

          ) : enrollments.length === 0 ? (

            /* Empty State */
            <div className="bg-neutral-900 border border-amber-600/20 rounded-2xl text-center py-14 px-6">

              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 rounded-2xl bg-amber-400/10 border border-amber-400/20">
                <BookMarked size={36} className="text-amber-400" />
              </div>

              <h3 className="text-xl font-bold mb-3">
                Your Learning Journey Starts Here
              </h3>

              <p className="text-stone-400 mb-7 max-w-md mx-auto leading-relaxed">
                You haven't enrolled in any courses yet. Discover courses
                and start building valuable skills today.
              </p>

              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 px-6 py-3 rounded-xl font-bold transition"
              >
                Explore Courses
                <ArrowRight size={18} />
              </Link>

            </div>

          ) : (

            /* Enrolled Courses */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {enrollments.map((enrollment) => (

                <div
                  key={enrollment.id}
                  className="group bg-neutral-900 border border-neutral-800 rounded-2xl p-6 transition hover:border-amber-400/40 hover:-translate-y-1"
                >

                  <div className="flex items-center justify-between mb-6">

                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 group-hover:bg-amber-400 group-hover:text-neutral-950 transition">
                      <GraduationCap size={25} />
                    </div>

                    <span className="text-xs bg-amber-400/10 border border-amber-400/20 text-amber-400 px-3 py-2 rounded-full">
                      Enrolled
                    </span>

                  </div>

                  <h3 className="text-xl font-bold mb-4 group-hover:text-amber-400 transition">
                    {enrollment.course_title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <Clock3 size={16} />

                    <span>
                      Enrolled on:{' '}
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="border-t border-neutral-800 mt-6 pt-5">
                    <div className="flex items-center gap-2 text-sm text-stone-400">
                      <BookOpen size={16} />
                      <span>Part of your learning journey</span>
                    </div>
                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* Explore More */}
        <section className="mt-12 bg-neutral-900 border border-neutral-800 rounded-2xl p-7 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
              <Compass size={25} />
            </div>

            <div>
              <h3 className="font-bold text-lg">
                Ready to learn something new?
              </h3>

              <p className="text-sm text-stone-400 mt-1">
                Explore more courses and discover new opportunities.
              </p>
            </div>

          </div>

          <Link
            to="/courses"
            className="inline-flex items-center justify-center gap-2 border border-amber-400/40 text-amber-400 hover:bg-amber-400 hover:text-neutral-950 px-5 py-3 rounded-xl font-semibold transition"
          >
            Discover Courses
            <ArrowRight size={17} />
          </Link>

        </section>

      </div>
    </div>
  )
}

export default StudentDashboard
