
function Courses() {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="max-w-7xl mx-auto">

        {/* Page Heading */}
        <div className="text-center mb-12">
          <p className="text-purple-400 font-semibold mb-3">
            LEARN SOMETHING NEW
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore Our Courses
          </h1>

          <p className="text-slate-400 max-w-2xl mx-auto">
            Discover courses created by experienced teachers and build
            the skills you need for your future.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12">
          <input
            type="text"
            placeholder="Search for a course..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 outline-none focus:border-purple-500"
          />
        </div>

        {/* Course Display */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <div className="text-5xl mb-4">📚</div>

          <h2 className="text-2xl font-semibold mb-3">
            Courses Coming Soon
          </h2>

          <p className="text-slate-500 max-w-lg mx-auto">
            Approved courses from our teachers will appear here.
            Start exploring once courses become available.
          </p>
        </div>

      </div>
    </div>
  )
}

export default Courses
