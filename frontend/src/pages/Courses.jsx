
import { useEffect, useState } from 'react'
import {
  Search,
  BookOpen,
  Clock3,
  BarChart3,
  GraduationCap,
  Sparkles,
  BookMarked,
} from 'lucide-react'

function Courses() {
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/courses/')

        if (!response.ok) {
          throw new Error('Failed to load courses.')
        }

        const data = await response.json()

        setCourses(Array.isArray(data) ? data : data.results || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const filteredCourses = courses.filter((course) =>
    `${course.title} ${course.description} ${course.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-neutral-950 text-stone-100 px-6 py-16">

      <div className="max-w-7xl mx-auto">

        {/* Page Heading */}
        <div className="text-center mb-14">

          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-full px-4 py-2 mb-5">
            <Sparkles size={16} />
            <span className="text-xs font-semibold tracking-wider">
              LEARN SOMETHING NEW
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-5">
            Explore Our <span className="text-amber-400">Courses</span>
          </h1>

          <p className="text-stone-400 max-w-2xl mx-auto leading-relaxed">
            Discover courses created by experienced teachers and build
            the skills you need for your future.
          </p>

        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-14">

          <div className="relative">

            <Search
              size={21}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-500"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a course..."
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-14 pr-5 py-4 text-stone-100 placeholder:text-stone-500 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10"
            />

          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">

            <div className="w-10 h-10 border-4 border-neutral-700 border-t-amber-400 rounded-full animate-spin mb-5" />

            <p className="text-stone-400">
              Loading courses...
            </p>

          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-xl mx-auto bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-center">
            <p className="text-red-400">
              Error: {error}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="max-w-2xl mx-auto bg-neutral-900 border border-amber-600/20 rounded-2xl p-10 md:p-14 text-center">

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/20">
                {search ? (
                  <Search size={36} className="text-amber-400" />
                ) : (
                  <BookOpen size={36} className="text-amber-400" />
                )}
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-3">
              {search ? 'No Courses Found' : 'Courses Coming Soon'}
            </h2>

            <p className="text-stone-400 max-w-lg mx-auto leading-relaxed">
              {search
                ? 'We could not find any courses matching your search. Try another keyword.'
                : 'No published courses found. Approved courses from our teachers will appear here.'}
            </p>

          </div>
        )}

        {/* Course Results */}
        {!loading && !error && filteredCourses.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-7">

              <div>
                <h2 className="text-xl font-bold">
                  Available Courses
                </h2>

                <p className="text-sm text-stone-500 mt-1">
                  Explore and discover your next skill.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-amber-400">
                <BookMarked size={17} />
                {filteredCourses.length} Courses
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">

              {filteredCourses.map((course) => (

                <div
                  key={course.id}
                  className="group bg-neutral-900 border border-neutral-800 rounded-2xl p-6 transition duration-300 hover:border-amber-400/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-400/5"
                >

                  {/* Course Icon */}
                  <div className="flex items-center justify-between mb-6">

                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 group-hover:bg-amber-400 group-hover:text-neutral-950 transition">
                      <GraduationCap size={25} />
                    </div>

                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                      course.is_free
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                    }`}>
                      {course.is_free ? 'Free Course' : 'Paid Course'}
                    </span>

                  </div>

                  {/* Category */}
                  <p className="text-amber-400 text-sm font-semibold mb-3">
                    {course.category}
                  </p>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-stone-100 mb-3 group-hover:text-amber-400 transition">
                    {course.title}
                  </h2>

                  {/* Description */}
                  <p className="text-stone-400 text-sm leading-relaxed mb-6">
                    {course.description}
                  </p>

                  {/* Course Details */}
                  <div className="border-t border-neutral-800 pt-5 space-y-4">

                    <div className="flex items-center justify-between text-sm">

                      <div className="flex items-center gap-2 text-stone-400">
                        <BarChart3 size={17} />
                        <span>Level</span>
                      </div>

                      <span className="text-stone-200 font-medium">
                        {course.difficulty_level || 'Not specified'}
                      </span>

                    </div>

                    <div className="flex items-center justify-between text-sm">

                      <div className="flex items-center gap-2 text-stone-400">
                        <Clock3 size={17} />
                        <span>Duration</span>
                      </div>

                      <span className="text-stone-200 font-medium">
                        {course.duration_hours
                          ? `${course.duration_hours} hours`
                          : 'Not specified'}
                      </span>

                    </div>

                  </div>

                  {/* Price */}
                  <div className="border-t border-neutral-800 mt-5 pt-5 flex items-center justify-between">

                    <span className="text-sm text-stone-400">
                      Course Price
                    </span>

                    <span className="text-lg font-bold text-amber-400">
                      {course.is_free
                        ? 'Free'
                        : `KES ${Number(course.price).toFixed(2)}`}
                    </span>

                  </div>

                </div>

              ))}

            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default Courses
