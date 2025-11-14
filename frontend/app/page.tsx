"use client"
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import WebSocketService from './network/websocket/WebSocketService'

type Game = { type?: string } | null
type GameUser = {
  name?: string
  gamesWon?: number
  gamesPlayed?: number
}
type Users = Record<string, GameUser>

export default function Home() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [users, setUsers] = useState<Users | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [polling, setPolling] = useState(false)

  // Load username from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('username')
      if (storedUsername) {
        setUsername(storedUsername)
      }
    }
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users', { cache: 'no-store' })
        if (res.ok) setUsers(await res.json())
      } catch {}
    }
    fetchUsers()
    const interval = setInterval(fetchUsers, 5000)
    return () => clearInterval(interval)
  }, [])

  const navigateToGame = useCallback((game: Game) => {
    const type = game?.type
    if (type === 'tictactoe') {
      // Username already stored in localStorage from registration
      router.push('/tictactoe')
    }
  }, [router])

  const poll = async () => {
    try {
      const res = await fetch(`/api/gamestate/${encodeURIComponent(username)}`, { cache: 'no-store' })
      if (!res.ok) return;

      const text = await res.text()
      
      if (!text || text === 'null' || text.trim() === '') return;
      
      try {
        const game = JSON.parse(text) as Game
        if (game && game.type) {
          setPolling(false)
          navigateToGame(game)
          WebSocketService.connect(() => {
            console.log("Connecting to websocket...");
          });
        }
      } catch {}// Invalid JSON, continue polling
    } catch {} // Network error, continue polling
  }

  useEffect(() => {
    if (!polling || !username) return
    
    const interval = setInterval(poll, 1000)
    return () => clearInterval(interval)
  }, [polling, username, router, navigateToGame])

  const registered = !!(username && users?.[username])
  
  // Sort users by games won (descending), then by name
  const sortedUsers = users ? Object.entries(users)
    .map(([username, user]) => ({
      username,
      gamesWon: user?.gamesWon ?? 0,
      gamesPlayed: user?.gamesPlayed ?? 0
    }))
    .sort((a, b) => {
      // First sort by games won (descending)
      if (b.gamesWon !== a.gamesWon) {
        return b.gamesWon - a.gamesWon
      }
      // Then by username (ascending) for tie-breaking
      return a.username.localeCompare(b.username)
    }) : []

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

      if (action === 'register') { // handle register
        if (res.ok || res.status === 409) {
          // Store username in localStorage on successful registration
          if (typeof window !== 'undefined' && username) {
            localStorage.setItem('username', username)
          }
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
      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight sm:text-5xl">1v1me</h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 px-2">
            Enter your username and queue for a 1v1 match. The system will choose the game automatically.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-black/10 bg-white p-4 sm:p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <label htmlFor="username" className="text-sm font-medium">Your username</label>
          <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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
            <div className="flex gap-2">
              <button
                onClick={() => handleAction('register')}
                disabled={loading || registered}
                className="flex-1 sm:flex-none rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900 whitespace-nowrap"
              >
                {loading ? '...' : 'Register'}
              </button>
              {registered && (
                <button
                  onClick={() => handleAction('queue')}
                  disabled={loading || polling}
                  className="flex-1 sm:flex-none rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-blue-500 whitespace-nowrap"
                >
                  {loading || polling ? '...' : 'Queue'}
                </button>
              )}
            </div>
          </div>
          {registered && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Registered as <span className="font-medium">{username}</span>.</p>}
          {message && <p className="mt-2 text-xs text-slate-700 dark:text-slate-200 break-words">{message}</p>}
        </div>

        <div className="mt-8 rounded-2xl border border-black/10 bg-white p-4 sm:p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="text-base font-semibold">Leaderboard ({sortedUsers.length})</h2>
          <ul className="mt-3 space-y-2">
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user, index) => (
                <li 
                  key={user.username} 
                  className="rounded-md border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-400 w-6 text-right">
                      {index + 1}.
                    </span>
                    <span className="font-medium">{user.username}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {user.gamesWon} win{user.gamesWon !== 1 ? 's' : ''}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span>{user.gamesPlayed} game{user.gamesPlayed !== 1 ? 's' : ''}</span>
                  </div>
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
