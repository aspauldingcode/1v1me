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

  const updateGameState = (data: GameState) => {
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
    if (data.turn !== undefined) setTurn(data.turn)
    const winnerValue = data.winner ?? data.won ?? 0
    setWinner(winnerValue)
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
        setGameData(null)
        return
      }
      const text = await res.text()
      if (!text || text === "null" || text.trim() === "") {
        setGameData(null)
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

  // Poll game state continuously when it's not the player's turn
  useEffect(() => {
    if (!username || !gameData) return
    
    const myTacNumber = gameData.usernameToTacNumber?.[username] || 0
    const isMyTurn = gameData.turn === myTacNumber
    const gameEnded = (gameData.won ?? gameData.winner ?? 0) !== 0
    
    // Only poll when it's NOT the player's turn and game hasn't ended
    if (isMyTurn || gameEnded) return
    
    // Fetch immediately, then poll every second
    fetchGameState()
    const interval = setInterval(() => {
      fetchGameState()
    }, 1000)
    return () => clearInterval(interval)
  }, [username, gameData?.turn, gameData?.won, gameData?.winner, gameData?.usernameToTacNumber])

  const handleCellClick = async (cellIndex: number) => {
    if (!username || !gameData || isMakingMove) return
    if (board[cellIndex] !== "") return
    
    const myTacNumber = gameData.usernameToTacNumber?.[username] || 0
    if (gameData.turn !== myTacNumber) return
    if ((gameData.won ?? gameData.winner ?? 0) !== 0) return

    const row = Math.floor(cellIndex / 3)
    const col = cellIndex % 3

    setIsMakingMove(true)
    setError(null)

    try {
      const res = await fetch(`/api/make_move/tictactoe/${encodeURIComponent(username)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ username, location: [row, col] }),
      })

      if (!res.ok) {
        const text = await res.text()
        setError(`Move failed: ${text || res.status}`)
      } else {
        // Fetch updated game state after making move
        await fetchGameState()
      }
    } catch (err) {
      setError(`Error making move: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsMakingMove(false)
    }
  }

  const myTacNumber = username && gameData && gameData.usernameToTacNumber ? gameData.usernameToTacNumber[username] || 0 : 0
  const canMakeMove = !isMakingMove && turn === myTacNumber && winner === 0 && gameData !== null

  if (!username) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-6">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-6">
      <h1 className="text-4xl font-bold mb-4">Tic - Tac - Toe</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}
      
      {!gameData && (
        <p className="mb-4 text-lg">Loading game...</p>
      )}

      {gameData && (
        <div className="rounded-2xl border-4 border-black p-8 w-[400px] flex flex-col items-center justify-between">
          <div className="grid grid-cols-3 grid-rows-3 gap-2 w-48 h-48">
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

          <div className="flex justify-between w-full mt-6">
            <div className="text-left">
              <p className="font-semibold underline">You ({myTacNumber === 1 ? "X" : "O"})</p>
              <p>{username}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold underline">Opponent ({myTacNumber === 1 ? "O" : "X"})</p>
              <p>{opponent || "Waiting..."}</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            {winner === 0 ? (
              <p>{turn === myTacNumber ? "Your turn!" : "Opponent's turn"}</p>
            ) : (
              <p className="font-bold">{winner === myTacNumber ? "You won!" : "You lost!"}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
