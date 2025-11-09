"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type GameState = {
  type?: string
  winner?: number
  won?: number
  usernameToTacNumber?: Record<string, number>
  turn?: number
  totalBoard?: number[][]
}

export default function TicTacToe() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [board, setBoard] = useState<string[]>(Array(9).fill(""))
  const [opponent, setOpponent] = useState("")
  const [turn, setTurn] = useState(0)
  const [winner, setWinner] = useState(0)
  const [gameData, setGameData] = useState<GameState | null>(null)
  const [isMakingMove, setIsMakingMove] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gameEnded, setGameEnded] = useState(false)
  const [redirectCountdown, setRedirectCountdown] = useState(5)

  const updateGameState = (data: GameState) => {
    console.log('Updating game state:', { turn: data.turn, winner: data.winner, won: data.won, board: data.totalBoard })
    setGameData(data)
    if (data.usernameToTacNumber) {
      const entries = Object.entries(data.usernameToTacNumber)
      // Find opponent from usernameToTacNumber (current player is username)
      const myTacNumber = data.usernameToTacNumber[username] || 0
      entries.forEach(([name, num]) => {
        if (num !== myTacNumber && num !== 0) {
          setOpponent(name)
        }
      })
    }
    // Always update turn from gameData.turn
    if (data.turn !== undefined) {
      console.log('Setting turn to:', data.turn)
      setTurn(data.turn)
    }
    // winner is the integer (0 = ongoing, 1 or 2 = winner, -1 = cat's game/tie)
    const winnerValue = data.winner ?? (typeof data.won === 'number' ? data.won : 0)
    console.log('Game state update:', { winner: data.winner, won: data.won, winnerValue, turn: data.turn })
    setWinner(winnerValue)
    
    // Check if game has ended (winner is not 0, including -1 for cat's game)
    if (winnerValue !== 0 && !gameEnded) {
      setGameEnded(true)
      setRedirectCountdown(5)
    }
    if (data.totalBoard && Array.isArray(data.totalBoard) && data.totalBoard.length >= 3) {
      const flatBoard: string[] = []
      for (let row = 0; row < 3; row++) {
        if (data.totalBoard[row] && Array.isArray(data.totalBoard[row])) {
          for (let col = 0; col < 3; col++) {
            const cellValue = data.totalBoard[row][col]
            const cellIndex = row * 3 + col
            flatBoard[cellIndex] = cellValue === 1 ? "X" : cellValue === 2 ? "O" : ""
          }
        }
      }
      setBoard(flatBoard)
    }
  }

  const fetchGameState = async () => {
    if (!username) return
    try {
      const res = await fetch(`/api/gamestate/${encodeURIComponent(username)}`, { cache: 'no-store' })
      if (!res.ok) {
        // If game ended and both users acknowledged, backend returns null
        if (res.status === 404 || res.status === 200) {
          const text = await res.text()
          if (!text || text === "null" || text.trim() === "") {
            // Game has ended and been removed, redirect to homepage
            console.log('Game ended, redirecting to homepage')
            setTimeout(() => {
              router.push('/?message=Game ended! Please queue for another match.')
            }, 2000)
            return
          }
        }
        setGameData(null)
        return
      }
      const text = await res.text()
      if (!text || text === "null" || text.trim() === "") {
        // Game has ended and been removed, but make sure we've shown the winner first
        if (gameEnded) {
          // Already showed winner, redirect after countdown
          return
        }
        // Game was removed before we saw the winner, redirect immediately
        console.log('Game ended (null response), redirecting to homepage')
        setTimeout(() => {
          router.push('/?message=Game ended! Please queue for another match.')
        }, 2000)
        return
      }
      try {
        const data: GameState = JSON.parse(text)
        if (data && (data.type || data.usernameToTacNumber || data.turn !== undefined)) {
          updateGameState(data)
        } else {
          setGameData(null)
        }
      } catch {
        setGameData(null)
      }
    } catch {
      setGameData(null)
    }
  }
  
  // Get username from localStorage on mount (stored during registration)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const storedUsername = localStorage.getItem('username')
    
    if (storedUsername) {
      setUsername(storedUsername)
    } else {
      // No username found, redirect to homepage
      router.push('/')
    }
  }, [router])

  // Fetch game state immediately when username is available
  useEffect(() => {
    if (username) {
      fetchGameState()
    }
  }, [username])

  // Countdown timer when game ends
  useEffect(() => {
    if (!gameEnded) return
    
    setRedirectCountdown(5)
    const countdownInterval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          router.push('/?message=Game ended! Please queue for another match.')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(countdownInterval)
  }, [gameEnded, router])

  // Poll game state continuously when it's not the player's turn
  useEffect(() => {
    if (!username || !gameData) return
    
    const myTacNumber = gameData.usernameToTacNumber?.[username] || 0
    const currentTurn = gameData.turn || 0
    const isMyTurn = currentTurn === myTacNumber
    const gameWinner = gameData.winner ?? (typeof gameData.won === 'number' ? gameData.won : 0)
    const gameHasEnded = gameWinner !== 0
    
    console.log('Polling check:', { myTacNumber, currentTurn, isMyTurn, gameHasEnded, gameEndedState: gameEnded, gameData })
    
    // Continue polling even after game ends to ensure both players see the result
    // Only stop polling if it's the player's turn and game hasn't ended
    if (isMyTurn && !gameHasEnded) {
      console.log('Stopping polling - my turn and game not ended')
      return
    }
    
    // If game ended and we've already set gameEnded state, poll a few more times then stop
    if (gameHasEnded && gameEnded) {
      // Already showing winner, just poll a couple more times to ensure sync, then stop
      let pollCount = 0
      const interval = setInterval(() => {
        pollCount++
        if (pollCount >= 2) {
          clearInterval(interval)
          return
        }
        fetchGameState()
      }, 1000)
      return () => clearInterval(interval)
    }
    
    console.log('Starting polling - waiting for opponent or checking game end')
    // Fetch immediately, then poll every second
    fetchGameState()
    const interval = setInterval(() => {
      console.log('Polling for game state update...')
      fetchGameState()
    }, 1000)
    return () => {
      console.log('Clearing polling interval')
      clearInterval(interval)
    }
  }, [username, gameData?.turn, gameData?.winner, gameData?.won, gameData?.usernameToTacNumber, gameEnded])

  const handleCellClick = async (cellIndex: number) => {
    if (!username || !gameData || isMakingMove) {
      console.log('Early return:', { username: !!username, gameData: !!gameData, isMakingMove })
      return
    }
    if (board[cellIndex] !== "") {
      console.log('Cell already occupied:', cellIndex)
      return
    }
    
    const myTacNumber = gameData.usernameToTacNumber?.[username] || 0
    if (gameData.turn !== myTacNumber) {
      console.log('Not your turn:', { turn: gameData.turn, myTacNumber })
      return
    }
    // Check if game ended: winner should be 0 if game is ongoing, 1/2 if someone won, -1 if cat's game
    const gameWinner = gameData.winner ?? (typeof gameData.won === 'number' ? gameData.won : 0)
    if (gameWinner !== 0) {
      console.log('Game already ended:', { winner: gameData.winner, won: gameData.won, gameWinner })
      return
    }

    const row = Math.floor(cellIndex / 3)
    const col = cellIndex % 3

    setIsMakingMove(true)
    setError(null)

    try {
      console.log('Making move:', { username, location: [row, col] })
      const res = await fetch(`/api/make_move/tictactoe/${encodeURIComponent(username)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ username, location: [row, col] }),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('Move failed:', text || res.status)
        setError(`Move failed: ${text || res.status}`)
      } else {
        console.log('Move successful, fetching game state')
        // Fetch updated game state after making move
        await fetchGameState()
      }
    } catch (err) {
      console.error('Error making move:', err)
      setError(`Error making move: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsMakingMove(false)
    }
  }

  const myTacNumber = username && gameData && gameData.usernameToTacNumber ? gameData.usernameToTacNumber[username] || 0 : 0
  const currentTurn = gameData?.turn || 0
  const gameWinner = gameData?.winner ?? (typeof gameData?.won === 'number' ? gameData.won : 0)
  const canMakeMove = !isMakingMove && currentTurn === myTacNumber && gameWinner === 0 && gameData !== null
  
  console.log('Render check:', { myTacNumber, currentTurn, canMakeMove, turn, gameDataTurn: gameData?.turn })

  if (!username) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-6">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4 sm:p-6">
      <h1 className="text-2xl sm:text-4xl font-bold mb-4 text-center">Tic - Tac - Toe</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}
      
      {!gameData && (
        <p className="mb-4 text-lg">Loading game...</p>
      )}

      {gameData && (
        <div className="rounded-2xl border-4 border-black p-4 sm:p-8 w-full max-w-[400px] flex flex-col items-center justify-between">
          <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full max-w-[192px] sm:w-48 sm:h-48 aspect-square">
            {board.map((cell, i) => (
              <button
                key={i}
                onClick={() => handleCellClick(i)}
                disabled={!canMakeMove || cell !== ""}
                className={`border-2 border-black w-full h-full flex items-center justify-center text-3xl font-bold ${
                  canMakeMove && cell === "" ? "cursor-pointer hover:bg-gray-100 active:bg-gray-200" : "cursor-not-allowed opacity-60"
                }`}
              >
                {cell}
              </button>
            ))}
          </div>

          <div className="flex justify-between w-full mt-4 sm:mt-6 text-sm sm:text-base">
            <div className="text-left">
              <p className="font-semibold underline">You ({myTacNumber === 1 ? "X" : "O"})</p>
              <p className="break-all">{username}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold underline">Opponent ({myTacNumber === 1 ? "O" : "X"})</p>
              <p className="break-all">{opponent || "Waiting..."}</p>
            </div>
          </div>

          <div className="mt-4 text-center text-sm sm:text-base">
            {gameWinner === 0 ? (
              <p>{currentTurn === myTacNumber ? "Your turn!" : "Opponent's turn"}</p>
            ) : gameWinner === -1 ? (
              <div>
                <p className="font-bold text-xl sm:text-2xl mb-2">Cat's game! 🐱 It's a tie!</p>
                {gameEnded && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">
                    Redirecting to homepage in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="font-bold text-xl sm:text-2xl mb-2">{gameWinner === myTacNumber ? "You won! 🎉" : "You lost! 😔"}</p>
                {gameEnded && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">
                    Redirecting to homepage in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
