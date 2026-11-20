
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateCourseForm from '../components/CreateCourseForm'
import TeacherCourseModals from './TeacherCourseModals'

import {LayoutDashboard, BookOpen, Users,  GraduationCap,
  BookCheck, Clock3, Plus, Send, Sparkles, X,
  LogOut, Menu, RefreshCw, Eye, Pencil,Trash2,
} from 'lucide-react'

function TeachersDashboard() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])

  const [loading, setLoading] = useState(false)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [selectedCourse, setSelectedCourse] = useState(null)
  const [editingCourse, setEditingCourse] = useState(null)
  const [savingCourse, setSavingCourse] = useState(false)

  // Read the latest access token for every request.
  // This avoids keeping an expired token captured by the component.
  async function apiRequest(url, options = {}) {
    const token = localStorage.getItem('access')

    if (!token) {
      throw new Error('Your session has expired. Please sign in again.')
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body instanceof FormData
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const firstFieldError = Object.values(data).flat().find(
        (value) => typeof value === 'string'
      )
      throw new Error(
        data.detail ||
        data.message ||
        firstFieldError ||
        'Something went wrong. Please try again.'
      )
    }

    return data
  }


async function handleUnpublishCourse(course) {
  if (!window.confirm(`Unpublish "${course.title}"? Students already enrolled will keep access.`)) return

  try {
    setError('')
    setSuccess('')
    await apiRequest(`/api/courses/${course.id}/unpublish/`, { method: 'POST' })
    setSuccess('Course unpublished. Existing enrolled students keep access.')
    await fetchCourses()
  } catch (err) {
    setError(err.message)
  }
}

async function handleRepublishCourse(course) {
  try {
    setError('')
    setSuccess('')
    await apiRequest(`/api/courses/${course.id}/republish/`, { method: 'POST' })
    setSuccess('Course republished successfully.')
    await fetchCourses()
  } catch (err) {
    setError(err.message)
  }
}

  // Load teacher courses.
  async function fetchCourses() {
    try {
      setLoading(true)

      const data = await apiRequest('/api/courses/')
      setCourses(Array.isArray(data) ? data : data.results || [])
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load students enrolled in teacher courses.
  async function fetchStudents() {
    try {
      setStudentsLoading(true)

      const data = await apiRequest('/api/teacher/students/')
      setStudents(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setStudentsLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents()
    }
  }, [activeTab])

  function changeTab(tab) {
    setActiveTab(tab)
    setSidebarOpen(false)
    setShowForm(false)
    setSelectedCourse(null)
    setEditingCourse(null)
    setError('')
    setSuccess('')
  }

  function handleSignOut() {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('user')

    navigate('/')
    window.location.reload()
  }

  async function handleCourseCreated(newCourse) {
    setShowForm(false)
    setActiveTab('courses')
    setSuccess('Course created successfully. Refreshing your courses...')
    await fetchCourses()
  }

  // Submit a draft course for admin approval.
  async function handleSubmitForApproval(courseId) {
    try {
      setError('')
      setSuccess('')

      await apiRequest(`/api/courses/${courseId}/submit/`, {
        method: 'POST',
      })

      setSuccess('Your course has been submitted for approval.')
      await fetchCourses()
    } catch (err) {
      setError(err.message)
    }
  }

  // Open the edit form for a draft course.
  function startEditing(course) {
    setEditingCourse({
      id: course.id,
      title: course.title || '',
      description: course.description || '',
      category: course.category || '',
      price: course.price || '0',
      is_free: course.is_free,
      difficulty_level: course.difficulty_level || 'BEGINNER',
      duration_hours: course.duration_hours || '',
      learning_objectives: course.learning_objectives || '',
      thumbnail: null,
      video_file: null,
      youtube_url: course.youtube_url || '',
      currentThumbnail: course.thumbnail || '',
      currentVideo: course.video_file || '',
    })

    setSelectedCourse(null)
    setError('')
    setSuccess('')
  }

  // Save course changes in Django.
  async function handleUpdateCourse(event) {
    event.preventDefault()

    if (!editingCourse) return

    try {
      setSavingCourse(true)
      setError('')
      setSuccess('')

      const courseData = new FormData()
      courseData.append('title', editingCourse.title)
      courseData.append('description', editingCourse.description)
      courseData.append('category', editingCourse.category)
      courseData.append('price', editingCourse.is_free ? '0' : editingCourse.price)
      courseData.append('is_free', String(editingCourse.is_free))
      courseData.append('difficulty_level', editingCourse.difficulty_level)
      if (editingCourse.duration_hours !== '' && editingCourse.duration_hours != null) {
        courseData.append('duration_hours', editingCourse.duration_hours)
      }
      courseData.append('learning_objectives', editingCourse.learning_objectives)
      courseData.append('youtube_url', editingCourse.youtube_url || '')

      if (editingCourse.thumbnail) {
        courseData.append('thumbnail', editingCourse.thumbnail)
      }

      if (editingCourse.video_file) {
        courseData.append('video_file', editingCourse.video_file)
        courseData.append('youtube_url', '')
      }

      await apiRequest(`/api/courses/${editingCourse.id}/`, {
        method: 'PATCH',
        body: courseData,
      })

      setEditingCourse(null)
      setSuccess('Course updated successfully.')
      await fetchCourses()
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingCourse(false)
    }
  }

  // Delete a draft or rejected course.
  async function handleDeleteCourse(course) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${course.title}"?`
    )

    if (!confirmed) return

    try {
      setError('')
      setSuccess('')

      await apiRequest(`/api/courses/${course.id}/`, {
        method: 'DELETE',
      })

      setCourses((previous) =>
        previous.filter((item) => item.id !== course.id)
      )

      setSelectedCourse(null)
      setSuccess('Course deleted successfully.')
    } catch (err) {
      setError(err.message)
    }
  }

  const publishedCourses = courses.filter(
    (course) => course.status === 'PUBLISHED'
  ).length

  const pendingCourses = courses.filter(
    (course) => course.status === 'PENDING'
  ).length

  const draftCourses = courses.filter(
    (course) => course.status === 'DRAFT'
  ).length

  function statusStyle(status) {
    if (status === 'PUBLISHED') {
      return 'bg-green-500/10 text-green-400'
    }

    if (status === 'PENDING') {
      return 'bg-amber-400/10 text-amber-400'
    }

    if (status === 'UNPUBLISHED') {
      return 'bg-neutral-700 text-stone-300'
    }

    if (status === 'REJECTED') {
      return 'bg-red-500/10 text-red-400'
    }

    return 'bg-neutral-800 text-stone-400'
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-stone-100">

      {/* Mobile menu */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-neutral-800 p-3 text-amber-400 lg:hidden"
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-neutral-800 bg-neutral-900 p-6 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-neutral-950">
            <GraduationCap size={27} />
          </div>

          <div>
            <h2 className="text-xl font-bold">
              PATH<span className="text-amber-400">NEXUS</span>
            </h2>
            <p className="text-xs text-stone-500">Teacher Portal</p>
          </div>
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-500">
          Main Menu
        </p>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'courses', label: 'My Courses', icon: BookOpen },
            { id: 'students', label: 'Students', icon: Users },
          ].map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.id}
                onClick={() => changeTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                  activeTab === item.id
                    ? 'bg-amber-400 font-bold text-neutral-950'
                    : 'text-stone-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-neutral-800 pt-5">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      {/* Main dashboard */}
      <main className="min-h-screen p-5 pt-20 sm:p-8 sm:pt-20 lg:ml-72 lg:p-10">

        {/* Heading */}
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-3 text-xs font-bold tracking-[0.3em] text-amber-400">
              TEACHER PORTAL
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              {activeTab === 'overview'
                ? 'Dashboard Overview'
                : activeTab === 'courses'
                ? 'My Courses'
                : 'My Students'}
            </h1>

            <p className="mt-3 text-stone-400">
              Welcome to your PATH NEXUS teaching workspace.
            </p>
          </div>
          
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
            {success}
          </div>
        )}

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                <BookOpen size={25} className="mb-5 text-amber-400" />
                <p className="text-sm text-stone-400">Total Courses</p>
                <h2 className="mt-2 text-3xl font-bold">{courses.length}</h2>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                <BookCheck size={25} className="mb-5 text-green-400" />
                <p className="text-sm text-stone-400">Published Courses</p>
                <h2 className="mt-2 text-3xl font-bold text-green-400">
                  {publishedCourses}
                </h2>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                <Clock3 size={25} className="mb-5 text-amber-400" />
                <p className="text-sm text-stone-400">Pending Approval</p>
                <h2 className="mt-2 text-3xl font-bold text-amber-400">
                  {pendingCourses}
                </h2>
              </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                <p className="text-sm text-stone-400">Draft Courses</p>
                <h2 className="mt-2 text-3xl font-bold">{draftCourses}</h2>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                <p className="text-sm text-stone-400">Student Enrollments</p>
                <h2 className="mt-2 text-3xl font-bold text-amber-400">
                  {students.length}
                </h2>
                <p className="mt-1 text-xs text-stone-500">
                  Open Students to refresh enrollment data.
                </p>
              </div>
            </div>

            <div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-bold">Create a Course</h2>
                  <p className="mt-2 text-sm text-stone-400">
                    Share your knowledge with PATH NEXUS students.
                  </p>
                </div>

                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-bold text-neutral-950 hover:bg-amber-500"
                >
                  {showForm ? <X size={19} /> : <Plus size={19} />}
                  {showForm ? 'Cancel' : 'Create New Course'}
                </button>
              </div>

              {showForm && (
                <div className="mt-8 border-t border-neutral-800 pt-8">
                  <CreateCourseForm
                    onCourseCreated={handleCourseCreated}
                    onCancel={() => setShowForm(false)}
                  />
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Recent Courses</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Your latest course activity.
                  </p>
                </div>

                <button
                  onClick={() => changeTab('courses')}
                  className="text-sm text-amber-400 hover:underline"
                >
                  View all
                </button>
              </div>

              {courses.length === 0 ? (
                <p className="py-8 text-center text-stone-500">
                  You have not created any courses yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {courses.slice(0, 5).map((course) => (
                    <div
                      key={course.id}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <h3 className="font-semibold">{course.title}</h3>
                        <p className="mt-1 text-xs text-stone-500">
                          {course.category}
                        </p>
                      </div>

                      <span className={`w-fit rounded-full px-3 py-1 text-xs ${statusStyle(course.status)}`}>
                        {course.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* MY COURSES */}
        {activeTab === 'courses' && (
          <>
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold">Manage Your Courses</h2>
                <p className="mt-2 text-sm text-stone-500">
                  View, edit and manage your course submissions.
                </p>
              </div>

              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-bold text-neutral-950 hover:bg-amber-500"
              >
                {showForm ? <X size={18} /> : <Plus size={18} />}
                {showForm ? 'Cancel' : 'Create Course'}
              </button>
            </div>

            {showForm && (
              <div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                <CreateCourseForm
                  onCourseCreated={handleCourseCreated}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            {loading ? (
              <p className="py-10 text-center text-stone-400">
                Loading courses...
              </p>
            ) : courses.length === 0 ? (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-12 text-center">
                <BookOpen size={40} className="mx-auto mb-4 text-amber-400" />
                <h3 className="text-xl font-bold">No Courses Yet</h3>
                <p className="mt-2 text-sm text-stone-400">
                  Create your first course and start teaching.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                      <div className="flex gap-4">
                        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 sm:flex">
                          <GraduationCap size={25} />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold">{course.title}</h3>

                          <p className="mt-2 text-sm text-stone-400">
                            {course.description}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-400">
                              {course.category}
                            </span>

                            <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-stone-300">
                              {course.is_free ? 'Free' : 'Paid'}
                            </span>

                            {!course.is_free && (
                              <span className="py-1 text-xs text-stone-400">
                                KES {course.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-2 text-xs font-semibold ${statusStyle(course.status)}`}>
                          {course.status}
                        </span>

                        <button
                          onClick={() => setSelectedCourse(course)}
                          className="flex items-center gap-2 rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:border-amber-400 hover:text-amber-400"
                        >
                          <Eye size={16} />
                          View
                        </button>

                        {course.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleUnpublishCourse(course)}
                            className="rounded-lg border border-amber-500/30 px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/10"
                          >
                            Unpublish
                          </button>
                        )}

                        {course.status === 'UNPUBLISHED' && (
                          <button
                            onClick={() => handleRepublishCourse(course)}
                            className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-bold text-neutral-950 hover:bg-amber-500"
                          >
                            Republish
                          </button>
                        )}

                        {['DRAFT', 'REJECTED', 'PUBLISHED', 'UNPUBLISHED'].includes(course.status) && (
                          <button
                            onClick={() => startEditing(course)}
                            className="flex items-center gap-2 rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:border-amber-400 hover:text-amber-400"
                          >
                            <Pencil size={16} />
                            Edit
                          </button>
                        )}

                        {course.status === 'DRAFT' && (
                          <button
                            onClick={() => handleSubmitForApproval(course.id)}
                            className="flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-bold text-neutral-950 hover:bg-amber-500"
                          >
                            <Send size={16} />
                            Submit
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteCourse(course)}
                          className="flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>

                    {course.status === 'REJECTED' && course.rejection_reason && (
                      <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                        <p className="text-sm font-semibold text-red-400">
                          Admin Feedback
                        </p>
                        <p className="mt-2 text-sm text-stone-300">
                          {course.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* STUDENTS */}
        {activeTab === 'students' && (
          <>
            <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <Users size={27} className="mb-5 text-amber-400" />

              <p className="text-sm text-stone-400">
                Total Student Enrollments
              </p>

              <h2 className="mt-2 text-3xl font-bold text-amber-400">
                {students.length}
              </h2>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold">Enrolled Students</h2>
                <p className="mt-2 text-sm text-stone-400">
                  Students enrolled in your published courses.
                </p>
              </div>

              {studentsLoading ? (
                <p className="py-10 text-center text-stone-400">
                  Loading students...
                </p>
              ) : students.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-700 px-5 py-12 text-center">
                  <Users size={40} className="mx-auto mb-4 text-amber-400" />
                  <h3 className="font-bold">No Students Yet</h3>
                  <p className="mt-2 text-sm text-stone-500">
                    Students will appear here when they enroll in your published courses.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-neutral-800 text-stone-400">
                      <tr>
                        <th className="p-4">Student</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Course</th>
                        <th className="p-4">Enrolled</th>
                      </tr>
                    </thead>

                    <tbody>
                      {students.map((student) => (
                        <tr
                          key={student.id}
                          className="border-b border-neutral-800 last:border-0"
                        >
                          <td className="p-4 font-semibold">
                            {student.student_name}
                          </td>

                          <td className="p-4 text-stone-400">
                            {student.student_email}
                          </td>

                          <td className="p-4 text-amber-400">
                            {student.course_title}
                          </td>

                          <td className="p-4 text-stone-400">
                            {new Date(student.enrolled_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        <TeacherCourseModals
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          editingCourse={editingCourse}
          setEditingCourse={setEditingCourse}
          handleUpdateCourse={handleUpdateCourse}
          savingCourse={savingCourse}
        />

        {/* Bottom information */}
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          <Sparkles size={20} className="mt-0.5 shrink-0 text-amber-400" />

          <p className="text-sm leading-relaxed text-stone-400">
            Remember to submit your draft courses for admin approval.
            Approved courses will become available to students.
          </p>
        </div>
      </main>
    </div>
  )
}

export default TeachersDashboard
