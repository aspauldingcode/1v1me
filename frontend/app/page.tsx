"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import validator from 'validator'

type BackendUsers = Record<string, { name?: string; gamesWon?: number; gamesPlayed?: number }>
type BackendGame = { type?: string; [key: string]: any } | null

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 dark:text-white">
      <QueueContent />
    </main>
  )
}

function QueueContent() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [users, setUsers] = useState<BackendUsers | null>(null)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [queueLoading, setQueueLoading] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [queueMessage, setQueueMessage] = useState<string | null>(null)
  const pollId = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    try {
      // On full page reload, clear session to allow re-registration
      const navEntries = typeof performance !== 'undefined' ? performance.getEntriesByType('navigation') : []
      const isReload = Array.isArray(navEntries) && navEntries[0] && (navEntries[0] as PerformanceNavigationTiming).type === 'reload'
      if (isReload) {
        try {
          sessionStorage.removeItem('onevoneme.currentUser')
          // Best-effort cookie clearing for same-origin cookies
          if (typeof document !== 'undefined') {
            document.cookie.split(';').forEach((c) => {
              const name = c.split('=')[0]?.trim()
              if (name) document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`
            })
          }
        } catch {}
      }
      const current = typeof window !== 'undefined' ? sessionStorage.getItem('onevoneme.currentUser') : null
      if (current) {
        setUsername(current)
        setCurrentUser(current)
      }
    } catch {}
  }, [])

  function sanitize(raw: string) {
    const trimmed = validator.trim(raw)
    return validator.whitelist(trimmed, 'a-zA-Z0-9_-')
  }

  async function fetchUsers() {
    setLoadingUsers(true)
    try {
      const res = await fetch('/api/users', { cache: 'no-store' })
      if (res.ok) {
        const data = (await res.json()) as BackendUsers
        setUsers(data)
      } else {
        setUsers(null)
      }
    } catch {
      setUsers(null)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    void fetchUsers()
    const id = setInterval(() => void fetchUsers(), 10000)
    return () => clearInterval(id)
  }, [])

  async function ensureRegistered(name: string): Promise<{ ok: boolean; status?: number }> {
    try {
      const res = await fetch(`/api/register/${encodeURIComponent(name)}`, { method: 'POST', cache: 'no-store' })
      if (res.ok) {
        try {
          sessionStorage.setItem('onevoneme.currentUser', name)
        } catch {}
        setCurrentUser(name)
        return { ok: true, status: res.status }
      }
      // Treat 409 CONFLICT as "already exists" and allow proceed
      if (res.status === 409) {
        try {
          sessionStorage.setItem('onevoneme.currentUser', name)
        } catch {}
        setCurrentUser(name)
        return { ok: true, status: res.status }
      }
      return { ok: false, status: res.status }
    } catch {
      return { ok: false }
    }
  }

  async function registerOnly() {
    setQueueMessage(null)
    const sanitized = sanitize(username)
    const isLengthOk = validator.isLength(sanitized, { min: 3, max: 32 })
    const isCharsOk = validator.matches(sanitized, /^[A-Za-z0-9_-]+$/)
    if (!sanitized || !isLengthOk || !isCharsOk) {
      setQueueMessage('Enter a valid username (3–32 letters/digits/_/-).')
      return
    }
    setRegisterLoading(true)
    try {
      const res = await fetch(`/api/register/${encodeURIComponent(sanitized)}`, { method: 'POST', cache: 'no-store' })
      if (res.ok) {
        try {
          sessionStorage.setItem('onevoneme.currentUser', sanitized)
        } catch {}
        setCurrentUser(sanitized)
        setQueueMessage(`Registered '${sanitized}' successfully.`)
      } else if (res.status === 409) {
        try {
          sessionStorage.setItem('onevoneme.currentUser', sanitized)
        } catch {}
        setCurrentUser(sanitized)
        setQueueMessage(`Username taken. You may queue with this name. (status ${res.status})`)
      } else if (res.status === 400) {
        let msg = 'Username not allowed by policy.'
        try {
          msg = await res.text() || msg
        } catch {}
        setQueueMessage(`${msg} (status ${res.status})`)
      } else {
        setQueueMessage(`Could not register username. Try again.${res.status ? ` (status ${res.status})` : ''}`)
      }
    } catch {
      setQueueMessage('Network error while registering.')
    } finally {
      setRegisterLoading(false)
    }
  }

  function navigateForGame(game: BackendGame) {
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
        const data = (await res.json()) as BackendGame
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
    if (!currentUser) {
      setQueueMessage('Please register a username first.')
      return
    }
    const sanitized = sanitize(currentUser)
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
      const data = (await res.json()) as BackendGame
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

  const userCount = useMemo(() => (users ? Object.keys(users).length : 0), [users])

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">1v1me</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Enter your username and queue for a 1v1 match. The system will choose the game automatically.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <label htmlFor="username" className="text-sm font-medium">Your username</label>
        <div className="mt-2 flex items-center gap-2">
          <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={!!currentUser}
          placeholder="Enter username"
          className="flex-1 rounded-md border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/10"
        />
        <button
          onClick={() => void (!currentUser ? registerOnly() : onQueue())}
          disabled={!currentUser ? registerLoading : queueLoading}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
        >
          {!currentUser ? (registerLoading ? 'Registering…' : 'Register') : (queueLoading ? 'Queueing…' : 'Queue Me')}
        </button>
      </div>
        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          Allowed: letters, digits, underscore, hyphen. Register first, then join queue.
        </p>
        {currentUser && (
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Registered as <span className="font-medium">{currentUser}</span>.</p>
        )}
        {queueMessage && (
          <p className="mt-2 text-xs text-slate-700 dark:text-slate-200">{queueMessage}</p>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Active Users</h2>
          <button
            onClick={() => void fetchUsers()}
            disabled={loadingUsers}
            className="rounded-md border border-black/10 bg-white/60 px-3 py-1 text-xs dark:border-white/10 dark:bg-white/10"
          >
            {loadingUsers ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Total: {userCount}</p>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {users && Object.keys(users).length > 0 ? (
            Object.keys(users).map((u) => (
              <li key={u} className="rounded-md border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/10">
                {u}
              </li>
            ))
          ) : (
            <li className="text-sm text-slate-500 dark:text-slate-400">No users yet.</li>
          )}
        </ul>
      </div>
    </section>
  )
}