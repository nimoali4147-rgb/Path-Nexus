
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  UserPlus,
  ArrowRight,
} from 'lucide-react'

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      const responseText = await response.text()

      console.log('Status:', response.status)
      console.log('Content-Type:', response.headers.get('content-type'))
      console.log('Server response:', responseText)

      let data

      try {
        data = JSON.parse(responseText)
      } catch {
        throw new Error(
          `Server returned HTML instead of JSON. HTTP status: ${response.status}. Check the browser console.`
        )
      }

      if (!response.ok) {
        const messages = Object.values(data).flat().join(' ')
        throw new Error(messages || 'Registration failed.')
      }

      setSuccess(
        `Account created successfully! Welcome, ${data.username}. You can now log in.`
      )

      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
      })

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-12 pr-4 py-3.5 text-stone-100 placeholder:text-stone-600 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10'

  const labelClass =
    'block text-sm font-medium text-stone-300 mb-2'

 return (
  <div
    className="min-h-screen relative bg-neutral-950 bg-cover bg-center bg-fixed text-stone-100 flex items-center justify-center px-6 py-6"
    style={{
      backgroundImage:
         "url('/image/background.png')",
    }}
  >

      <div className="w-full max-w-lg">

        {/* Brand */}
        <div className="text-center mb-5">

        

          <div className="flex justify-center mt-2 mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20">
              <UserPlus size={30} className="text-amber-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-3">
            Create Your Account
          </h1>

          <p className="text-stone-400">
            Join PATH NEXUS and start your learning journey.
          </p>

        </div>

        {/* Registration Form */}
    <div className="bg-neutral-900/90 backdrop-blur-md border border-amber-600/30 rounded-2xl p-5 md:p-6 shadow-2xl shadow-black/50">

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-5 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-3 mb-5 text-sm">
              {success}

              <Link
                to="/login"
                className="flex items-center gap-2 mt-3 font-semibold underline"
              >
                Continue to Login
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label className={labelClass}>
                Username
              </label>

              <div className="relative">
                <User
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
                />

                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>
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
                  className={inputClass}
                />
              </div>
            </div>

            {/* Account Type */}
            <div>
              <label className={labelClass}>
                Account Type
              </label>

              <div className="relative">
                <GraduationCap
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none"
                />

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>
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
                  placeholder="Create a password"
                  required
                  minLength={8}
                  className={inputClass}
                />
              </div>

              <p className="text-xs text-stone-500 mt-2">
                Password must contain at least 8 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className={labelClass}>
                Confirm Password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
                />

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  className={inputClass}
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
                'Creating Account...'
              ) : (
                <>
                  Create Account
                  <ArrowRight size={19} />
                </>
              )}
            </button>

          </form>

          {/* Login Link */}
          <p className="text-center text-stone-400 mt-7 text-sm">
            Already have an account?{' '}

            <Link
              to="/login"
              className="text-amber-400 hover:text-amber-500 font-semibold transition"
            >
              Sign In
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

export default Register
