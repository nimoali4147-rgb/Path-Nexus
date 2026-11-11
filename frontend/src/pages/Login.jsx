
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, ArrowRight, GraduationCap } from 'lucide-react'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Invalid email or password.'
        )
      }

      // Save authentication information
      login(data.user, data.access, data.refresh)

      // Redirect according to user role
      if (data.user.role === 'teacher') {
        navigate('/teacher')
      } else if (data.user.role === 'student') {
        navigate('/student')
      } else if (data.user.role === 'admin') {
        navigate('/')
      } else {
        throw new Error('Unknown account role.')
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
  <div
    className="min-h-screen relative bg-neutral-950 bg-cover bg-center bg-fixed text-stone-100 flex items-center justify-center px-6 py-6"
    style={{
      backgroundImage:
         "url('/image/background.png')",
    }}
  >


      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-5">

      
          <div className="flex justify-center mt-2 mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20">
              <GraduationCap size={32} className="text-amber-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-3">
            Welcome Back
          </h1>

          <p className="text-stone-400">
            Sign in to continue your learning journey.
          </p>

        </div>

        {/* Login Form */}
    <div className="bg-neutral-900/90 backdrop-blur-md border border-amber-600/30 rounded-2xl p-5 md:p-6 shadow-2xl shadow-black/50">

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-12 pr-4 py-3.5 text-stone-100 placeholder:text-stone-600 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
                />

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-12 pr-4 py-3.5 text-stone-100 placeholder:text-stone-600 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 rounded-xl py-3.5 font-bold transition shadow-lg shadow-amber-400/10"
            >
              {loading ? (
                'Signing In...'
              ) : (
                <>
                  Sign In
                  <ArrowRight size={19} />
                </>
              )}
            </button>

          </form>

          {/* Register Link */}
          <p className="text-center text-stone-400 mt-7 text-sm">
            Don't have an account?{' '}

            <Link
              to="/register"
              className="text-amber-400 hover:text-amber-500 font-semibold transition"
            >
              Create Account
            </Link>
          </p>

        </div>

        <p className="text-center text-xs text-stone-600 mt-8">
          © {new Date().getFullYear()} PATH NEXUS. All rights reserved.
        </p>

      </div>
    </div>
  )
}

export default Login
