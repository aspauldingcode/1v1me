"use client"
import { useState } from 'react'

const choices = ['Rock', 'Paper', 'Scissors'] as const
type Choice = typeof choices[number]

function pickRandom(): Choice {
  return choices[Math.floor(Math.random() * choices.length)]
}

export default function RockPaperScissorsPage() {
  const [player, setPlayer] = useState<Choice | null>(null)
  const [cpu, setCpu] = useState<Choice | null>(null)
  const [result, setResult] = useState<string>('Make your move')

  function play(choice: Choice) {
    const cpuPick = pickRandom()
    setPlayer(choice)
    setCpu(cpuPick)
    if (choice === cpuPick) setResult('Draw')
    else if (
      (choice === 'Rock' && cpuPick === 'Scissors') ||
      (choice === 'Paper' && cpuPick === 'Rock') ||
      (choice === 'Scissors' && cpuPick === 'Paper')
    )
      setResult('You win')
    else setResult('You lose')
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-bold">Rock Paper Scissors</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Local preview. Backend API integration coming soon.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {choices.map((c) => (
            <button
              key={c}
              onClick={() => play(c)}
              className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-lg transition hover:-translate-y-0.5 hover:shadow dark:border-white/10 dark:bg-white/5"
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">You</p>
              <p className="text-xl font-semibold">{player ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">CPU</p>
              <p className="text-xl font-semibold">{cpu ?? '—'}</p>
            </div>
          </div>
          <p className="mt-4 text-center text-lg">{result}</p>
        </div>
      </section>
    </main>
  )
}