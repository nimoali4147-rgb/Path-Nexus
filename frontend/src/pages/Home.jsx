
function Home() {
  return (
    <main className="bg-slate-900 text-white">

      {/* Hero Section */}
      <section className="min-h-[600px] flex items-center">
        <div className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <div>
            <p className="text-purple-400 font-semibold mb-5">
              LEARN. BUILD. GROW.
            </p>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Build Your Skills.
              <span className="text-purple-600">
                {" "}Shape Your Future.
              </span>
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Discover practical courses, learn from experienced
              mentors, and develop the skills you need to succeed
              in the digital world.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="/register"
                className="bg-purple-600 hover:bg-purple-700 px-7 py-3 rounded-lg font-semibold transition"
              >
                Start Learning
              </a>

              <a
                href="/courses"
                className="border border-gray-600 hover:border-purple-500 px-7 py-3 rounded-lg font-semibold transition"
              >
                Explore Courses
              </a>
            </div>

          </div>

          {/* Right Content */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 min-h-[350px] flex flex-col justify-center">
            <div className="text-6xl mb-6">🎓</div>

            <h2 className="text-3xl font-bold mb-4">
              Your Learning Journey Starts Here
            </h2>

            <p className="text-gray-400 leading-relaxed">
              Learn new skills, work on real projects,
              and grow your career with Path Nexus.
            </p>

          </div>

        </div>
      </section>

      
{/* How It Works Section */}
<section className="bg-slate-900 py-20">
  <div className="max-w-7xl mx-auto px-8">

    {/* Section Heading */}
    <div className="text-center max-w-2xl mx-auto mb-14">
      <p className="text-purple-400 font-semibold mb-3">
        SIMPLE LEARNING PROCESS
      </p>

      <h2 className="text-3xl md:text-4xl font-bold mb-5">
        How <span className="text-purple-500">Path Nexus</span> Works
      </h2>

      <p className="text-gray-400">
        Start your learning journey in three simple steps.
        Learn new skills, gain experience and grow your career.
      </p>
    </div>

    {/* Three Steps */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

      {/* Step 1 */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
          01
        </div>

        <h3 className="text-xl font-bold mb-4">
          Create Your Account
        </h3>

        <p className="text-gray-400 leading-relaxed">
          Sign up and create your student account to access
          learning opportunities on Path Nexus.
        </p>
      </div>

      {/* Step 2 */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
          02
        </div>

        <h3 className="text-xl font-bold mb-4">
          Explore & Learn
        </h3>

        <p className="text-gray-400 leading-relaxed">
          Discover courses, learn from experienced teachers
          and develop practical skills.
        </p>
      </div>

      {/* Step 3 */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
          03
        </div>

        <h3 className="text-xl font-bold mb-4">
          Build Your Future
        </h3>

        <p className="text-gray-400 leading-relaxed">
          Complete your courses, build projects and take
          the next step in your career.
        </p>
      </div>

    </div>
  </div>
</section>


    </main>
  )
}

export default Home
