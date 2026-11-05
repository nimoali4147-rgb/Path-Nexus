
function TeachersDashboard() {
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

          <button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition">
            + Create New Course
          </button>
        </div>

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
