'use client'

import { useEffect, useState } from 'react'

type HealthResponse = {
  status?: string
  message?: string
  timestamp?: string
}

export default function HealthTestPage() {
  const [backendHealth, setBackendHealth] = useState<HealthResponse | null>(null)
  const [frontendHealth, setFrontendHealth] = useState<HealthResponse | null>(null)
  const [loadingBackend, setLoadingBackend] = useState(false)
  const [loadingFrontend, setLoadingFrontend] = useState(false)
  const [errorBackend, setErrorBackend] = useState<string | null>(null)
  const [errorFrontend, setErrorFrontend] = useState<string | null>(null)

  useEffect(() => {
    // Auto-fetch on first render for convenience
    void handleFetchBackend()
    void handleFetchFrontend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleFetchBackend() {
    setLoadingBackend(true)
    setErrorBackend(null)
    try {
      const res = await fetch('/api/health', { cache: 'no-store' })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const data = (await res.json()) as HealthResponse
      setBackendHealth(data)
    } catch (err: unknown) {
      setErrorBackend(err instanceof Error ? err.message : 'Unknown error')
      setBackendHealth(null)
    } finally {
      setLoadingBackend(false)
    }
  }

  async function handleFetchFrontend() {
    setLoadingFrontend(true)
    setErrorFrontend(null)
    try {
      const res = await fetch('/api/frontend-health', { cache: 'no-store' })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const data = (await res.json()) as HealthResponse
      setFrontendHealth(data)
    } catch (err: unknown) {
      setErrorFrontend(err instanceof Error ? err.message : 'Unknown error')
      setFrontendHealth(null)
    } finally {
      setLoadingFrontend(false)
    }
  }

  return (
    <main className="min-h-screen p-6 flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Health Connectivity Test</h1>
      <p className="text-sm text-gray-600">
        This page tests both the backend Spring API via <code>/api/health</code> and the frontend API route at{' '}
        <code>/api/frontend-health</code>.
      </p>

      <section className="border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Backend /api/health</h2>
          <button
            onClick={handleFetchBackend}
            className="rounded bg-black text-white px-3 py-1 text-sm disabled:opacity-50"
            disabled={loadingBackend}
          >
            {loadingBackend ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        {errorBackend && <p className="mt-2 text-red-600 text-sm">Error: {errorBackend}</p>}
        <pre className="mt-3 rounded bg-gray-100 p-3 text-sm overflow-auto">
{JSON.stringify(backendHealth, null, 2)}
        </pre>
      </section>

      <section className="border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Frontend /api/frontend-health</h2>
          <button
            onClick={handleFetchFrontend}
            className="rounded bg-black text-white px-3 py-1 text-sm disabled:opacity-50"
            disabled={loadingFrontend}
          >
            {loadingFrontend ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        {errorFrontend && <p className="mt-2 text-red-600 text-sm">Error: {errorFrontend}</p>}
        <pre className="mt-3 rounded bg-gray-100 p-3 text-sm overflow-auto">
{JSON.stringify(frontendHealth, null, 2)}
        </pre>
      </section>
    </main>
  )
}


