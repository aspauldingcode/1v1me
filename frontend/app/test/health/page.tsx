'use client'

import { useState } from 'react'

type HealthResponse = { status?: string; message?: string; timestamp?: string }

export default function HealthTestPage() {
  const [backend, setBackend] = useState<{ data?: HealthResponse; error?: string; loading: boolean }>({ loading: false })
  const [frontend, setFrontend] = useState<{ data?: HealthResponse; error?: string; loading: boolean }>({ loading: false })

  const fetchHealth = async (endpoint: string, setter: typeof setBackend) => {
    setter({ loading: true })
    try {
      const res = await fetch(endpoint, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setter({ data: await res.json(), loading: false })
    } catch (err) {
      setter({ error: err instanceof Error ? err.message : 'Unknown error', loading: false })
    }
  }

  return (
    <main className="min-h-screen p-6 flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Health Connectivity Test</h1>
      <p className="text-sm text-gray-600">
        Test backend Spring API via <code>/api/health</code> and frontend API route at <code>/api/frontend-health</code>.
      </p>

      {(['/api/backend-health', '/api/frontend-health'] as const).map((endpoint, i) => {
        const state = i === 0 ? backend : frontend
        const setter = i === 0 ? setBackend : setFrontend
        return (
          <section key={endpoint} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">{endpoint}</h2>
              <button
                onClick={() => fetchHealth(endpoint, setter)}
                className="rounded bg-black text-white px-3 py-1 text-sm disabled:opacity-50"
                disabled={state.loading}
              >
                {state.loading ? 'Loading…' : 'Refresh'}
              </button>
            </div>
            {state.error && <p className="mt-2 text-red-600 text-sm">Error: {state.error}</p>}
            <pre className="mt-3 rounded bg-gray-100 p-3 text-sm overflow-auto">
              {JSON.stringify(state.data, null, 2)}
            </pre>
          </section>
        )
      })}
    </main>
  )
}
