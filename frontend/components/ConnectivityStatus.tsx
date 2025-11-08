'use client'

import React from 'react'
import { useEffect, useState } from 'react'

type HealthResponse = {
  status?: string
  message?: string
  timestamp?: string
}

export default function ConnectivityStatus() {
  const [backendOk, setBackendOk] = useState<boolean | null>(null)
  const [frontendOk, setFrontendOk] = useState<boolean | null>(null)

  async function checkBackend() {
    try {
      const res = await fetch('/api/health', { cache: 'no-store' })
      setBackendOk(res.ok)
    } catch {
      setBackendOk(false)
    }
  }

  async function checkFrontend() {
    try {
      const res = await fetch('/api/frontend-health', { cache: 'no-store' })
      setFrontendOk(res.ok)
    } catch {
      setFrontendOk(false)
    }
  }

  useEffect(() => {
    void checkBackend()
    void checkFrontend()
    // Re-check periodically
    const id = setInterval(() => {
      void checkBackend()
      void checkFrontend()
    }, 30000)
    return () => clearInterval(id)
  }, [])

  function Badge({ ok, label }: { ok: boolean | null; label: string }) {
    const text = ok === null ? 'Checking…' : ok ? 'OK' : 'DOWN'
    const color =
      ok === null ? 'bg-gray-300 text-gray-800' : ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${color}`}>
        {label}: {text}
      </span>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center mt-4">
      <Badge ok={backendOk} label="Backend" />
      <Badge ok={frontendOk} label="Frontend API" />
    </div>
  )
}


