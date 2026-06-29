'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })
    if (res?.ok) {
      router.push('/dashboard')
    } else {
      setError('Incorrect username or password.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏡</div>
          <h1 className="text-2xl font-display text-forest">Owner login</h1>
          <p className="text-stone text-sm mt-1">Staycation PH — Dashboard</p>
        </div>

        <div className="card">
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm text-stone mb-1.5 font-medium">Username</label>
              <input
                type="text"
                className="input"
                placeholder="admin"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm text-stone mb-1.5 font-medium">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full disabled:opacity-40"
              disabled={loading || !username || !password}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-stone/50 mt-6">
          <a href="/" className="hover:text-forest transition-colors">← Back to website</a>
        </p>
      </div>
    </main>
  )
}
