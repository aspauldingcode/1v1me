"use client"
import { useEffect, useState } from 'react'
import validator from 'validator'

export default function RegisterGate({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    try {
      const current = typeof window !== 'undefined' ? sessionStorage.getItem('onevoneme.currentUser') : null
      setOpen(!current)
    } catch {
      setOpen(true)
    }
  }, [])

  function sanitize(raw: string) {
    const trimmed = validator.trim(raw)
    return validator.whitelist(trimmed, 'a-zA-Z0-9_-')
  }

  async function register() {
    setMessage(null)
    const sanitized = sanitize(username)
    const isLengthOk = validator.isLength(sanitized, { min: 3, max: 32 })
    const isCharsOk = validator.matches(sanitized, /^[A-Za-z0-9_-]+$/)
    if (!sanitized || !isLengthOk || !isCharsOk) {
      setMessage('Invalid username. Use 3–32 characters: letters, digits, _ or -.')
      return
    }
    try {
      setLoading(true)
      const res = await fetch(`/api/register/${encodeURIComponent(sanitized)}`, { method: 'POST', cache: 'no-store' })
      if (res.ok) {
        try {
          sessionStorage.setItem('onevoneme.currentUser', sanitized)
        } catch {}
        setMessage(`Registered '${sanitized}' successfully. You may play now.`)
        setTimeout(() => setOpen(false), 600)
      } else if (res.status === 409) {
        // Username already exists: treat as success and proceed
        try {
          sessionStorage.setItem('onevoneme.currentUser', sanitized)
        } catch {}
        setMessage(`Username '${sanitized}' already exists. Continuing…`)
        setTimeout(() => setOpen(false), 600)
      } else {
        setMessage(`Registration failed (${res.status}).`)
      }
    } catch {
      setMessage('Network error while registering.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {children}

      {open && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-[92%] max-w-md rounded-xl border border-black/10 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-slate-900">
            <h2 className="text-base font-semibold">Registration Required</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Please register a username to play. You can still open the ℹ️ status tray.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter username"
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
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Allowed: letters, digits, underscore, hyphen.
            </p>
            {message && (
              <p className="mt-2 text-xs text-slate-700 dark:text-slate-200">{message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}