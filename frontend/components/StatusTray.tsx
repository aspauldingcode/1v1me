"use client"
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import validator from 'validator'

type Endpoint = {
  label: string
  path: string
  category: 'frontend' | 'backend'
}

type Status = {
  ok: boolean | null
  code?: number
  timestamp?: string
}

const endpoints: Endpoint[] = [
  { label: 'Frontend API Health', path: '/api/frontend-health', category: 'frontend' },
  { label: 'Backend Health', path: '/api/health', category: 'backend' },
]

export default function StatusTray() {
  const [open, setOpen] = useState(false)
  const [statusMap, setStatusMap] = useState<Record<string, Status>>(() => {
    const initial: Record<string, Status> = {}
    endpoints.forEach((e) => (initial[e.path] = { ok: null }))
    return initial
  })

  // Register username state
  const [usernameInput, setUsernameInput] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerResult, setRegisterResult] = useState<null | { ok: boolean; code?: number; message: string }>(null)
  const [localUserCount, setLocalUserCount] = useState(0)

  const frontendConnectivity = useMemo(() => {
    const s = statusMap['/api/frontend-health']
    return s?.ok ?? null
  }, [statusMap])

  const backendConnectivity = useMemo(() => {
    const s = statusMap['/api/health']
    return s?.ok ?? null
  }, [statusMap])

  const checkEndpoint = useCallback(async (ep: Endpoint) => {
    try {
      const res = await fetch(ep.path, { cache: 'no-store' })
      const ts = new Date().toISOString()
      setStatusMap((m) => ({ ...m, [ep.path]: { ok: res.ok, code: res.status, timestamp: ts } }))
    } catch (err) {
      const ts = new Date().toISOString()
      setStatusMap((m) => ({ ...m, [ep.path]: { ok: false, code: undefined, timestamp: ts } }))
    }
  }, [])

  const refreshAll = useCallback(async () => {
    for (const ep of endpoints) await checkEndpoint(ep)
  }, [checkEndpoint])

  useEffect(() => {
    if (open) {
      void refreshAll()
      const id = setInterval(() => void refreshAll(), 30000)
      return () => clearInterval(id)
    }
  }, [open, refreshAll])

  function sanitizeUsername(raw: string) {
    const trimmed = validator.trim(raw)
    // Allow only alphanumerics, underscore, and hyphen
    const whitelisted = validator.whitelist(trimmed, 'a-zA-Z0-9_-')
    return whitelisted
  }

  function refreshLocalUsers() {
    try {
      const key = 'onevoneme.users'
      const val = localStorage.getItem(key)
      if (!val) {
        setLocalUserCount(0)
        return
      }
      const obj = JSON.parse(val)
      const count = typeof obj === 'object' && obj ? Object.keys(obj).length : 0
      setLocalUserCount(count)
    } catch {
      setLocalUserCount(0)
    }
  }

  useEffect(() => {
    if (open) refreshLocalUsers()
  }, [open])

  async function onRegister() {
    setRegisterResult(null)
    const sanitized = sanitizeUsername(usernameInput)

    // Validate using library
    const isLengthOk = validator.isLength(sanitized, { min: 3, max: 32 })
    const isCharsOk = validator.matches(sanitized, /^[A-Za-z0-9_-]+$/)
    if (!sanitized || !isLengthOk || !isCharsOk) {
      setRegisterResult({ ok: false, message: 'Invalid username. Use 3–32 characters: letters, digits, _ or -.' })
      return
    }

    try {
      setRegisterLoading(true)
      const res = await fetch(`/api/register/${encodeURIComponent(sanitized)}`, { method: 'POST', cache: 'no-store' })
      const ok = res.ok
      const code = res.status
      if (ok) {
        // Persist to localStorage map
        const key = 'onevoneme.users'
        try {
          const existing = localStorage.getItem(key)
          const map = existing ? JSON.parse(existing) : {}
          map[sanitized] = { registeredAt: new Date().toISOString() }
          localStorage.setItem(key, JSON.stringify(map))
          refreshLocalUsers()
        } catch {
          // ignore localStorage errors
        }
        setRegisterResult({ ok: true, code, message: `Registered '${sanitized}' successfully.` })
      } else {
        setRegisterResult({ ok: false, code, message: code === 400 ? 'Username taken.' : `Registration failed (${code}).` })
      }
    } catch (e) {
      setRegisterResult({ ok: false, message: 'Network error while registering.' })
    } finally {
      setRegisterLoading(false)
    }
  }

  function Badge({ ok, label }: { ok: boolean | null; label: string }) {
    const text = ok === null ? 'Checking…' : ok ? 'OK' : 'DOWN'
    const base = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium'
    const color = ok === null ? 'bg-gray-300 text-gray-800' : ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    return <span className={`${base} ${color}`}>{label}: {text}</span>
  }

  return (
    <>
      {/* Toggle button */}
      <button
        aria-label="Open system status"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-40 h-11 w-11 rounded-full border border-black/10 bg-white text-slate-900 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-white/10 dark:text-white"
      >
        <span className="text-lg">ℹ️</span>
      </button>

      {/* Tray panel */}
      {open && (
        <div className="fixed bottom-20 right-4 z-40 w-80 rounded-xl border border-black/10 bg-white/95 p-4 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/90">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">System Status</h3>
            <button
              onClick={() => void refreshAll()}
              className="rounded-md border border-black/10 bg-white/60 px-2 py-1 text-xs dark:border-white/10 dark:bg-white/10"
            >
              Refresh
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge ok={frontendConnectivity} label="Frontend" />
            <Badge ok={backendConnectivity} label="Backend" />
          </div>

        <div className="mt-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Endpoints</p>
          <ul className="mt-2 space-y-2">
            {endpoints.map((ep) => {
              const s = statusMap[ep.path]
              const ok = s?.ok ?? null
              const text = ok === null ? 'Checking…' : ok ? 'OK' : 'DOWN'
              const dot = ok === null ? 'bg-gray-400' : ok ? 'bg-green-500' : 'bg-red-500'
              return (
                <li key={ep.path} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block h-2 w-2 rounded-full ${dot}`} aria-hidden />
                    <a href={ep.path} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                      {ep.label}
                    </a>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300">{text}{s?.code ? ` (${s.code})` : ''}</span>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Register Username (frontend only) */}
        <div className="mt-4 border-t border-black/10 pt-4 dark:border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Register Username</p>
            <Link href="/register" className="text-xs text-blue-600 hover:underline dark:text-blue-400">Open page</Link>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              inputMode="text"
              placeholder="Enter username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="flex-1 rounded-md border border-black/10 bg-white/70 px-2 py-1 text-sm dark:border-white/10 dark:bg-white/10"
            />
            <button
              onClick={() => void onRegister()}
              disabled={registerLoading}
              className="rounded-md bg-slate-900 px-3 py-1 text-xs text-white disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
            >
              {registerLoading ? 'Registering…' : 'Register'}
            </button>
          </div>
          {registerResult && (
            <p className={`mt-2 text-xs ${registerResult.ok ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {registerResult.message}{registerResult.code ? ` (status ${registerResult.code})` : ''}
            </p>
          )}
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Allowed: letters, digits, underscore, hyphen. Stored locally: {localUserCount} user{localUserCount === 1 ? '' : 's'}.
          </p>
        </div>
      </div>
    )}
  </>
  )
}