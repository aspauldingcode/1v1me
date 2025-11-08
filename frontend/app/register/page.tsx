"use client"
import { useEffect, useState } from 'react'
import validator from 'validator'

function sanitizeUsername(raw: string) {
  const trimmed = validator.trim(raw)
  const whitelisted = validator.whitelist(trimmed, 'a-zA-Z0-9_-')
  return whitelisted
}

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | { ok: boolean; code?: number; message: string }>(null)
  const [localUsers, setLocalUsers] = useState<string[]>([])

  function refreshLocalUsers() {
    try {
      const key = 'onevoneme.users'
      const val = localStorage.getItem(key)
      if (!val) {
        setLocalUsers([])
        return
      }
      const obj = JSON.parse(val)
      const names = typeof obj === 'object' && obj ? Object.keys(obj) : []
      setLocalUsers(names)
    } catch {
      setLocalUsers([])
    }
  }

  useEffect(() => {
    refreshLocalUsers()
  }, [])

  async function register() {
    setResult(null)
    const sanitized = sanitizeUsername(username)
    const isLengthOk = validator.isLength(sanitized, { min: 3, max: 32 })
    const isCharsOk = validator.matches(sanitized, /^[A-Za-z0-9_-]+$/)
    if (!sanitized || !isLengthOk || !isCharsOk) {
      setResult({ ok: false, message: 'Invalid username. Use 3–32 characters: letters, digits, _ or -.' })
      return
    }
    try {
      setLoading(true)
      const res = await fetch(`/api/register/${encodeURIComponent(sanitized)}`, { method: 'POST', cache: 'no-store' })
      if (res.ok) {
        // Save to local storage map
        const key = 'onevoneme.users'
        try {
          const val = localStorage.getItem(key)
          const map = val ? JSON.parse(val) : {}
          map[sanitized] = { registeredAt: new Date().toISOString() }
          localStorage.setItem(key, JSON.stringify(map))
        } catch {}
        setResult({ ok: true, code: res.status, message: `Registered '${sanitized}' successfully.` })
        setUsername('')
        refreshLocalUsers()
      } else {
        setResult({ ok: false, code: res.status, message: res.status === 400 ? 'Username taken.' : `Registration failed (${res.status}).` })
      }
    } catch {
      setResult({ ok: false, message: 'Network error while registering.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Register Username</h1>
        <a href="/" className="text-sm text-blue-600 hover:underline dark:text-blue-400">Home</a>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">This uses POST <code>/api/register/{'{username}'}</code> with sanitized input.</p>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          inputMode="text"
          placeholder="Enter username (letters, digits, _ or -)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex-1 rounded-md border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/10"
        />
        <button
          onClick={() => void register()}
          disabled={loading}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
        >
          {loading ? 'Registering…' : 'Register'}
        </button>
      </div>

      {result && (
        <div className={`mt-3 text-sm ${result.ok ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
          {result.message}{result.code ? ` (status ${result.code})` : ''}
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-sm font-semibold">Local Users</h2>
        {localUsers.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">No users stored locally yet.</p>
        ) : (
          <ul className="mt-2 list-disc pl-5 text-sm">
            {localUsers.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}