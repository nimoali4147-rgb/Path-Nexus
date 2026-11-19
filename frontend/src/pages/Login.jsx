
import { useEffect, useState } from 'react'
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
  const [resetOpen, setResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetStage, setResetStage] = useState(0)
  const [resetMessage, setResetMessage] = useState('')
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

  useEffect(() => {
    if (!googleClientId) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (!window.google?.accounts?.id) return
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          setError('')
          setLoading(true)
          try {
            const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
            const response = await fetch(`${apiBase}/api/auth/google/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({ credential }),
            })
            const data = await response.json().catch(() => ({}))
            if (!response.ok) throw new Error(data.detail || 'Google sign-in failed.')
            login(data.user, data.access, data.refresh)
            navigate(data.user.role === 'admin' ? '/admin' : data.user.role === 'teacher' ? '/teacher' : '/student')
          } catch (err) { setError(err.message) } finally { setLoading(false) }
        },
      })
      const button = document.getElementById('google-signin-button')
      if (button) window.google.accounts.id.renderButton(button, { theme: 'outline', size: 'large', width: 320, text: 'signin_with' })
    }
    document.head.appendChild(script)
    return () => { if (script.parentNode) script.parentNode.removeChild(script) }
  }, [googleClientId, login, navigate])

  async function requestResetCode(e) {
    e.preventDefault(); setResetMessage(''); setError('')
    try {
      const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
      const response = await fetch(`${apiBase}/api/auth/password-reset/request/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.detail || 'Could not request a reset code.')
      setResetStage(1); setResetMessage(data.detail || 'Check your Gmail for the reset code.')
    } catch (err) { setResetMessage(err.message) }
  }

  async function confirmReset(e) {
    e.preventDefault(); setResetMessage('')
    try {
      const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
      const response = await fetch(`${apiBase}/api/auth/password-reset/confirm/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: resetEmail, code: resetCode, new_password: newPassword }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.detail || data.new_password || 'Could not reset password.')
      setResetMessage(data.detail); setResetStage(0); setResetOpen(false)
    } catch (err) { setResetMessage(err.message) }
  }

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
      const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
      const response = await fetch(`${apiBase}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const contentType = response.headers.get('content-type') || ''
      const raw = await response.text()
      let data = {}
      if (contentType.includes('application/json') && raw) {
        try { data = JSON.parse(raw) } catch { data = {} }
      }
      if (!response.ok) {
        const message = data.detail || Object.values(data).flat().join(' ')
        throw new Error(message || `Sign in failed (HTTP ${response.status}). The API did not return a JSON error.`)
      }
      if (!data.access || !data.refresh || !data.user) {
        throw new Error('The server response is missing authentication data. Check the backend login endpoint.')
      }

      // Save authentication information
      login(data.user, data.access, data.refresh)

      // Redirect according to user role
          
      if (data.user.role === 'admin') {
        navigate('/admin')
      } else if (data.user.role === 'teacher') {
        navigate('/teacher')
      } else if (data.user.role === 'student') {
        navigate('/student')
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

            <div className="flex justify-end -mt-2">
              <button type="button" onClick={() => { setResetOpen(true); setResetEmail(formData.email); setResetMessage(''); setResetStage(0) }} className="text-sm text-amber-400 hover:text-amber-300">Forgot password?</button>
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

          {googleClientId && (
            <div className="mt-5 flex flex-col items-center gap-2">
              <div className="text-xs text-stone-500">OR CONTINUE WITH</div>
              <div id="google-signin-button" />
            </div>
          )}

          {resetOpen && (
            <div className="mt-6 rounded-xl border border-amber-500/30 bg-neutral-950 p-4">
              <h2 className="font-semibold text-stone-100 mb-3">Reset your password</h2>
              {resetStage === 0 ? (
                <form onSubmit={requestResetCode} className="space-y-3">
                  <input type="email" required value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="Your Gmail address" className="w-full rounded-lg bg-neutral-900 border border-neutral-700 p-3 text-white" />
                  <button disabled={loading} className="w-full rounded-lg bg-amber-400 text-black font-semibold p-3">Send reset code</button>
                </form>
              ) : (
                <form onSubmit={confirmReset} className="space-y-3">
                  <input required inputMode="numeric" maxLength={6} value={resetCode} onChange={e => setResetCode(e.target.value)} placeholder="6-digit code from Gmail" className="w-full rounded-lg bg-neutral-900 border border-neutral-700 p-3 text-white" />
                  <input required minLength={8} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (8+ characters)" className="w-full rounded-lg bg-neutral-900 border border-neutral-700 p-3 text-white" />
                  <button disabled={loading} className="w-full rounded-lg bg-amber-400 text-black font-semibold p-3">Update password</button>
                </form>
              )}
              {resetMessage && <p className="mt-3 text-sm text-amber-300">{resetMessage}</p>}
              <button type="button" onClick={() => setResetOpen(false)} className="mt-3 text-xs text-stone-400">Close</button>
            </div>
          )}

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
