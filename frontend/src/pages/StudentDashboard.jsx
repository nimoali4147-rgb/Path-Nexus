
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Clock3,
  ArrowRight,
  Sparkles,
  PlayCircle,
  Menu,
  X,
  LogOut,
  RefreshCw,
  BookMarked,
  Search,
  UserRound,
  Settings,
  Save,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Bell,
  LockKeyhole,
} from 'lucide-react'

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'courses', label: 'My Learning', icon: BookOpen },
  { id: 'profile', label: 'My Profile', icon: UserRound },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function StudentDashboard() {
  const navigate = useNavigate()
  const { user, accessToken, refreshAccessToken, logout } = useAuth()

  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [enrollments, setEnrollments] = useState([])
  const [profile, setProfile] = useState(null)
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [error, setError] = useState('')
  const [profileError, setProfileError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [preferences, setPreferences] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('studentPreferences') ||
        '{"courseReminders":true,"productUpdates":false}'
      )
    } catch {
      return { courseReminders: true, productUpdates: false }
    }
  })

  const displayName =
    user?.first_name ||
    user?.username ||
    user?.name ||
    user?.email?.split('@')[0] ||
    'Student'

  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    displayName

  const initials = fullName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const apiRequest = useCallback(async (url, options = {}) => {
    let token = accessToken

    const send = (currentToken) =>
      fetch(url, {
        ...options,
        headers: {
          ...(options.body instanceof FormData
            ? {}
            : { 'Content-Type': 'application/json' }),
          ...options.headers,
          Authorization: `Bearer ${currentToken}`,
        },
      })

    let response = await send(token)

    if (response.status === 401 && refreshAccessToken) {
      token = await refreshAccessToken()
      if (token) response = await send(token)
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const detail =
        data.detail ||
        data.message ||
        Object.values(data).flat().join(' ')

      throw new Error(
        detail || 'Something went wrong. Please try again.'
      )
    }

    return data
  }, [accessToken, refreshAccessToken])

  const fetchDashboardData = useCallback(async (showRefresh = false) => {
    if (!accessToken) {
      setEnrollments([])
      setProfile(null)
      setLoading(false)
      setProfileLoading(false)
      return
    }

    if (showRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
      setProfileLoading(true)
    }

    setError('')
    setProfileError('')

    const [enrollmentResult, profileResult] =
      await Promise.allSettled([
        apiRequest('/api/enrollments/'),
        apiRequest('/api/students/me/'),
      ])

    if (enrollmentResult.status === 'fulfilled') {
      const data = enrollmentResult.value
      setEnrollments(
        Array.isArray(data) ? data : data.results || []
      )
    } else {
      setError(
        enrollmentResult.reason?.message ||
        'We could not load your courses.'
      )
    }

    if (profileResult.status === 'fulfilled') {
      setProfile(profileResult.value)
      setBio(profileResult.value.bio || '')
    } else {
      setProfileError(
        profileResult.reason?.message ||
        'We could not load your profile.'
      )
    }

    setLoading(false)
    setProfileLoading(false)
    setRefreshing(false)
  }, [accessToken, apiRequest])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const filteredEnrollments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) return enrollments

    return enrollments.filter((enrollment) =>
      (enrollment.course_title || '')
        .toLowerCase()
        .includes(query)
    )
  }, [enrollments, searchTerm])

  function changeTab(tab) {
    setActiveTab(tab)
    setSidebarOpen(false)
    setSuccessMessage('')
    setProfileError('')
    setSearchTerm('')
  }

  function handleSignOut() {
    logout()
    navigate('/')
  }

  function formatDate(value) {
    if (!value) return 'Not available'

    const date = new Date(value)

    return Number.isNaN(date.getTime())
      ? 'Not available'
      : date.toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
  }

async function handleSaveProfile(event) {
  event.preventDefault()

  setSavingProfile(true)
  setProfileError('')
  setSuccessMessage('')

  try {
    const updated = await apiRequest('/api/students/me/', {
      method: 'PATCH',
      body: JSON.stringify({ bio }),
    })

    setProfile(updated)
    setBio(updated.bio || '')

    // Close the edit form after successful saving
    setIsEditingProfile(false)

    setSuccessMessage('Your profile has been updated successfully.')
  } catch (err) {
    setProfileError(
      err.message || 'Unable to save your profile.'
    )
  } finally {
    setSavingProfile(false)
  }
}

  function updatePreference(key, checked) {
    const next = { ...preferences, [key]: checked }

    setPreferences(next)
    localStorage.setItem(
      'studentPreferences',
      JSON.stringify(next)
    )
  }

  function renderCourseCards() {
    if (loading) {
      return (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-12 text-center text-stone-400">
          <RefreshCw
            className="mx-auto mb-3 animate-spin text-amber-400"
            size={24}
          />
          Loading your courses...
        </div>
      )
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
          <p>{error}</p>
          <button
            onClick={() => fetchDashboardData(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-400/30 px-4 py-2 text-sm font-semibold hover:bg-red-500/10"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      )
    }

    if (filteredEnrollments.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/70 px-6 py-14 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
            <BookMarked size={32} />
          </div>

          <h3 className="text-xl font-bold text-stone-100">
            {searchTerm
              ? 'No matching courses'
              : 'Your learning journey starts here'}
          </h3>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-400">
            {searchTerm
              ? 'Try another course title or clear your search.'
              : "You haven't enrolled in any courses yet. Explore the course catalogue to find your first course."}
          </p>

          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-6 rounded-xl border border-neutral-700 px-5 py-3 text-sm font-semibold hover:border-amber-400 hover:text-amber-400"
            >
              Clear search
            </button>
          ) : (
            <Link
              to="/courses"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-bold text-neutral-950 hover:bg-amber-500"
            >
              Explore Courses <ArrowRight size={17} />
            </Link>
          )}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {filteredEnrollments.map((enrollment) => (
          <article
            key={enrollment.id}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition hover:border-amber-400/30 sm:p-6"
          >
           {enrollment.course_thumbnail ? (
              <img
                src={enrollment.course_thumbnail}
                alt={enrollment.course_title || "Course thumbnail"}
                className="mb-5 h-40 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="mb-5 flex h-40 w-full items-center justify-center rounded-xl bg-neutral-800">
                <GraduationCap size={40} className="text-amber-400" />
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
                <GraduationCap size={28} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                    Enrolled
                  </span>

                  <span className="text-xs text-stone-500">
                    Course #{enrollment.course}
                  </span>
                </div>

                <h3 className="mt-3 break-words text-lg font-bold text-stone-100">
                  {enrollment.course_title || 'Your course'}
                </h3>

                <div className="mt-3 flex items-center gap-2 text-xs text-stone-500">
                  <Clock3 size={14} />
                  Enrolled {formatDate(enrollment.enrolled_at)}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-neutral-800 pt-5">
              {typeof enrollment.progress_percentage === 'number' && (
                <div className="mb-4">
                  <div className="mb-2 flex justify-between text-xs text-stone-500">
                    <span>Learning progress</span>
                    <span>{enrollment.progress_percentage}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, enrollment.progress_percentage)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <p className="mb-4 text-sm text-stone-400">
                Continue learning whenever you're ready.
              </p>

              <Link
                to={`/learning/${enrollment.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 font-bold text-neutral-950 transition hover:bg-amber-500"
              >
                <PlayCircle size={18} />
                Continue Learning
                <ArrowRight size={17} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-stone-100">

      {/* Mobile menu */}
      <button
        type="button"
        onClick={() => setSidebarOpen((open) => !open)}
        aria-label="Toggle dashboard menu"
        className="fixed left-4 top-4 z-[60] rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-amber-400 shadow-lg lg:hidden"
      >
        {sidebarOpen ? <X size={21} /> : <Menu size={21} />}
      </button>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-neutral-800 bg-neutral-900 p-6 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <Link
          to="/"
          className="mb-10 flex items-center gap-3"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-neutral-950">
            <GraduationCap size={27} />
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight">
              PATH<span className="text-amber-400">NEXUS</span>
            </h2>
            <p className="text-xs text-stone-500">Student Portal</p>
          </div>
        </Link>

        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-500">
          Learning Workspace
        </p>

        <nav className="flex-1 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = activeTab === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => changeTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition ${
                  active
                    ? 'bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/10'
                    : 'text-stone-400 hover:bg-neutral-800 hover:text-amber-400'
                }`}
              >
                <Icon size={20} />
                {item.label}

                {item.id === 'courses' && enrollments.length > 0 && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs ${
                      active
                        ? 'bg-neutral-950/10'
                        : 'bg-neutral-800 text-stone-400'
                    }`}
                  >
                    {enrollments.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={19} />
            Sign Out
          </button>
      </aside>

      {/* Main content */}
      <main className="min-h-screen px-5 pb-10 pt-20 sm:px-8 lg:ml-72 lg:px-10 lg:pt-8">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <header className="mb-9 flex flex-col gap-5 border-b border-neutral-800 pb-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-amber-400">
                <Sparkles size={14} />
                <span className="text-[11px] font-semibold tracking-widest">
                  STUDENT WORKSPACE
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {activeTab === 'overview'
                  ? `Welcome back, ${displayName}!`
                  : activeTab === 'courses'
                    ? 'My Learning'
                    : activeTab === 'profile'
                      ? 'My Profile'
                      : 'Settings'}
              </h1>

              <p className="mt-2 text-sm text-stone-400 sm:text-base">
                {activeTab === 'overview'
                  ? 'Your learning space. Pick up where you left off.'
                  : activeTab === 'courses'
                    ? 'Manage and continue your enrolled courses.'
                    : activeTab === 'profile'
                      ? 'Manage your personal profile information.'
                      : 'Manage your account and learning preferences.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => changeTab('profile')}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-left transition hover:border-amber-400/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-neutral-950">
                  {initials}
                </div>

                <div className="min-w-0">
                  <p className="max-w-36 truncate text-sm font-semibold">
                    {fullName}
                  </p>
                  <p className="max-w-36 truncate text-xs text-stone-500">
                    {user?.email || 'Student account'}
                  </p>
                </div>

                <ChevronRight size={16} className="text-stone-500" />
              </button>
            </div>
          </header>

          {/* Overview */}
          {activeTab === 'overview' && (
            <>
              <section className="relative mb-8 overflow-hidden rounded-2xl border border-amber-600/20 bg-neutral-900 p-7 sm:p-9">
                <div className="relative z-10 max-w-2xl">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400">
                    <Sparkles size={16} />
                    YOUR LEARNING JOURNEY
                  </span>

                  <h2 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl">
                    Learn at your pace. Build skills for your future.
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-stone-400">
                    Continue your courses and keep building your knowledge.
                  </p>

                  <button
                    type="button"
                    onClick={() => changeTab('courses')}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-bold text-neutral-950 transition hover:bg-amber-500"
                  >
                    Go to My Learning
                    <ArrowRight size={17} />
                  </button>
                </div>

                <div className="absolute -bottom-10 -right-5 hidden h-48 w-48 items-center justify-center rounded-full border border-amber-400/10 bg-amber-400/5 text-amber-400/30 md:flex">
                  <GraduationCap size={92} />
                </div>
              </section>

              {/* Simple learning summary */}
                 <section className="mb-9 grid grid-cols-1 gap-5">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                      <BookOpen size={23} />
                    </div>
                    <span className="text-xs uppercase tracking-wider text-stone-500">
                      Learning Library
                    </span>
                  </div>

                  <p className="text-sm text-stone-400">Enrolled Courses</p>
                  <p className="mt-2 text-3xl font-bold">
                    {loading ? '—' : enrollments.length}
                  </p>
                  <p className="mt-2 text-xs text-stone-500">
                    Courses in your library
                  </p>
                </div>
              </section>

              <section>
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Continue Learning</h2>
                    <p className="mt-1 text-sm text-stone-500">
                      Jump back into one of your enrolled courses.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => changeTab('courses')}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300"
                  >
                    View my learning <ArrowRight size={16} />
                  </button>
                </div>

                {renderCourseCards()}
              </section>
            </>
          )}

          {/* My Learning */}
          {activeTab === 'courses' && (
            <section>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    Your Learning Library
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    All courses you have enrolled in.
                  </p>
                </div>

                <div className="relative w-full sm:max-w-xs">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500"
                    size={17}
                  />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search your courses..."
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-3 pl-10 pr-4 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-400/60"
                  />
                </div>
              </div>

              {renderCourseCards()}
            </section>
          )}

          {/* My Profile */}
          {activeTab === 'profile' && (
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
                <div className="mb-7 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-xl font-bold text-neutral-950">
                    {initials}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">My Profile</h2>
                    <p className="mt-1 text-sm text-stone-500">
                      Personal information
                    </p>
                  </div>
                </div>

                {profileLoading && (
                  <p className="mb-5 text-sm text-stone-400">
                    Loading your profile...
                  </p>
                )}

                {profileError && (
                  <div className="mb-5 flex gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                    <AlertCircle size={18} className="shrink-0" />
                    {profileError}
                  </div>
                )}

                {successMessage && (
                  <div className="mb-5 flex gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                    <CheckCircle2 size={18} className="shrink-0" />
                    {successMessage}
                  </div>
                )}

              {!isEditingProfile ? (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-300">
                    Username
                  </label>
                  <p className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-stone-400">
                    {profile?.username || user?.username || ''}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-300">
                    Email address
                  </label>
                  <p className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-stone-400">
                    {user?.email || ''}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-300">
                    Biography
                  </label>
                  <p className="min-h-24 whitespace-pre-wrap rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-stone-100">
                    {bio || 'No biography added yet.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-neutral-950 hover:bg-amber-500"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-300">
                      Username
                    </label>
                    <input
                      value={profile?.username || user?.username || ''}
                      readOnly
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-stone-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-300">
                      Email address
                    </label>
                    <input
                      value={user?.email || ''}
                      readOnly
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-stone-400 outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="student-bio"
                      className="mb-2 block text-sm font-medium text-stone-300"
                    >
                      Biography
                    </label>
                    <textarea
                      id="student-bio"
                      rows={5}
                      maxLength={500}
                      value={bio}
                      onChange={(event) => setBio(event.target.value)}
                      placeholder="Tell us about yourself, your interests and what you are learning..."
                      className="w-full resize-y rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-400/60"
                    />
                    <p className="mt-2 text-right text-xs text-stone-500">
                      {bio.length}/500 characters
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile || profileLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-bold text-neutral-950 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={17} />
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
              </form>
                )}
              </div>

              <aside className="h-fit rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck size={23} />
                </div>

                <h3 className="font-bold">Account Information</h3>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  Your username and email are managed through your account.
                  You can update your biography here.
                </p>

                <div className="mt-5 space-y-4 border-t border-neutral-800 pt-5">
                  <div className="flex items-center gap-3">
                    <Mail size={17} className="text-stone-500" />
                    <div className="min-w-0">
                      <p className="text-xs text-stone-500">Email address</p>
                      <p className="break-all text-sm font-medium">
                        {user?.email || 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <UserRound size={17} className="text-stone-500" />
                    <div className="min-w-0">
                      <p className="text-xs text-stone-500">Username</p>
                      <p className="text-sm font-medium">
                        {user?.username || 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </section>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <section className="max-w-4xl space-y-6">

              <div>
                <h2 className="text-2xl font-bold">Settings</h2>
                <p className="mt-1 text-sm text-stone-500">
                  Manage your learning preferences and account.
                </p>
              </div>

              {/* Notifications */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                    <Bell size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold">Notifications</h3>
                    <p className="text-sm text-stone-500">
                      Choose which reminders you want to see.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-neutral-800">
                  <label className="flex cursor-pointer items-center justify-between gap-5 py-5">
                    <span>
                      <span className="block font-semibold">
                        Course reminders
                      </span>
                      <span className="mt-1 block text-sm text-stone-500">
                        Remind me to continue my enrolled courses.
                      </span>
                    </span>

                    <input
                      type="checkbox"
                      checked={preferences.courseReminders}
                      onChange={(event) =>
                        updatePreference(
                          'courseReminders',
                          event.target.checked
                        )
                      }
                      className="h-5 w-5 accent-amber-400"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between gap-5 py-5">
                    <span>
                      <span className="block font-semibold">
                        Learning updates
                      </span>
                      <span className="mt-1 block text-sm text-stone-500">
                        Receive learning and course announcements.
                      </span>
                    </span>

                    <input
                      type="checkbox"
                      checked={preferences.productUpdates}
                      onChange={(event) =>
                        updatePreference(
                          'productUpdates',
                          event.target.checked
                        )
                      }
                      className="h-5 w-5 accent-amber-400"
                    />
                  </label>
                </div>

                <p className="mt-4 text-xs text-stone-500">
                  These preferences are saved in this browser.
                </p>
              </div>

              {/* Account security */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <LockKeyhole size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold">Account & Security</h3>
                    <p className="text-sm text-stone-500">
                      Your account sign-in information.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="text-xs text-stone-500">Email address</p>
                    <p className="mt-1 break-all text-sm font-medium">
                      {user?.email || 'Not available'}
                    </p>
                  </div>

                  <div className="border-t border-neutral-800 pt-5">
                    <p className="text-xs text-stone-500">Username</p>
                    <p className="mt-1 text-sm font-medium">
                      {user?.username || 'Not available'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => changeTab('profile')}
                    className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-stone-200 transition hover:border-amber-400 hover:text-amber-400"
                  >
                    Manage Profile
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>


            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default StudentDashboard
