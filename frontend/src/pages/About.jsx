
import {
  Target,
  Globe2,
  Lightbulb,
  Users,
  BookOpen,
  GraduationCap,
  Clock3,
  ArrowRight,
  Sparkles,
  Code2,
} from 'lucide-react'

function About() {
  const features = [
    {
      title: 'Practical Skills',
      description:
        'Develop skills through practical learning and projects.',
      icon: Code2,
    },
    {
      title: 'Expert Teachers',
      description:
        'Learn from experienced and dedicated educators.',
      icon: GraduationCap,
    },
    {
      title: 'Flexible Learning',
      description:
        'Learn at your own pace and manage your progress.',
      icon: Clock3,
    },
    {
      title: 'Supportive Community',
      description:
        'Connect and grow with other learners.',
      icon: Users,
    },
  ]

  return (
    <main className="min-h-screen bg-neutral-900 text-stone-100">

     {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-cover bg-center min-h-[550px] flex items-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(10,10,10,0.65), rgba(10,10,10,0.80)), url('/image/A.img.png')",
        }}
      >

        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-24">

          <div className="max-w-4xl mx-auto text-center">

            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-400 rounded-full px-4 py-2 mb-7">
              <Sparkles size={16} />
              <span className="text-xs font-semibold tracking-[0.2em]">
                ABOUT PATH NEXUS
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-7">
              Empowering Learners to
              <span className="block text-amber-400 mt-2">
                Grow and Succeed
              </span>
            </h1>

            <p className="text-stone-300 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              Path Nexus is an educational platform designed to
              connect students with quality learning opportunities,
              experienced teachers and a supportive learning community.
            </p>

            <div className="flex justify-center mt-10">
              <div className="flex items-center gap-3 text-sm text-stone-400">
                <span className="w-10 h-px bg-amber-400/50" />
                <span className="tracking-[0.25em] uppercase">
                  Learn. Build. Grow.
                </span>
                <span className="w-10 h-px bg-amber-400/50" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Mission and Vision */}
      <section className="py-20 md:py-24 bg-neutral-950">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-12">

            <p className="text-amber-400 text-sm font-semibold tracking-[0.2em] mb-3">
              OUR PURPOSE
            </p>

            <h2 className="text-3xl md:text-4xl font-bold">
              What Drives <span className="text-amber-400">Us</span>
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

            {/* Mission */}
            <div className="group bg-neutral-800 border border-neutral-700 hover:border-amber-400/50 rounded-2xl p-8 md:p-10 transition duration-300 shadow-lg shadow-black/10">

              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 mb-7 group-hover:bg-amber-400 group-hover:text-neutral-950 transition">
                <Target size={29} />
              </div>

              <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 mb-3">
                OUR MISSION
              </p>

              <h3 className="text-2xl font-bold mb-5">
                Making Quality Education Accessible
              </h3>

              <p className="text-stone-300 leading-relaxed">
                To make quality education accessible by providing
                practical learning experiences, expert guidance
                and opportunities for personal and professional growth.
              </p>

            </div>

            {/* Vision */}
            <div className="group bg-neutral-800 hover:border-amber-400/50 rounded-2xl p-8 md:p-10 transition duration-300 shadow-lg shadow-black/10">

              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 mb-7 group-hover:bg-amber-400 group-hover:text-neutral-950 transition">
                <Globe2 size={29} />
              </div>

              <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 mb-3">
                OUR VISION
              </p>

              <h3 className="text-2xl font-bold mb-5">
                Creating Opportunities Through Learning
              </h3>

              <p className="text-stone-300 leading-relaxed">
                To build a community where learners and educators
                connect, share knowledge and create opportunities
                for a better future.
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-neutral-950">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center max-w-2xl mx-auto mb-14">

            <div className="inline-flex items-center gap-2 text-amber-400 mb-4">
              <Lightbulb size={18} />
              <span className="text-sm font-semibold tracking-[0.2em]">
                WHY CHOOSE US
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-5">
              Why Learn With
              <span className="text-amber-400"> Path Nexus?</span>
            </h2>

            <p className="text-stone-300 leading-relaxed">
              Discover an environment designed to help you learn,
              develop valuable skills and move forward with confidence.
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {features.map((feature, index) => {
              const Icon = feature.icon

              return (
                <div
                  key={feature.title}
                  className="group bg-neutral-800  rounded-2xl p-7 hover:border-amber-400/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 transition duration-300"
                >

                  <div className="flex items-center justify-between mb-7">

                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 group-hover:bg-amber-400 group-hover:text-neutral-950 transition">
                      <Icon size={24} />
                    </div>

                    <span className="text-sm font-semibold text-stone-500">
                      0{index + 1}
                    </span>

                  </div>

                  <h3 className="font-bold text-lg mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-stone-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="mt-7 w-10 h-0.5 bg-amber-400/50 group-hover:w-full transition-all duration-300" />

                </div>
              )
            })}

          </div>

        </div>
      </section>

      {/* Closing Section */}
      <section className="py-20 bg-neutral-950">

        <div className="max-w-5xl mx-auto px-6">

          <div className="relative overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-700 border border-neutral-600 rounded-2xl p-9 md:p-14 text-center shadow-xl shadow-black/10">

            <div className="absolute -top-24 -right-20 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">

              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-amber-400/15 text-amber-400">
                  <BookOpen size={28} />
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-5">
                Your Journey Starts With
                <span className="text-amber-400"> Learning.</span>
              </h2>

              <p className="text-stone-300 max-w-2xl mx-auto leading-relaxed">
                Discover learning opportunities, develop practical skills
                and take the next step toward your future.
              </p>

              <a
                href="/courses"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 px-7 py-3.5 rounded-xl font-bold mt-8 transition"
              >
                Explore Courses
                <ArrowRight size={19} />
              </a>

            </div>

          </div>

        </div>
      </section>

    </main>
  )
}

export default About
