
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiJson } from '../service/apiService'
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
  const [resetLoading, setResetLoading] = useState(false)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  const googleInitialized = useRef(false)

  useEffect(() => {
    if (!googleClientId) return undefined

    let cancelled = false

    function initializeGoogle() {
      if (cancelled || !window.google?.accounts?.id) return

      const button = document.getElementById('google-signin-button')

      if (!googleInitialized.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async ({ credential }) => {
            setError('')
            setLoading(true)

            try {
              const data = await apiJson('/api/auth/google/', {
                method: 'POST',
                auth: false,
                body: { credential },
              })

              login(data.user, data.access, data.refresh)

              if (data.user.role === 'admin') {
                navigate('/admin')
              } else if (data.user.role === 'teacher') {
                navigate('/teacher')
              } else {
                navigate('/student')
              }
            } catch (err) {
              setError(err.message || 'Google sign-in failed.')
            } finally {
              setLoading(false)
            }
          },
        })

        googleInitialized.current = true
      }

      if (button && button.dataset.googleRendered !== 'true') {
        button.innerHTML = ''
        window.google.accounts.id.renderButton(button, {
          theme: 'outline',
          size: 'large',
          width: 350,
          text: 'continue_with',
          shape: 'rect',
        })
        button.dataset.googleRendered = 'true'
      }
    }

    if (window.google?.accounts?.id) {
      initializeGoogle()
    } else {
      let script = document.querySelector('script[data-google-identity]')

      if (!script) {
        script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.dataset.googleIdentity = 'true'
        document.head.appendChild(script)
      }

      script.addEventListener('load', initializeGoogle)
    }

    return () => {
      cancelled = true
    }
  }, [googleClientId, login, navigate])

async function requestResetCode(e) {
  e.preventDefault()
  setResetMessage('')
  setResetLoading(true)

  try {
    const data = await apiJson('/api/auth/password-reset/request/', {
      method: 'POST',
      auth: false,
      body: { email: resetEmail },
    })

    setResetStage(1)
    setResetMessage(data.detail || 'Reset code sent successfully. Check your Gmail.')
  } catch (err) {
    setResetMessage(err.message)
  } finally {
    setResetLoading(false)
  }
}
  async function confirmReset(e) {
  e.preventDefault()
  setResetMessage('')
  setResetLoading(true)

  try {
    const data = await apiJson('/api/auth/password-reset/confirm/', {
      method: 'POST',
      auth: false,
      body: {
        email: resetEmail,
        code: resetCode,
        new_password: newPassword,
      },
    })

    setResetStage(2)
    setResetMessage(
      data.detail || 'Your password has been reset successfully.'
    )
    setResetCode('')
    setNewPassword('')
  } catch (err) {
    setResetMessage(err.message)
  } finally {
    setResetLoading(false)
  }
}

function handleChange(e) {
  const { name, value } = e.target

  setFormData(prev => ({
    ...prev,
    [name]: value,
  }))
}
  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const data = await apiJson('/api/auth/login/', {
        method: 'POST',
        auth: false,
        body: formData,
      })

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
    <h2 className="font-semibold text-stone-100 mb-3">
      {resetStage === 2 ? 'Password Reset Complete' : 'Reset your password'}
    </h2>

    {resetStage === 0 && (
      <form onSubmit={requestResetCode} className="space-y-3">
        <input
          type="email"
          required
          value={resetEmail}
          onChange={e => setResetEmail(e.target.value)}
          placeholder="Your Gmail address"
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 p-3 text-white"
        />

        <button
          type="submit"
          disabled={resetLoading}
          className="w-full rounded-lg bg-amber-400 text-black font-semibold p-3 disabled:opacity-50"
        >
          {resetLoading ? 'Sending code...' : 'Send reset code'}
        </button>
      </form>
    )}

    {resetStage === 1 && (
      <form onSubmit={confirmReset} className="space-y-3">
        <input
          required
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={resetCode}
          onChange={e => setResetCode(e.target.value)}
          placeholder="6-digit code from Gmail"
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 p-3 text-white"
        />

        <input
          required
          minLength={8}
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="New password (8+ characters)"
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 p-3 text-white"
        />

        <button
          type="submit"
          disabled={resetLoading}
          className="w-full rounded-lg bg-amber-400 text-black font-semibold p-3 disabled:opacity-50"
        >
          {resetLoading ? 'Updating password...' : 'Update password'}
        </button>
      </form>
    )}

    {resetStage === 2 && (
      <div className="text-center py-3">
        <div className="text-4xl text-green-400 mb-3">✓</div>
        <p className="text-green-400 font-semibold">
          Password Reset Successful!
        </p>
        <p className="text-stone-400 text-sm mt-2">
          Your password has been changed. You can now sign in with your new password.
        </p>
        <button
          type="button"
          onClick={() => {
            setResetOpen(false)
            setResetStage(0)
            setResetMessage('')
          }}
          className="w-full mt-4 rounded-lg bg-amber-400 text-black font-semibold p-3"
        >
          Back to Sign In
        </button>
      </div>
    )}

    {resetMessage && resetStage !== 2 && (
      <p className="mt-3 text-sm text-amber-300">{resetMessage}</p>
    )}

    {resetStage !== 2 && (
      <button
        type="button"
        onClick={() => setResetOpen(false)}
        className="mt-3 text-xs text-stone-400"
      >
        Close
      </button>
    )}
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
