"use client"
import { Board } from './tictactoe'

export default function TicTacToePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-bold">Tic-Tac-Toe</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Play locally for now — backend integration coming soon.</p>
        <div className="mt-6">
          <Board />
        </div>
      </section>
    </main>
  )
}