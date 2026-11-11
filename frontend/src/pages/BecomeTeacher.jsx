
import { Link } from 'react-router-dom'
import {
  GraduationCap,
  BookOpen,
  Users,
  TrendingUp,
  MonitorPlay,
  BadgeCheck,
  ArrowRight,
  Lightbulb,
  Sparkles,
  CircleCheck,
} from 'lucide-react'

function BecomeTeacher() {
  const benefits = [
    {
      icon: Users,
      title: 'Reach More Students',
      description:
        'Share your knowledge with learners looking to develop valuable skills.',
    },
    {
      icon: BookOpen,
      title: 'Create Your Courses',
      description:
        'Build structured courses and organize lessons around your expertise.',
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Career',
      description:
        'Build your teaching experience and establish your professional presence.',
    },
    {
      icon: MonitorPlay,
      title: 'Teach Online',
      description:
        'Share learning materials and video lessons through one learning platform.',
    },
  ]

  const steps = [
    {
      number: '01',
      title: 'Create an Account',
      description:
        'Register on PATH NEXUS and select Teacher as your account type.',
    },
    {
      number: '02',
      title: 'Complete Verification',
      description:
        'Provide your teacher information and qualifications for review.',
    },
    {
      number: '03',
      title: 'Create Your Courses',
      description:
        'Once your teacher account is verified, start creating your courses.',
    },
    {
      number: '04',
      title: 'Start Teaching',
      description:
        'Submit your courses for approval and share your knowledge with students.',
    },
  ]

  return (
    <main className="min-h-screen bg-neutral-800 text-stone-100">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-700 border-b border-neutral-600">

        <div className="absolute -top-40 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            <div>

              <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-400 rounded-full px-4 py-2 mb-7">
                <GraduationCap size={17} />
                <span className="text-xs font-semibold tracking-[0.2em]">
                  TEACH WITH PATH NEXUS
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-7">
                Share Your Knowledge.
                <span className="block text-amber-400 mt-2">
                  Inspire the Future.
                </span>
              </h1>

              <p className="text-stone-200 text-base md:text-lg leading-relaxed max-w-xl">
                Turn your knowledge and experience into meaningful
                learning opportunities. Join PATH NEXUS and help
                students build skills for a better future.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-9">

                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 px-7 py-4 rounded-xl font-bold transition"
                >
                  Become a Teacher
                  <ArrowRight size={19} />
                </Link>

                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center gap-2 border border-neutral-500 hover:border-amber-400 text-stone-100 px-7 py-4 rounded-xl font-semibold transition"
                >
                  Explore Courses
                </Link>

              </div>

              <div className="flex items-center gap-2 mt-7 text-sm text-stone-300">
                <BadgeCheck size={18} className="text-amber-400" />
                Teacher accounts require verification.
              </div>

            </div>

            {/* Hero Visual */}
            <div className="relative">

              <div className="absolute inset-0 bg-amber-400/10 blur-3xl rounded-full" />

              <div className="relative bg-neutral-700 border border-amber-400/30 rounded-3xl p-8 md:p-12 shadow-2xl">

                <div className="w-20 h-20 flex items-center justify-center bg-amber-400/15 text-amber-400 rounded-2xl mb-8">
                  <GraduationCap size={42} />
                </div>

                <p className="text-amber-400 text-sm font-semibold tracking-[0.2em] mb-4">
                  YOUR KNOWLEDGE MATTERS
                </p>

                <h2 className="text-3xl md:text-4xl font-bold leading-snug mb-5">
                  Great Teachers
                  <span className="text-amber-400"> Create </span>
                  Great Opportunities.
                </h2>

                <p className="text-stone-200 leading-relaxed">
                  Every lesson you create can help someone discover
                  a new skill, build confidence and move closer
                  to their goals.
                </p>

                <div className="mt-9 pt-7 border-t border-neutral-600 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-amber-400/15 flex items-center justify-center text-amber-400">
                    <Lightbulb size={22} />
                  </div>

                  <div>
                    <p className="font-semibold">Learn. Build. Grow.</p>
                    <p className="text-sm text-stone-300">
                      Make an impact through education.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-neutral-800">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center max-w-2xl mx-auto mb-14">

            <p className="text-amber-400 text-sm font-semibold tracking-[0.2em] mb-3">
              WHY TEACH WITH US
            </p>

            <h2 className="text-3xl md:text-4xl font-bold mb-5">
              More Than Just
              <span className="text-amber-400"> Teaching</span>
            </h2>

            <p className="text-stone-200 leading-relaxed">
              Become part of a learning platform that helps educators
              share knowledge and grow professionally.
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {benefits.map((benefit) => {
              const Icon = benefit.icon

              return (
                <div
                  key={benefit.title}
                  className="group bg-neutral-700 border border-neutral-600 hover:border-amber-400/50 rounded-2xl p-7 transition duration-300 hover:-translate-y-1"
                >

                  <div className="w-14 h-14 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center mb-7 group-hover:bg-amber-400 group-hover:text-neutral-950 transition">
                    <Icon size={27} />
                  </div>

                  <h3 className="text-lg font-bold mb-3">
                    {benefit.title}
                  </h3>

                  <p className="text-stone-200 text-sm leading-relaxed">
                    {benefit.description}
                  </p>

                </div>
              )
            })}

          </div>

        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-neutral-700/50 border-y border-neutral-600">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center max-w-2xl mx-auto mb-14">

            <p className="text-amber-400 text-sm font-semibold tracking-[0.2em] mb-3">
              GETTING STARTED
            </p>

            <h2 className="text-3xl md:text-4xl font-bold mb-5">
              Your Journey as a
              <span className="text-amber-400"> Teacher</span>
            </h2>

            <p className="text-stone-200">
              Four simple stages to begin your teaching journey
              on PATH NEXUS.
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-neutral-700 border border-neutral-600 rounded-2xl p-7"
              >

                <span className="text-4xl font-bold text-amber-400">
                  {step.number}
                </span>

                <h3 className="text-xl font-bold mt-6 mb-3">
                  {step.title}
                </h3>

                <p className="text-stone-200 text-sm leading-relaxed">
                  {step.description}
                </p>

              </div>
            ))}

          </div>

        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-neutral-800">

        <div className="max-w-5xl mx-auto px-6">

          <div className="bg-neutral-700 border border-neutral-600 rounded-2xl p-8 md:p-12">

            <div className="flex items-center gap-3 mb-7">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-amber-400/15 text-amber-400">
                <BadgeCheck size={25} />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold">
                Before You Apply
              </h2>
            </div>

            <p className="text-stone-200 mb-7 leading-relaxed">
              To become a teacher on PATH NEXUS, prepare the
              following information for your registration and
              verification process.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {[
                'A valid email address',
                'Your teaching or professional background',
                'Relevant qualifications or experience',
                'Knowledge of the subject you want to teach',
              ].map((requirement) => (
                <div
                  key={requirement}
                  className="flex items-start gap-3"
                >
                  <CircleCheck
                    size={20}
                    className="text-amber-400 shrink-0 mt-0.5"
                  />

                  <span className="text-stone-100 text-sm">
                    {requirement}
                  </span>
                </div>
              ))}

            </div>

            <p className="text-sm text-stone-300 mt-7">
              Teacher verification and course approval are subject
              to administrator review.
            </p>

          </div>

        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-neutral-700/50">

        <div className="max-w-5xl mx-auto px-6">

          <div className="relative overflow-hidden bg-gradient-to-br from-neutral-700 to-neutral-600 border border-amber-400/30 rounded-2xl p-9 md:p-14 text-center">

            <div className="absolute -top-24 -right-20 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">

              <Sparkles
                size={35}
                className="text-amber-400 mx-auto mb-6"
              />

              <h2 className="text-3xl md:text-4xl font-bold mb-5">
                Ready to Share Your
                <span className="text-amber-400"> Knowledge?</span>
              </h2>

              <p className="text-stone-200 max-w-2xl mx-auto leading-relaxed">
                Take the first step and become part of the PATH NEXUS
                teaching community.
              </p>

              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 px-8 py-4 rounded-xl font-bold mt-8 transition"
              >
                Apply to Become a Teacher
                <ArrowRight size={19} />
              </Link>

            </div>

          </div>

        </div>
      </section>

    </main>
  )
}

export default BecomeTeacher
