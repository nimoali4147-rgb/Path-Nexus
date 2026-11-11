
import { useState, useEffect } from 'react'
import CreateCourseForm from '../components/CreateCourseForm'
import {
  BookOpen,
  BookCheck,
  Clock3,
  Plus,
  GraduationCap,
  ArrowRight,
  Send,
  Sparkles,
  X,
} from 'lucide-react'

function TeachersDashboard() {
  const [showForm, setShowForm] = useState(false)
  const [courses, setCourses] = useState([])

  // Fetch teacher's courses from Django
  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    try {
      const response = await fetch('/api/courses/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }

      const data = await response.json()
      setCourses(Array.isArray(data) ? data : data.results || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  // Receive newly created course from CreateCourseForm
  function handleCourseCreated(newCourse) {
    setCourses((previousCourses) => [
      ...previousCourses,
      newCourse,
    ])

    setShowForm(false)
  }

  // Submit draft course for admin approval
  async function handleSubmitForApproval(courseId) {
    try {
      const response = await fetch(`/api/courses/${courseId}/submit/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || JSON.stringify(data) || 'Failed to submit course'
        )
      }

      alert('Success! Your course has been submitted for admin approval.')

      // Refresh courses to show the updated status
      await fetchCourses()

    } catch (error) {
      console.error('Submission error:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const publishedCourses = courses.filter(
    (item) => item.status === 'PUBLISHED'
  ).length

  const pendingCourses = courses.filter(
    (item) => item.status === 'PENDING'
  ).length

  return (
    <div className="min-h-screen bg-neutral-950 text-stone-100 p-6 md:p-10">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">

          <div>

            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-full px-4 py-2 mb-4">
              <Sparkles size={15} />
              <span className="text-xs font-semibold tracking-wider">
                TEACHER PORTAL
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold">
              Teacher Dashboard
            </h1>

            <p className="text-stone-400 mt-3 max-w-xl">
              Manage your courses, share your knowledge and track your
              teaching activities.
            </p>

          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-amber-400/10"
          >
            {showForm ? (
              <>
                <X size={19} />
                Cancel
              </>
            ) : (
              <>
                <Plus size={20} />
                Create New Course
              </>
            )}
          </button>

        </div>

        {/* Create Course Form */}
        {showForm && (
          <div className="mb-10">
            <CreateCourseForm
              onCourseCreated={handleCourseCreated}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Statistics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

          {/* Total Courses */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-amber-400/30 transition">

            <div className="flex items-center justify-between mb-5">

              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                <BookOpen size={24} />
              </div>

              <span className="text-xs text-stone-500 uppercase tracking-wider">
                All Courses
              </span>

            </div>

            <p className="text-stone-400 text-sm">
              Total Courses
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {courses.length}
            </h2>

          </div>

          {/* Published Courses */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-green-500/30 transition">

            <div className="flex items-center justify-between mb-5">

              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                <BookCheck size={24} />
              </div>

              <span className="text-xs text-stone-500 uppercase tracking-wider">
                Live Courses
              </span>

            </div>

            <p className="text-stone-400 text-sm">
              Published Courses
            </p>

            <h2 className="text-3xl font-bold mt-2 text-green-400">
              {publishedCourses}
            </h2>

          </div>

          {/* Pending Courses */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-amber-400/30 transition">

            <div className="flex items-center justify-between mb-5">

              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                <Clock3 size={24} />
              </div>

              <span className="text-xs text-stone-500 uppercase tracking-wider">
                Under Review
              </span>

            </div>

            <p className="text-stone-400 text-sm">
              Pending Approval
            </p>

            <h2 className="text-3xl font-bold mt-2 text-amber-400">
              {pendingCourses}
            </h2>

          </div>

        </section>

        {/* My Courses */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">

            <div>
              <h2 className="text-2xl font-bold">
                My Courses
              </h2>

              <p className="text-sm text-stone-500 mt-1">
                Manage your created courses and their approval status.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-amber-400">
              <GraduationCap size={19} />
              {courses.length} Total
            </div>

          </div>

          {/* Empty State */}
          {courses.length === 0 ? (

            <div className="text-center py-14 px-5 border border-dashed border-neutral-700 rounded-xl">

              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 rounded-2xl bg-amber-400/10 border border-amber-400/20">
                <BookOpen size={36} className="text-amber-400" />
              </div>

              <h3 className="text-xl font-bold mb-3">
                No Courses Yet
              </h3>

              <p className="text-stone-400 max-w-md mx-auto mb-7">
                Create your first course and start sharing your knowledge
                with students on PATH NEXUS.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 px-6 py-3 rounded-xl font-bold transition"
              >
                <Plus size={19} />
                Create Your First Course
              </button>

            </div>

          ) : (

            /* Course List */
            <div className="space-y-4">

              {courses.map((item) => (

                <div
                  key={item.id}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 md:p-6 transition hover:border-amber-400/30"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

                    {/* Course Information */}
                    <div className="flex gap-4">

                      <div className="hidden sm:flex w-12 h-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                        <GraduationCap size={25} />
                      </div>

                      <div className="min-w-0">

                        <h3 className="text-lg md:text-xl font-bold text-stone-100">
                          {item.title}
                        </h3>

                        <p className="text-stone-400 text-sm mt-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-4">

                          <span className="text-xs bg-amber-400/10 text-amber-400 px-3 py-1.5 rounded-full">
                            {item.category}
                          </span>

                          <span className="text-xs bg-neutral-800 text-stone-300 px-3 py-1.5 rounded-full">
                            {item.is_free ? 'Free' : 'Paid'}
                          </span>

                          {!item.is_free && (
                            <span className="text-xs text-stone-400">
                              KES {item.price}
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                    {/* Course Status and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:shrink-0">

                      <span className={`text-xs font-semibold px-3 py-2 rounded-full text-center ${
                        item.status === 'PUBLISHED'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : item.status === 'PENDING'
                          ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                          : item.status === 'REJECTED'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-neutral-800 text-stone-400 border border-neutral-700'
                      }`}>
                        {item.status}
                      </span>

                      {item.status === 'DRAFT' && (
                        <button
                          onClick={() => handleSubmitForApproval(item.id)}
                          className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 px-4 py-2.5 rounded-lg text-sm font-bold transition"
                        >
                          <Send size={16} />
                          Submit for Approval
                        </button>
                      )}

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* Bottom Information */}
        <div className="mt-8 flex items-start gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-5">

          <Sparkles size={20} className="text-amber-400 shrink-0 mt-0.5" />

          <p className="text-sm text-stone-400 leading-relaxed">
            Remember: Submit your draft courses for admin approval.
            Once approved, your courses can become available to students.
          </p>

        </div>

      </div>
    </div>
  )
}

export default TeachersDashboard
