
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
  RefreshCw,
  ShieldCheck,
  Search,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

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
  { id: 'teachers', label: 'Teachers', icon: GraduationCap },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'enrollments', label: 'Enrollments', icon: ClipboardList },
  { id: 'payments', label: 'Payments', icon: CreditCard },
]

function getList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.users)) return data.users
  if (Array.isArray(data?.enrollments)) return data.enrollments
  if (Array.isArray(data?.payments)) return data.payments
  return []
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
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })

    const data = response.status === 204 ? null : await response.json()

    if (!response.ok) {
      throw new Error(
        data?.detail ||
        data?.message ||
        JSON.stringify(data) ||
        'The request could not be completed.'
      )
    }

    return data
  }, [accessToken])

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const results = await Promise.allSettled([
        request(API.overview),
        request(API.users),
        request(API.teachers),
        request(API.students),
        request(API.courses),
        request(API.enrollments),
        request(API.payments),
      ])

      const [summary, userData, teacherData, studentData,
        courseData, enrollmentData, paymentData] = results

      if (summary.status === 'fulfilled') setOverview(summary.value || {})
      if (userData.status === 'fulfilled') setUsers(getList(userData.value))
      if (teacherData.status === 'fulfilled') setTeachers(getList(teacherData.value))
      if (studentData.status === 'fulfilled') setStudents(getList(studentData.value))
      if (courseData.status === 'fulfilled') setCourses(getList(courseData.value))
      if (enrollmentData.status === 'fulfilled') setEnrollments(getList(enrollmentData.value))
      if (paymentData.status === 'fulfilled') setPayments(getList(paymentData.value))

      const failed = results.filter((item) => item.status === 'rejected')
      if (failed.length) {
        setError(
          'Some dashboard sections could not load. Check that the corresponding admin API endpoints are available.'
        )
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  async function performAction(url, method = 'PATCH', body = null) {
    setError('')
    setSuccess('')

    try {
      await request(url, {
        method,
        ...(body ? { body: JSON.stringify(body) } : {}),
      })

      setSuccess('Action completed successfully.')
      await loadDashboard()
    } catch (err) {
      setError(err.message)
    }
  }

  function updateUserStatus(user) {
    const nextStatus = user.account_status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'

    if (!window.confirm(`Change this user's status to ${nextStatus}?`)) return

    performAction(`${API.users}${user.id}/status/`, 'PATCH', {
      account_status: nextStatus,
    })
  }

  function deleteProfile(type, id) {
    const label = type === 'teachers' ? 'teacher' : 'student'

    if (!window.confirm(`Are you sure you want to delete this ${label} account?`)) {
      return
    }

    const url = type === 'teachers'
      ? `${API.teachers}${id}/`
      : `${API.students}${id}/`

    performAction(url, 'DELETE')
  }

  function filtered(items, fields) {
    const query = search.toLowerCase().trim()
    if (!query) return items

    return items.filter((item) =>
      fields.some((field) =>
        String(field.split('.').reduce((value, key) => value?.[key], item) ?? '')
          .toLowerCase()
          .includes(query)
      )
    )
  }

  const pendingCourses = courses.filter((course) => course.status === 'PENDING')
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
      icon: Users,
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
                <p className="text-xs text-stone-500">Administration</p>
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

            <button
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold transition hover:border-amber-400 hover:text-amber-400 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh data
            </button>
          </header>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
              {success}
            </div>
          )}

          {loading && (
            <p className="mb-5 text-sm text-amber-400">Loading dashboard data...</p>
          )}

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
                  <h2 className="mb-5 text-lg font-bold">Needs attention</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-400">Pending teacher applications</span>
                      <span className="font-bold text-amber-400">{pendingTeachers.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-400">Courses awaiting approval</span>
                      <span className="font-bold text-amber-400">{pendingCourses.length}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                  <h2 className="mb-5 text-lg font-bold">Payment summary</h2>
                  <p className="text-sm text-stone-400">Total revenue</p>
                  <p className="mt-2 text-3xl font-bold text-amber-400">
                    KES {Number(overview.total_revenue ?? 0).toLocaleString()}
                  </p>
                  <p className="mt-3 text-xs text-stone-500">
                    Based on the amount returned by the admin overview API.
                  </p>
                </div>
              </section>
            </>
          )}

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
                          <td className="p-4 font-semibold">{user.username}</td>
                          <td className="p-4 text-stone-400">{user.email}</td>
                          <td className="p-4 capitalize">{user.role}</td>
                          <td className="p-4">{user.account_status || (user.is_active ? 'ACTIVE' : 'INACTIVE')}</td>
                          <td className="p-4">
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => updateUserStatus(user)}
                                className="rounded-lg border border-amber-400/30 px-3 py-2 text-xs text-amber-400 hover:bg-amber-400/10"
                              >
                                {user.account_status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

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
                      {filtered(teachers, ['username', 'qualifications', 'verification_status']).map((teacher) => (
                        <tr key={teacher.id} className="border-t border-neutral-800">
                          <td className="p-4 font-semibold">{teacher.username}</td>
                          <td className="p-4 text-stone-400">{teacher.qualifications || 'Not provided'}</td>
                          <td className="p-4">{teacher.verification_status}</td>
                          <td className="flex gap-2 p-4">
                            {teacher.verification_status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => performAction(`${API.teachers}${teacher.id}/verify/`)}
                                  title="Verify teacher"
                                  className="rounded-lg bg-green-500/10 p-2 text-green-400 hover:bg-green-500/20"
                                >
                                  <CheckCircle size={17} />
                                </button>
                                <button
                                  onClick={() => performAction(`${API.teachers}${teacher.id}/reject/`)}
                                  title="Reject teacher"
                                  className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                                >
                                  <XCircle size={17} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => deleteProfile('teachers', teacher.id)}
                              title="Delete teacher"
                              className="rounded-lg border border-neutral-700 p-2 text-stone-400 hover:text-red-400"
                            >
                              <XCircle size={17} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

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
                      {filtered(courses, ['title', 'teacher_username', 'status']).map((course) => (
                        <tr key={course.id} className="border-t border-neutral-800">
                          <td className="p-4 font-semibold">{course.title}</td>
                          <td className="p-4 text-stone-400">{course.teacher_username || '—'}</td>
                          <td className="p-4">{course.is_free ? 'Free' : `KES ${course.price}`}</td>
                          <td className="p-4">{course.status}</td>
                          <td className="flex gap-2 p-4">
                            {course.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => performAction(`${API.courses}${course.id}/approve/`)}
                                  className="rounded-lg bg-green-500/10 px-3 py-2 text-xs text-green-400 hover:bg-green-500/20"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => performAction(`${API.courses}${course.id}/reject/`)}
                                  className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

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
                      {filtered(enrollments, ['student_username', 'course_title']).map((item) => (
                        <tr key={item.id} className="border-t border-neutral-800">
                          <td className="p-4">{item.student_username || item.student || '—'}</td>
                          <td className="p-4">{item.course_title || item.course || '—'}</td>
                          <td className="p-4 text-stone-400">
                            {item.enrolled_at ? new Date(item.enrolled_at).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

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
                      {filtered(payments, ['student_username', 'course_title', 'mpesa_receipt_number', 'status']).map((payment) => (
                        <tr key={payment.id} className="border-t border-neutral-800">
                          <td className="p-4">{payment.student_username || payment.student || '—'}</td>
                          <td className="p-4">{payment.course_title || payment.course || '—'}</td>
                          <td className="p-4">KES {payment.amount}</td>
                          <td className="p-4 text-stone-400">{payment.mpesa_receipt_number || '—'}</td>
                          <td className="p-4">{payment.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {(
                  (activeTab === 'users' && users.length === 0) ||
                  (activeTab === 'teachers' && teachers.length === 0) ||
                  (activeTab === 'courses' && courses.length === 0) ||
                  (activeTab === 'enrollments' && enrollments.length === 0) ||
                  (activeTab === 'payments' && payments.length === 0)
                ) && (
                  <p className="p-10 text-center text-sm text-stone-500">
                    No records available.
                  </p>
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
