"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Game = { type?: string } | null
type Users = Record<string, any>

export default function Home() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [users, setUsers] = useState<Users | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users', { cache: 'no-store' })
        if (res.ok) setUsers(await res.json())
      } catch {}
    }
    fetchUsers()
    const interval = setInterval(fetchUsers, 10000)
    return () => clearInterval(interval)
  }, [])

  const navigateToGame = (game: Game) => {
    const type = game?.type
    if (type === 'tictactoe') {
      // Store username in localStorage and navigate
      if (typeof window !== 'undefined' && username) {
        localStorage.setItem('username', username)
      }
      router.push(`/tictactoe?username=${encodeURIComponent(username)}`)
    } else if (type === 'rockpaperscissors' || type === 'rps') {
      router.push('/rock-paper-scissors')
    }
  }

  useEffect(() => {
    if (!polling || !username) return
    const poll = async () => {
      try {
        const res = await fetch(`/api/gamestate/${encodeURIComponent(username)}`, { cache: 'no-store' })
        if (res.ok) {
          const text = await res.text()
          if (text && text !== 'null' && text.trim() !== '') {
            try {
              const game = JSON.parse(text) as Game
              if (game && game.type) {
                setPolling(false)
                navigateToGame(game)
              }
            } catch {
              // Invalid JSON, continue polling
            }
          }
        }
      } catch {
        // Network error, continue polling
      }
    }
    const interval = setInterval(poll, 2000)
    return () => clearInterval(interval)
  }, [polling, username, router])

  const registered = username && users?.[username]
  const userList = users ? Object.keys(users) : []

  async function handleAction(action: 'register' | 'queue') {
    if (!username.trim()) {
      setMessage('Please enter a username.')
      return
    }
    if (action === 'queue' && !registered) {
      setMessage('Please register first.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const res = await fetch(`/api/${action}/${encodeURIComponent(username)}`, {
        method: 'POST',
        cache: 'no-store'
      })

      if (action === 'register') {
        if (res.ok || res.status === 409) {
          setMessage(res.status === 409 ? 'Already registered. You can queue now.' : 'Registered!')
        } else {
          setMessage(`Registration failed (${res.status})`)
        }
      } else {
        if (!res.ok) {
          const statusText = res.statusText || 'Unknown error'
          setMessage(`Queue failed (${res.status}: ${statusText})`)
          return
        }
        const text = await res.text()
        if (text && text !== 'null' && text.trim() !== '') {
          try {
            const game = JSON.parse(text) as Game
            if (game && game.type) {
              navigateToGame(game)
              return
            }
          } catch {
            // If JSON parsing fails, treat as null response
          }
        }
        setMessage('Queued. Waiting for opponent...')
        setPolling(true)
      }
    } catch {
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 dark:text-white">
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
              onChange={(e) => {
                setUsername(e.target.value)
                setMessage('')
              }}
              disabled={loading}
              placeholder="Enter username"
              className="flex-1 rounded-md border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/10"
            />
            <button
              onClick={() => handleAction('register')}
              disabled={loading || registered}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
            >
              {loading ? '...' : 'Register'}
            </button>
            {registered && (
              <button
                onClick={() => handleAction('queue')}
                disabled={loading || polling}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-blue-500"
              >
                {loading || polling ? '...' : 'Queue'}
              </button>
            )}
          </div>
          {registered && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Registered as <span className="font-medium">{username}</span>.</p>}
          {message && <p className="mt-2 text-xs text-slate-700 dark:text-slate-200">{message}</p>}
        </div>

        <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="text-base font-semibold">Active Users ({userList.length})</h2>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {userList.length > 0 ? (
              userList.map((u) => (
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
    </main>
  )
}
