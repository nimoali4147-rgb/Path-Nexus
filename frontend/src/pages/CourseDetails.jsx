
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  GraduationCap,
  PlayCircle,
  BarChart3,
} from 'lucide-react'

function CourseDetails() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [course, setCourse] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Load selected course
  useEffect(() => {
    async function loadCourse() {
      try {
        const response = await fetch(`/api/courses/${courseId}/`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error('Course could not be found.')
        }

        setCourse(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [courseId])

  // Check if student is already enrolled
  useEffect(() => {
    async function checkEnrollment() {
      if (!isAuthenticated || user?.role !== 'student') {
        return
      }

      try {
        const response = await fetch('/api/enrollments/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        })

        if (!response.ok) return

        const data = await response.json()
        const enrollments = Array.isArray(data)
          ? data
          : data.results || []

        const existing = enrollments.find(
          (item) => Number(item.course) === Number(courseId)
        )

        setEnrollment(existing || null)
      } catch (err) {
        console.error('Enrollment check failed:', err)
      }
    }

    checkEnrollment()
  }, [courseId, isAuthenticated, user])

  // Enroll in a free course
  async function handleEnroll() {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (user?.role !== 'student') {
      setError('Only students can enroll in courses.')
      return
    }

    if (enrollment) {
      navigate(`/learning/${enrollment.id}`)
      return
    }

    if (!course.is_free) {
      setError('This is a paid course. Payment is not available yet.')
      return
    }

    setBusy(true)
    setError('')

    try {
      const response = await fetch('/api/enrollments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
        body: JSON.stringify({
          course: course.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || data.course?.[0] || 'Enrollment failed.'
        )
      }

      setEnrollment(data)
      navigate(`/learning/${data.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 p-10 text-center text-stone-300">
        Loading course...
      </main>
    )
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-neutral-950 p-10 text-center text-red-400">
        {error || 'Course not found.'}
        <div className="mt-6">
          <Link to="/courses" className="text-amber-400">
            Back to Courses
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-12 text-stone-100 md:px-8">
      <div className="mx-auto max-w-5xl">

        <Link
          to="/courses"
          className="mb-8 inline-flex items-center gap-2 text-amber-400 hover:text-amber-300"
        >
          <ArrowLeft size={18} />
          Back to Courses
        </Link>

        <section className="overflow-hidden rounded-2xl border border-amber-400/20 bg-neutral-900">

          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-64 w-full object-cover md:h-80"
            />
          )}

          <div className="p-6 md:p-10">

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-400">
                {course.category}
              </span>

              <span className={`rounded-full px-4 py-2 text-sm ${
                course.is_free
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-amber-400/10 text-amber-400'
              }`}>
                {course.is_free ? 'Free Course' : 'Paid Course'}
              </span>
            </div>

            <h1 className="mb-5 text-3xl font-bold md:text-4xl">
              {course.title}
            </h1>

            <p className="mb-8 leading-8 text-stone-400">
              {course.description}
            </p>

            <div className="mb-8 grid grid-cols-1 gap-5 border-y border-neutral-800 py-7 sm:grid-cols-3">

              <div className="flex items-center gap-3">
                <BarChart3 className="text-amber-400" size={23} />
                <div>
                  <p className="text-sm text-stone-500">Level</p>
                  <p className="font-semibold">
                    {course.difficulty_level || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="text-amber-400" size={23} />
                <div>
                  <p className="text-sm text-stone-500">Duration</p>
                  <p className="font-semibold">
                    {course.duration_hours
                      ? `${course.duration_hours} hours`
                      : 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <GraduationCap className="text-amber-400" size={25} />
                <div>
                  <p className="text-sm text-stone-500">Teacher</p>
                  <p className="font-semibold">
                    {course.teacher_username || 'Course Teacher'}
                  </p>
                </div>
              </div>
            </div>

            {course.learning_objectives && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-bold">
                  What You Will Learn
                </h2>
                <p className="whitespace-pre-line leading-8 text-stone-400">
                  {course.learning_objectives}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-5 border-t border-neutral-800 pt-7 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm text-stone-400">Course Price</p>
                <p className="mt-1 text-2xl font-bold text-amber-400">
                  {course.is_free
                    ? 'Free'
                    : `KES ${Number(course.price).toLocaleString('en-KE')}`}
                </p>
              </div>

              <button
                onClick={handleEnroll}
                disabled={busy}
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-amber-400 px-7 py-4 font-bold text-neutral-950 transition hover:bg-amber-500 disabled:opacity-60"
              >
                {busy ? (
                  'Please wait...'
                ) : enrollment ? (
                  <>
                    <PlayCircle size={20} />
                    Continue Learning
                  </>
                ) : (
                  <>
                    <BookOpen size={20} />
                    {course.is_free ? 'Enroll Now' : 'Continue to Payment'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
                {error}
              </div>
            )}

          </div>
        </section>
      </div>
    </main>
  )
}

export default CourseDetails
