"use client"

import { useCallback, useEffect, useState } from "react"
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
  const [redirectCountdown, setRedirectCountdown] = useState(10)

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
  return (
    <></>
  )
}
