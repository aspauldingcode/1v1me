import Link from 'next/link'

export default function Home() {
  const games = [
    {
      title: 'Tic-Tac-Toe',
      href: '/ultimate-tic-tac-toe',
      emoji: '🟦',
      description: 'Classic 3×3. Take turns and claim victory.',
      status: 'Play',
    },
    {
      title: 'Rock Paper Scissors',
      href: '/rock-paper-scissors',
      emoji: '🪨',
      description: 'Best of 3. Quick and fun.',
      status: 'Preview',
    },
    {
      title: 'Connect Four',
      href: '#',
      emoji: '🟡',
      description: 'Drop discs to connect a line.',
      status: 'Coming soon',
      disabled: true,
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 dark:text-white">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">1v1me</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Pick a minigame and challenge a friend. More games coming soon.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => {
            const CardInner = (
              <div
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
                aria-label={game.title}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl" aria-hidden>
                    {game.emoji}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                    {game.status}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-semibold">{game.title}</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{game.description}</p>
                <div className="mt-6">
                  <span className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                    Play <span className="transition group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
                {game.disabled && <div className="absolute inset-0 rounded-2xl bg-black/20" aria-hidden />}
              </div>
            )

            return game.disabled ? (
              <div key={game.title} aria-disabled className="cursor-not-allowed">
                {CardInner}
              </div>
            ) : (
              <Link key={game.title} href={game.href} className="block">
                {CardInner}
              </Link>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-400">
            Backend integration is rolling out; feel free to explore the UI.
          </p>
        </div>
      </section>
    </main>
  )
}

