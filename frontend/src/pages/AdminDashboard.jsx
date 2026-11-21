
import { useCallback, useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  ClipboardList,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Search,
  LogOut,
  UserRound,
  Trash2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiJson } from '../service/apiService'

const API = {
  overview: '/api/auth/admin/overview/',
  users: '/api/auth/admin/users/',
  teachers: '/api/teachers/',
  students: '/api/students/',
  courses: '/api/courses/',
  enrollments: '/api/auth/admin/enrollments/',
  payments: '/api/payments/admin/',
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'students', label: 'Students', icon: UserRound },
  { id: 'teachers', label: 'Teachers', icon: GraduationCap },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'enrollments', label: 'Enrollments', icon: ClipboardList },
  { id: 'payments', label: 'Payments', icon: CreditCard },
]

function getList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.users)) return data.users
  if (Array.isArray(data?.students)) return data.students
  if (Array.isArray(data?.teachers)) return data.teachers
  if (Array.isArray(data?.courses)) return data.courses
  if (Array.isArray(data?.enrollments)) return data.enrollments
  if (Array.isArray(data?.payments)) return data.payments

  return []
}

function getUsername(item) {
  return (
    item?.username ||
    item?.user?.username ||
    item?.student_username ||
    item?.student?.username ||
    '—'
  )
}

function getEmail(item) {
  return item?.email || item?.user?.email || '—'
}

function AdminDashboard() {
  const { accessToken, logout } = useAuth()

  const [activeTab, setActiveTab] = useState('overview')
  const [overview, setOverview] = useState({})
  const [users, setUsers] = useState([])
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [payments, setPayments] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const request = useCallback(async (url, options = {}) => {
    if (!accessToken) {
      throw new Error('Your session has expired. Please sign in again.')
    }

    return apiJson(url, options)
  }, [accessToken])

  const loadDashboard = useCallback(async () => {
    if (!accessToken) {
      setError('Please sign in again.')
      return
    }

    setLoading(true)
    setError('')

    const endpoints = [
      { key: 'overview', url: API.overview },
      { key: 'users', url: API.users },
      { key: 'teachers', url: API.teachers },
      { key: 'students', url: API.students },
      { key: 'courses', url: API.courses },
      { key: 'enrollments', url: API.enrollments },
      { key: 'payments', url: API.payments },
    ]

    try {
      const results = await Promise.allSettled(
        endpoints.map(({ url }) => request(url))
      )

      const failures = []

      results.forEach((result, index) => {
        const key = endpoints[index].key

        if (result.status === 'rejected') {
          failures.push({
            endpoint: key,
            message: result.reason?.message || 'Request failed',
          })
          return
        }

        const data = result.value

        switch (key) {
          case 'overview':
            setOverview(data || {})
            break
          case 'users':
            setUsers(getList(data))
            break
          case 'teachers':
            setTeachers(getList(data))
            break
          case 'students':
            setStudents(getList(data))
            break
          case 'courses':
            setCourses(getList(data))
            break
          case 'enrollments':
            setEnrollments(getList(data))
            break
          case 'payments':
            setPayments(getList(data))
            break
          default:
            break
        }
      })

      if (failures.length) {
        setError(
          failures
            .map((item) => `${item.endpoint}: ${item.message}`)
            .join(' | ')
        )
      }
    } catch (err) {
      setError(err.message || 'Could not load dashboard.')
    } finally {
      setLoading(false)
    }
  }, [accessToken, request])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDashboard()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadDashboard])

  async function performAction(
    url,
    method = 'PATCH',
    body = null,
    successMessage = 'Action completed successfully.'
  ) {
    setError('')
    setSuccess('')

    try {
      await request(url, {
        method,
        ...(body !== null
          ? { body: JSON.stringify(body) }
          : {}),
      })

      setSuccess(successMessage)
      await loadDashboard()
    } catch (err) {
      setError(err.message || 'The action could not be completed.')
    }
  }

  function deleteTeacher(teacher) {
    const teacherName = getUsername(teacher)

    if (
      !window.confirm(
        `Permanently delete teacher ${teacherName}? Their courses and related records may also be deleted. This cannot be undone.`
      )
    ) {
      return
    }

    performAction(
      `${API.teachers}${teacher.id}/`,
      'DELETE',
      null,
      `Teacher ${teacherName} was deleted.`
    )
  }

  function deleteStudent(student) {
    const studentName = getUsername(student)

    if (
      !window.confirm(
        `Permanently delete student ${studentName}? Their enrollments and related payment records may also be deleted. This cannot be undone.`
      )
    ) {
      return
    }

    performAction(
      `${API.students}${student.id}/`,
      'DELETE',
      null,
      `Student ${studentName} was deleted.`
    )
  }

  function deleteCourse(course) {
    if (
      !window.confirm(
        `Permanently delete course "${course.title}"? Its enrollments, lessons and related payment records may also be deleted. This cannot be undone.`
      )
    ) {
      return
    }

    performAction(
      `${API.courses}${course.id}/`,
      'DELETE',
      null,
      `Course "${course.title}" was deleted.`
    )
  }

  function updateUserStatus(user) {
    const currentStatus =
      user.account_status ||
      (user.is_active ? 'ACTIVE' : 'SUSPENDED')

    const nextStatus =
      currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'

    if (
      !window.confirm(
        `Change ${user.username}'s account status to ${nextStatus}?`
      )
    ) {
      return
    }

    performAction(
      `${API.users}${user.id}/status/`,
      'PATCH',
      { account_status: nextStatus }
    )
  }

  function filtered(items, fields) {
    const query = search.toLowerCase().trim()

    if (!query) return items

    return items.filter((item) =>
      fields.some((field) => {
        const value = field
          .split('.')
          .reduce((result, key) => result?.[key], item)

        return String(value ?? '')
          .toLowerCase()
          .includes(query)
      })
    )
  }

  const pendingCourses = courses.filter(
    (course) => course.status === 'PENDING'
  )

  const pendingTeachers = teachers.filter(
    (teacher) => teacher.verification_status === 'PENDING'
  )

  const stats = [
    {
      label: 'Total Users',
      value: overview.total_users ?? users.length,
      icon: Users,
    },
    {
      label: 'Students',
      value: overview.total_students ?? students.length,
      icon: GraduationCap,
    },
    {
      label: 'Teachers',
      value: overview.total_teachers ?? teachers.length,
      icon: UserRound,
    },
    {
      label: 'Total Courses',
      value: overview.total_courses ?? courses.length,
      icon: BookOpen,
    },
    {
      label: 'Pending Courses',
      value: overview.pending_courses ?? pendingCourses.length,
      icon: ClipboardList,
    },
    {
      label: 'Enrollments',
      value: overview.total_enrollments ?? enrollments.length,
      icon: CheckCircle,
    },
  ]

  function renderEmpty(message = 'No records available.') {
    return (
      <tr>
        <td
          colSpan="10"
          className="p-10 text-center text-sm text-stone-500"
        >
          {message}
        </td>
      </tr>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-stone-100">
      <div className="mx-auto flex max-w-[1600px] flex-col md:flex-row">

        {/* Sidebar */}
        <aside className="w-full border-b border-neutral-800 bg-neutral-900 p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-neutral-950">
                <ShieldCheck size={25} />
              </div>

              <div>
                <h2 className="font-bold tracking-wide">
                  PATH<span className="text-amber-400">NEXUS</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Administration
                </p>
              </div>
            </div>
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-500">
            Management
          </p>

          <nav className="flex gap-2 overflow-x-auto md:flex-col">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id)
                  setSearch('')
                  setError('')
                  setSuccess('')
                }}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  activeTab === id
                    ? 'bg-amber-400 text-neutral-950'
                    : 'text-stone-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>

          <button
            onClick={logout}
            className="mt-8 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 p-5 md:p-9">
          <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
                Admin Control Centre
              </p>

              <h1 className="text-3xl font-bold">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </h1>

              <p className="mt-2 text-sm text-stone-500">
                Manage and monitor your PATH NEXUS platform.
              </p>
            </div>

          </header>

          {error && (
            <div className="mb-5 break-words rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
              {success}
            </div>
          )}

          {loading && (
            <p className="mb-5 text-sm text-amber-400">
              Loading dashboard data...
            </p>
          )}

          {/* Overview */}
          {activeTab === 'overview' && (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {stats.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className="rounded-xl bg-amber-400/10 p-3 text-amber-400">
                        <Icon size={23} />
                      </div>

                      <span className="text-xs uppercase tracking-wider text-stone-500">
                        Platform
                      </span>
                    </div>

                    <p className="text-sm text-stone-400">{label}</p>
                    <p className="mt-2 text-3xl font-bold">{value}</p>
                  </div>
                ))}
              </section>

              <section className="mt-8 grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                  <h2 className="mb-5 text-lg font-bold">
                    Needs attention
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-400">
                        Pending teacher applications
                      </span>
                      <span className="font-bold text-amber-400">
                        {pendingTeachers.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-400">
                        Courses awaiting approval
                      </span>
                      <span className="font-bold text-amber-400">
                        {pendingCourses.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                  <h2 className="mb-5 text-lg font-bold">
                    Payment summary
                  </h2>

                  <p className="text-sm text-stone-400">
                    Total revenue
                  </p>

                  <p className="mt-2 text-3xl font-bold text-amber-400">
                    KES {Number(
                      overview.total_revenue ?? 0
                    ).toLocaleString()}
                  </p>

                  <p className="mt-3 text-xs text-stone-500">
                    Based on successful payments returned by the API.
                  </p>
                </div>
              </section>
            </>
          )}

          {/* Management tables */}
          {activeTab !== 'overview' && (
            <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
              <div className="flex flex-col gap-4 border-b border-neutral-800 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    {tabs.find((tab) => tab.id === activeTab)?.label}
                  </h2>

                  <p className="mt-1 text-xs text-stone-500">
                    Review and manage platform records.
                  </p>
                </div>

                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search records..."
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-amber-400 sm:w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">

                {/* Users */}
                {activeTab === 'users' && (
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="bg-neutral-950 text-xs uppercase text-stone-500">
                      <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered(users, ['username', 'email', 'role']).map((user) => (
                        <tr key={user.id} className="border-t border-neutral-800">
                          <td className="p-4 font-semibold">
                            {user.username}
                          </td>

                          <td className="p-4 text-stone-400">
                            {user.email}
                          </td>

                          <td className="p-4 capitalize">
                            {user.role}
                          </td>

                          <td className="p-4">
                            {user.account_status ||
                              (user.is_active ? 'ACTIVE' : 'SUSPENDED')}
                          </td>

                          <td className="p-4">
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => updateUserStatus(user)}
                                className="rounded-lg border border-amber-400/30 px-3 py-2 text-xs text-amber-400 hover:bg-amber-400/10"
                              >
                                {user.account_status === 'ACTIVE'
                                  ? 'Suspend'
                                  : 'Activate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}

                      {filtered(users, ['username', 'email', 'role']).length === 0 &&
                        renderEmpty()}
                    </tbody>
                  </table>
                )}

                {/* Students */}
                {activeTab === 'students' && (
                  <table className="w-full min-w-[750px] text-left text-sm">
                    <thead className="bg-neutral-950 text-xs uppercase text-stone-500">
                      <tr>
                        <th className="p-4">Student</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Profile ID</th>
                        <th className="p-4">Joined</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered(
                        students,
                        ['username', 'user.username', 'user.email']
                      ).map((student) => (
                        <tr key={student.id} className="border-t border-neutral-800">
                          <td className="p-4 font-semibold">
                            {getUsername(student)}
                          </td>

                          <td className="p-4 text-stone-400">
                            {getEmail(student)}
                          </td>

                          <td className="p-4">{student.id}</td>

                          <td className="p-4 text-stone-400">
                            {student.created_at
                              ? new Date(student.created_at).toLocaleDateString()
                              : '—'}
                          </td>

                          <td className="p-4">
                            <button
                              onClick={() => deleteStudent(student)}
                              title="Delete student"
                              className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filtered(
                        students,
                        ['username', 'user.username', 'user.email']
                      ).length === 0 && renderEmpty()}
                    </tbody>
                  </table>
                )}

                {/* Teachers */}
                {activeTab === 'teachers' && (
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="bg-neutral-950 text-xs uppercase text-stone-500">
                      <tr>
                        <th className="p-4">Teacher</th>
                        <th className="p-4">Qualifications</th>
                        <th className="p-4">Verification</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered(
                        teachers,
                        ['username', 'qualifications', 'verification_status']
                      ).map((teacher) => (
                        <tr key={teacher.id} className="border-t border-neutral-800">
                          <td className="p-4 font-semibold">
                            {teacher.username || '—'}
                          </td>

                          <td className="p-4 text-stone-400">
                            {teacher.qualifications || 'Not provided'}
                          </td>

                          <td className="p-4">
                            {teacher.verification_status}
                          </td>

                          <td className="p-4">
                            <div className="flex flex-wrap items-center gap-2">
                              {teacher.verification_status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() =>
                                      performAction(
                                        `${API.teachers}${teacher.id}/verify/`
                                      )
                                    }
                                    title="Verify teacher"
                                    className="rounded-lg bg-green-500/10 p-2 text-green-400 hover:bg-green-500/20"
                                  >
                                    <CheckCircle size={17} />
                                  </button>

                                  <button
                                    onClick={() =>
                                      performAction(
                                        `${API.teachers}${teacher.id}/reject/`
                                      )
                                    }
                                    title="Reject teacher"
                                    className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                                  >
                                    <XCircle size={17} />
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => deleteTeacher(teacher)}
                                title="Delete teacher and their courses"
                                className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                              >
                                <Trash2 size={15} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filtered(
                        teachers,
                        ['username', 'qualifications', 'verification_status']
                      ).length === 0 && renderEmpty()}
                    </tbody>
                  </table>
                )}

                {/* Courses */}
                {activeTab === 'courses' && (
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="bg-neutral-950 text-xs uppercase text-stone-500">
                      <tr>
                        <th className="p-4">Course</th>
                        <th className="p-4">Teacher</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered(
                        courses,
                        ['title', 'teacher_username', 'status']
                      ).map((course) => (
                        <tr key={course.id} className="border-t border-neutral-800">
                          <td className="p-4 font-semibold">
                            {course.title}
                          </td>

                          <td className="p-4 text-stone-400">
                            {course.teacher_username || '—'}
                          </td>

                          <td className="p-4">
                            {course.is_free
                              ? 'Free'
                              : `KES ${course.price}`}
                          </td>

                          <td className="p-4">{course.status}</td>

                          <td className="p-4">
                            <div className="flex flex-wrap items-center gap-2">
                              {course.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() =>
                                      performAction(
                                        `${API.courses}${course.id}/approve/`
                                      )
                                    }
                                    className="rounded-lg bg-green-500/10 px-3 py-2 text-xs text-green-400 hover:bg-green-500/20"
                                  >
                                    Approve
                                  </button>

                                  <button
                                    onClick={() =>
                                      performAction(
                                        `${API.courses}${course.id}/reject/`
                                      )
                                    }
                                    className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => deleteCourse(course)}
                                title="Delete course"
                                className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                              >
                                <Trash2 size={15} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filtered(
                        courses,
                        ['title', 'teacher_username', 'status']
                      ).length === 0 && renderEmpty()}
                    </tbody>
                  </table>
                )}

                {/* Enrollments */}
                {activeTab === 'enrollments' && (
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="bg-neutral-950 text-xs uppercase text-stone-500">
                      <tr>
                        <th className="p-4">Student</th>
                        <th className="p-4">Course</th>
                        <th className="p-4">Enrolled</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered(
                        enrollments,
                        ['student_username', 'course_title']
                      ).map((item) => (
                        <tr key={item.id} className="border-t border-neutral-800">
                          <td className="p-4">
                            {item.student_username || item.student || '—'}
                          </td>

                          <td className="p-4">
                            {item.course_title || item.course || '—'}
                          </td>

                          <td className="p-4 text-stone-400">
                            {item.enrolled_at
                              ? new Date(item.enrolled_at).toLocaleDateString()
                              : '—'}
                          </td>
                        </tr>
                      ))}

                      {filtered(
                        enrollments,
                        ['student_username', 'course_title']
                      ).length === 0 && renderEmpty()}
                    </tbody>
                  </table>
                )}

                {/* Payments */}
                {activeTab === 'payments' && (
                  <table className="w-full min-w-[750px] text-left text-sm">
                    <thead className="bg-neutral-950 text-xs uppercase text-stone-500">
                      <tr>
                        <th className="p-4">Student</th>
                        <th className="p-4">Course</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">M-Pesa Receipt</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered(
                        payments,
                        ['student_username', 'course_title', 'mpesa_receipt_number', 'status']
                      ).map((payment) => (
                        <tr key={payment.id} className="border-t border-neutral-800">
                          <td className="p-4">
                            {payment.student_username || payment.student || '—'}
                          </td>

                          <td className="p-4">
                            {payment.course_title || payment.course || '—'}
                          </td>

                          <td className="p-4">
                            KES {payment.amount}
                          </td>

                          <td className="p-4 text-stone-400">
                            {payment.mpesa_receipt_number || '—'}
                          </td>

                          <td className="p-4">
                            {payment.status}
                          </td>
                        </tr>
                      ))}

                      {filtered(
                        payments,
                        ['student_username', 'course_title', 'mpesa_receipt_number', 'status']
                      ).length === 0 && renderEmpty()}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
