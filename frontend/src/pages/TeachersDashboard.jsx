
import { useState } from 'react'

function TeachersDashboard() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-10">
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
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition"
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

            <form className="space-y-5">

              <div>
                <label className="block mb-2 text-slate-300">
                  Course Title
                </label>
                <input
                  type="text"
                  placeholder="Enter course title"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-slate-300">
                  Course Description
                </label>
                <textarea
                  rows="4"
                  placeholder="Describe your course"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-slate-300">
                  Category
                </label>
                <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 outline-none focus:border-purple-500">
                  <option value="">Select category</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-slate-300">
                  Course Price (KES)
                </label>
                <input
                  type="number"
                  placeholder="Enter course price"
                  min="0"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-slate-300">
                  Course Type
                </label>
                <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 outline-none focus:border-purple-500">
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition"
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
            <h2 className="text-3xl font-bold mt-3">0</h2>
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
          <h2 className="text-2xl font-bold mb-6">
            My Courses
          </h2>

          <div className="text-center py-12">
            <div className="text-5xl mb-4">📚</div>

            <h3 className="text-xl font-semibold mb-2">
              No Courses Yet
            </h3>

            <p className="text-slate-400">
              Create your first course to start teaching on Path Nexus.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default TeachersDashboard
