
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

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

      // Save authentication tokens
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)

      // Save authenticated user information
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect according to the user's role
      if (data.user.role === 'teacher') {
        navigate('/teacher')
      } else if (data.user.role === 'student') {
        navigate('/courses')
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
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">

        {/* Heading */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold">
            PATH<span className="text-purple-500">NEXUS</span>
          </Link>

          <h1 className="text-3xl font-bold mt-8 mb-3">
            Welcome Back
          </h1>

          <p className="text-slate-400">
            Sign in to continue your learning journey.
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-lg p-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg py-3 font-semibold transition"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

          </form>

          <p className="text-center text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-purple-400 hover:text-purple-300 font-semibold"
            >
              Create Account
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Login
