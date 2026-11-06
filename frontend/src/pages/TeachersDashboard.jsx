
import { useState } from 'react'

function TeachersDashboard() {
  const [showForm, setShowForm] = useState(false)

  const [course, setCourse] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    courseType: 'free',
  })

  const [courses, setCourses] = useState([])

  function handleChange(e) {
    const { name, value } = e.target

    setCourse({
      ...course,
      [name]: value,
    })
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (
      !course.title.trim() ||
      !course.description.trim() ||
      !course.category
    ) {
      alert('Please fill in all required fields.')
      return
    }

    if (course.courseType === 'paid' && Number(course.price) <= 0) {
      alert('Please enter a valid course price.')
      return
    }

    const newCourse = {
      ...course,
      id: Date.now(),
      price: course.courseType === 'free' ? 0 : Number(course.price),
      status: 'Draft',
    }

    setCourses([...courses, newCourse])

    setCourse({
      title: '',
      description: '',
      category: '',
      price: '',
      courseType: 'free',
    })

    setShowForm(false)

    alert('Course saved successfully!')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-5 mb-10">
          <div>
            <p className="text-purple-400 font-medium mb-2">
              TEACHER PORTAL
            </p>

            <h1 className="text-3xl md:text-4xl font-bold">
              Teacher Dashboard
            </h1>

            <p className="text-slate-400 mt-2">
              Manage your courses and track your teaching activities.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold"
          >
            {showForm ? 'Cancel' : '+ Create New Course'}
          </button>
        </div>

        {/* Create Course Form */}
        {showForm && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 mb-10">
            <h2 className="text-2xl font-bold mb-6">
              Create New Course
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block mb-2">Course Title</label>
                <input
                  type="text"
                  name="title"
                  value={course.title}
                  onChange={handleChange}
                  placeholder="Enter course title"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block mb-2">Course Description</label>
                <textarea
                  name="description"
                  value={course.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe your course"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block mb-2">Category</label>
                <select
                  name="category"
                  value={course.category}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3"
                >
                  <option value="">Select category</option>
                  <option value="Programming">Programming</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Design">Design</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>

              <div>
                <label className="block mb-2">Course Type</label>
                <select
                  name="courseType"
                  value={course.courseType}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3"
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              {course.courseType === 'paid' && (
                <div>
                  <label className="block mb-2">Course Price (KES)</label>
                  <input
                    type="number"
                    name="price"
                    value={course.price}
                    onChange={handleChange}
                    min="1"
                    required
                    placeholder="Enter course price"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3"
                  />
                </div>
              )}

              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold"
              >
                Save Course
              </button>

            </form>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <p className="text-slate-400">Total Courses</p>
            <h2 className="text-3xl font-bold mt-3">{courses.length}</h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <p className="text-slate-400">Published Courses</p>
            <h2 className="text-3xl font-bold mt-3">0</h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <p className="text-slate-400">Pending Approval</p>
            <h2 className="text-3xl font-bold mt-3">0</h2>
          </div>
        </div>

        {/* My Courses */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">My Courses</h2>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">
                No Courses Yet
              </h3>
              <p className="text-slate-400">
                Create your first course to start teaching on Path Nexus.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-5"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 mt-2">
                        {item.description}
                      </p>
                      <p className="text-sm text-purple-400 mt-3">
                        {item.category} · {item.courseType} · KES {item.price}
                      </p>
                    </div>

                    <span className="text-yellow-400">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default TeachersDashboard
