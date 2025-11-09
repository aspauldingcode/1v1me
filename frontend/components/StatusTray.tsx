"use client"
import { useCallback, useEffect, useState } from 'react'

type Status = { ok: boolean | null; code?: number }

const endpoints = ['/api/frontend-health', '/api/health']

export default function StatusTray() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Record<string, Status>>({})

  const checkEndpoint = useCallback(async (path: string) => {
    try {
      const res = await fetch(path, { cache: 'no-store' })
      setStatus(s => ({ ...s, [path]: { ok: res.ok, code: res.status } }))
    } catch {
      setStatus(s => ({ ...s, [path]: { ok: false } }))
    }
  }, [])

  const refreshAll = useCallback(() => endpoints.forEach(checkEndpoint), [checkEndpoint])

  useEffect(() => {
    if (open) {
      refreshAll()
      const id = setInterval(refreshAll, 30000)
      return () => clearInterval(id)
    }
  }, [open, refreshAll])

  return (
    <>
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-4 right-4 z-40 h-11 w-11 rounded-full border border-black/10 bg-white text-slate-900 shadow-sm hover:shadow-md dark:border-white/10 dark:bg-white/10 dark:text-white"
      >
        <span className="text-lg">ℹ️</span>
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-40 w-80 rounded-xl border border-black/10 bg-white/95 p-4 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/90">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">System Status</h3>
            <button
              onClick={refreshAll}
              className="rounded-md border border-black/10 bg-white/60 px-2 py-1 text-xs dark:border-white/10 dark:bg-white/10"
            >
              Refresh
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {endpoints.map(path => {
              const s = status[path] || { ok: null }
              const text = s.ok === null ? 'Checking…' : s.ok ? 'OK' : 'DOWN'
              const color = s.ok === null ? 'bg-gray-400' : s.ok ? 'bg-green-500' : 'bg-red-500'
              return (
                <div key={path} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${color}`} />
                    <span className="text-sm">{path === '/api/health' ? 'Backend' : 'Frontend'}</span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300">{text}{s.code ? ` (${s.code})` : ''}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
