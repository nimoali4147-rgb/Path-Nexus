
import { Link } from 'react-router-dom'
import {
  Code2,
  Palette,
  BriefcaseBusiness,
  BrainCircuit,
  Megaphone,
  Cpu,
} from 'lucide-react'

function Home() {
  const video = '/video/video-background.mp4'

const categories = [
  { name: 'Development', icon: Code2 },
  { name: 'Design', icon: Palette },
  { name: 'Business', icon: BriefcaseBusiness },
  { name: 'AI & Data', icon: BrainCircuit },
  { name: 'Marketing', icon: Megaphone },
  { name: 'Technology', icon: Cpu },
]
  const steps = [
    {
      number: '01',
      title: 'Create Your Account',
      description:
        'Join PATH NEXUS and create your personal learning account.',
      icon: '✦',
    },
    {
      number: '02',
      title: 'Explore & Learn',
      description:
        'Discover practical courses and learn from experienced teachers.',
      icon: '◇',
    },
    {
      number: '03',
      title: 'Build Your Future',
      description:
        'Develop your skills, complete projects and grow your career.',
      icon: '✧',
    },
  ]

  return (
    <main className="min-h-screen bg-neutral-950 text-stone-100">

      {/* HERO SECTION */}
      <section className="relative isolate overflow-hidden border-b border-amber-600/20">

        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        >
          <source src={video} type="video/mp4" />
          Your browser does not support background video.
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 -z-10 bg-neutral-950/70" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-28">

          {/* Left Content */}
          <div>
            <p className="mb-6 text-sm font-semibold tracking-[0.3em] text-amber-400">
              LEARN. BUILD. GROW.
            </p>

            <h1 className="mb-7 text-5xl font-bold leading-tight md:text-6xl xl:text-7xl">
              Learn.
              <br />
              Create.
              <br />
              <span className="text-amber-400">
                Grow Together.
              </span>
            </h1>

            <p className="mb-9 max-w-xl text-lg leading-8 text-stone-200">
              Skills for your future. Learn from experienced
              teachers, build real projects and develop the
              knowledge you need to succeed in the digital world.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/courses"
                className="rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 px-8 py-4 font-bold text-neutral-950 shadow-lg shadow-amber-500/10 transition hover:brightness-110"
              >
                Explore Courses →
              </Link>

              <Link
                to="/register"
                className="rounded-lg border border-amber-400/70 px-8 py-4 font-semibold text-stone-100 transition hover:bg-amber-500/10"
              >
                Start Learning
              </Link>
            </div>

            {/* Highlights */}
            <div className="mt-12 flex flex-wrap gap-8 border-t border-white/20 pt-8">
              <div>
                <p className="text-2xl font-bold text-amber-400">
                  Learn
                </p>
                <p className="mt-1 text-sm text-stone-400">
                  New skills
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold text-amber-400">
                  Build
                </p>
                <p className="mt-1 text-sm text-stone-400">
                  Real projects
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold text-amber-400">
                  Grow
                </p>
                <p className="mt-1 text-sm text-stone-400">
                  Your career
                </p>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="relative">
            <div className="absolute -inset-3 rotate-2 rounded-3xl border border-amber-500/30" />

            <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-2xl border border-amber-500/40 bg-neutral-950/80 p-8 shadow-2xl backdrop-blur-md md:p-12">

              <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-amber-500/10 blur-[90px]" />

              <div className="relative">
                <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/10 text-3xl text-amber-300">
                  ✦
                </div>

                <p className="mb-4 text-sm tracking-[0.25em] text-amber-400">
                  YOUR JOURNEY STARTS HERE
                </p>

                <h2 className="mb-5 text-3xl font-bold leading-tight md:text-4xl">
                  Turn Your
                  <br />
                  <span className="text-amber-400">
                    Potential Into
                  </span>
                  <br />
                  Possibilities.
                </h2>

                <p className="max-w-md leading-7 text-stone-300">
                  Learn new skills, work on practical projects
                  and prepare yourself for opportunities in
                  the digital world.
                </p>
              </div>

              <div className="relative mt-12 grid grid-cols-3 gap-3">
                {['Learn', 'Practice', 'Achieve'].map((item, index) => (
                  <div
                    key={item}
                    className="rounded-xl border border-amber-500/50 bg-neutral-950/70 p-4 text-center"
                  >
                    <p className="mb-2 text-lg text-amber-400">
                      {['01', '02', '03'][index]}
                    </p>

                    <p className="text-xs text-stone-100 md:text-sm">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="bg-neutral-950 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">

          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="mb-3 text-sm tracking-widest text-amber-400">
                DISCOVER YOUR INTERESTS
              </p>

              <h2 className="text-3xl font-bold md:text-4xl">
                Explore Categories
              </h2>

              <p className="mt-3 text-stone-400">
                Find the right learning path for your goals.
              </p>
            </div>

            <Link
              to="/courses"
              className="hidden text-amber-400 transition hover:text-amber-200 sm:block"
            >
              View Courses →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
           {categories.map((category) => {
            const Icon = category.icon

            return (
              <div
                key={category.name}
                className="group rounded-xl border border-amber-600/20 bg-neutral-900 p-6 transition hover:border-amber-500/50 hover:bg-neutral-800"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 transition group-hover:bg-amber-500 group-hover:text-neutral-950">
                  <Icon size={25} strokeWidth={1.8} />
                </div>

                <h3 className="font-semibold text-stone-100">
                  {category.name}
                </h3>
              </div>
            )
          })}
          </div>

        </div>
      </section>

      {/* LEARNING PROCESS */}
      <section className="border-y border-amber-600/20 bg-neutral-900 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">

          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-4 text-sm tracking-[0.25em] text-amber-400">
              YOUR PATH TO SUCCESS
            </p>

            <h2 className="mb-5 text-3xl font-bold md:text-4xl">
              How PATH NEXUS Works
            </h2>

            <p className="leading-7 text-stone-400">
              A simple journey designed to help you learn,
              develop practical skills and achieve your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-amber-600/20 bg-neutral-950 p-8 transition hover:border-amber-500/60"
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-4xl font-bold text-amber-400">
                    {step.number}
                  </span>

                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/40 text-2xl text-amber-300">
                    {step.icon}
                  </span>
                </div>

                <h3 className="mb-4 text-xl font-bold">
                  {step.title}
                </h3>

                <p className="leading-7 text-stone-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-neutral-950 px-6 py-24">
        <div className="mx-auto max-w-5xl rounded-3xl border border-amber-600/30 bg-gradient-to-br from-neutral-900 via-neutral-950 to-stone-950 p-10 text-center md:p-16">

          <p className="mb-5 text-sm tracking-[0.25em] text-amber-400">
            YOUR FUTURE STARTS TODAY
          </p>

          <h2 className="mb-6 text-3xl font-bold md:text-5xl">
            Ready to Build Your Future?
          </h2>

          <p className="mx-auto mb-9 max-w-2xl leading-7 text-stone-400">
            Start learning, develop your skills and take the next
            step towards your goals with PATH NEXUS.
          </p>

          <Link
            to="/register"
            className="inline-block rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 px-9 py-4 font-bold text-neutral-950 transition hover:brightness-110"
          >
            Get Started →
          </Link>

        </div>
      </section>

    </main>
  )
}

export default Home
