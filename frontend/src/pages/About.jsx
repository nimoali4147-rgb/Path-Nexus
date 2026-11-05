
function About() {
  return (
    <main className="bg-slate-950 text-white">

      {/* About Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-purple-400 font-semibold mb-3">
              ABOUT US
            </p>

            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Empowering Learners to
              <span className="text-purple-500"> Grow and Succeed</span>
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed">
              Path Nexus is an educational platform designed to
              connect students with quality learning opportunities,
              experienced teachers and a supportive learning community.
            </p>
          </div>

          {/* Mission and Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <div className="text-4xl mb-5">🎯</div>

              <h2 className="text-2xl font-bold mb-4">
                Our Mission
              </h2>

              <p className="text-gray-400 leading-relaxed">
                To make quality education accessible by providing
                practical learning experiences, expert guidance
                and opportunities for personal and professional growth.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <div className="text-4xl mb-5">🌍</div>

              <h2 className="text-2xl font-bold mb-4">
                Our Vision
              </h2>

              <p className="text-gray-400 leading-relaxed">
                To build a community where learners and educators
                connect, share knowledge and create opportunities
                for a better future.
              </p>
            </div>

          </div>

          {/* Why Choose Us */}
          <div className="mt-20 text-center">
            <p className="text-purple-400 font-semibold mb-3">
              WHY CHOOSE US
            </p>

            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              Why Learn With <span className="text-purple-500">Path Nexus?</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              <div className="bg-slate-900 p-7 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-xl mb-3">
                  Practical Skills
                </h3>
                <p className="text-gray-400 text-sm">
                  Develop skills through practical learning and projects.
                </p>
              </div>

              <div className="bg-slate-900 p-7 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-xl mb-3">
                  Expert Teachers
                </h3>
                <p className="text-gray-400 text-sm">
                  Learn from experienced and dedicated educators.
                </p>
              </div>

              <div className="bg-slate-900 p-7 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-xl mb-3">
                  Flexible Learning
                </h3>
                <p className="text-gray-400 text-sm">
                  Learn at your own pace and manage your progress.
                </p>
              </div>

              <div className="bg-slate-900 p-7 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-xl mb-3">
                  Supportive Community
                </h3>
                <p className="text-gray-400 text-sm">
                  Connect and grow with other learners.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

    </main>
  )
}

export default About
