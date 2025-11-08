import ConnectivityStatus from '../components/ConnectivityStatus'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between">
        <h1 className="text-6xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          1v1me
        </h1>
        <p className="text-center text-xl text-gray-600 dark:text-gray-300 mb-8">
          Challenge and compete in 1v1 matches
        </p>
        <div className="mb-8 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white/60 dark:bg-gray-800/60">
          <p className="text-center text-green-700 dark:text-green-300 font-medium">
            1V1 me noob
            <a href="./ultimate-tic-tac-toe/ticTacToe.tsx">tic tac toe</a>
          </p>
          <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2">
            Check the example API route:{' '}
            <a className="underline hover:no-underline text-blue-600 dark:text-blue-400" href="/api/health" target="_blank" rel="noopener noreferrer">
              /api/health
            </a>
          </p>
          <ConnectivityStatus />
        </div>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Get Started
          </button>
          <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </main>
  )
}

