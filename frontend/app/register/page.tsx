"use client"
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import validator from 'validator'

function sanitizeUsername(raw: string) {
  const trimmed = validator.trim(raw)
  const whitelisted = validator.whitelist(trimmed, 'a-zA-Z0-9_-')
  return whitelisted
}

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | { ok: boolean; code?: number; message: string }>(null)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [queueLoading, setQueueLoading] = useState(false)
  const [queueMessage, setQueueMessage] = useState<string | null>(null)
  const pollId = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    try {
      const cur = typeof window !== 'undefined' ? sessionStorage.getItem('onevoneme.currentUser') : null
      if (cur) setCurrentUser(cur)
    } catch {}
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
        try {
          sessionStorage.setItem('onevoneme.currentUser', sanitized)
          setCurrentUser(sanitized)
        } catch {}
        setResult({ ok: true, code: res.status, message: `Registered '${sanitized}' successfully.` })
        setUsername('')
      } else {
        if (res.status === 409) {
          try {
            sessionStorage.setItem('onevoneme.currentUser', sanitized)
            setCurrentUser(sanitized)
          } catch {}
          setResult({ ok: false, code: res.status, message: 'Username taken. You may queue with this name.' })
        } else if (res.status === 400) {
          let msg = 'Username not allowed by policy.'
          try {
            msg = await res.text() || msg
          } catch {}
          setResult({ ok: false, code: res.status, message: msg })
        } else {
          setResult({ ok: false, code: res.status, message: `Registration failed (${res.status}).` })
        }
      }
    } catch {
      setResult({ ok: false, message: 'Network error while registering.' })
    } finally {
      setLoading(false)
    }
  }

  function navigateForGame(game: { type?: string; [key: string]: any } | null) {
    const type = game && typeof game === 'object' ? game.type : undefined
    if (!type) return
    if (type === 'tictactoe') {
      router.push('/tictactoe')
    } else if (type === 'rockpaperscissors' || type === 'rps') {
      router.push('/rock-paper-scissors')
    }
  }

  async function pollGameState(name: string) {
    try {
      const res = await fetch(`/api/gamestate/${encodeURIComponent(name)}`, { cache: 'no-store' })
      if (res.ok) {
        const data = (await res.json()) as { type?: string } | null
        if (data) {
          if (pollId.current) {
            clearInterval(pollId.current)
            pollId.current = null
          }
          navigateForGame(data)
        }
      }
    } catch {}
  }

  async function onQueue() {
    setQueueMessage(null)
    const name = currentUser || ''
    const sanitized = sanitizeUsername(name)
    const isLengthOk = validator.isLength(sanitized, { min: 3, max: 32 })
    const isCharsOk = validator.matches(sanitized, /^[A-Za-z0-9_-]+$/)
    if (!sanitized || !isLengthOk || !isCharsOk) {
      setQueueMessage('Enter a valid username (3–32 letters/digits/_/-).')
      return
    }
    setQueueLoading(true)
    try {
      const res = await fetch(`/api/queue/${encodeURIComponent(sanitized)}`, { method: 'POST', cache: 'no-store' })
      if (!res.ok) {
        setQueueMessage(`Queue failed (status ${res.status}).`)
        return
      }
      const data = (await res.json()) as { type?: string } | null
      if (data) {
        navigateForGame(data)
        return
      }
      setQueueMessage('Queued. Waiting for opponent…')
      if (pollId.current) clearInterval(pollId.current)
      pollId.current = setInterval(() => void pollGameState(sanitized), 2000)
    } catch {
      setQueueMessage('Network error while queueing.')
    } finally {
      setQueueLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Register Username</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline dark:text-blue-400">Home</Link>
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

      {currentUser && (
        <div className="mt-6 rounded-md border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/10">
          <div className="flex items-center justify-between">
            <p className="text-sm">Current user: <span className="font-medium">{currentUser}</span></p>
            <button
              onClick={() => void onQueue()}
              disabled={queueLoading}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
            >
              {queueLoading ? 'Queueing…' : 'Queue Me'}
            </button>
          </div>
          {queueMessage && (
            <p className="mt-2 text-xs text-slate-700 dark:text-slate-200">{queueMessage}</p>
          )}
        </div>
      )}

      {/* Single-user session: no multi-user local listing */}
    </div>
  )
}