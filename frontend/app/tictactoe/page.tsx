"use client";

import { useEffect, useState, useRef } from "react";
import RegisterGate from "@/components/RegisterGate";

interface GameState {
  type?: string;
  winner?: number;
  won?: number;
  usernameToTacNumber?: Record<string, number>;
  turn?: number;
  totalBoard?: number[][]; // 2D array: [row][col]
}

export default function TicTacToe() {
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [player, setPlayer] = useState("");
  const [opponent, setOpponent] = useState("");
  const [turn, setTurn] = useState(0);
  const [winner, setWinner] = useState(0);
  const [gameData, setGameData] = useState<GameState | null>(null);
  const [isQueued, setIsQueued] = useState(false);
  const [isMakingMove, setIsMakingMove] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queueIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const username =
    typeof window !== "undefined" ? localStorage.getItem("username") : null;

  // Update game state from backend response
  const updateGameState = (data: GameState) => {
    setGameData(data);

    // Handle usernameToTacNumber (may be missing if backend doesn't serialize)
    if (data.usernameToTacNumber) {
      const entries = Object.entries(data.usernameToTacNumber);
      const currentPlayer = entries.find(([, num]) => num === 1)?.[0] || "";
      const opponentPlayer = entries.find(([, num]) => num === 2)?.[0] || "";
      setPlayer(currentPlayer);
      setOpponent(opponentPlayer);
    }

    // Handle turn
    if (data.turn !== undefined) {
      setTurn(data.turn);
    }

    // Handle winner
    const winnerValue = data.winner ?? data.won ?? 0;
    setWinner(winnerValue);

    // Update board state if available (convert 2D array to 1D for display)
    if (data.totalBoard && Array.isArray(data.totalBoard) && data.totalBoard.length >= 3) {
      const flatBoard: string[] = [];
      for (let row = 0; row < 3; row++) {
        if (data.totalBoard[row] && Array.isArray(data.totalBoard[row])) {
          for (let col = 0; col < 3; col++) {
            const cellValue = data.totalBoard[row][col];
            const cellIndex = row * 3 + col;
            if (cellValue === 1) {
              flatBoard[cellIndex] = "X";
            } else if (cellValue === 2) {
              flatBoard[cellIndex] = "O";
            } else {
              flatBoard[cellIndex] = "";
            }
          }
        }
      }
      setBoard(flatBoard);
    }
  };

  // Fetch current game state
  const fetchGameState = async () => {
    if (!username) return;

    try {
      const res = await fetch(`/api/gamestate/${encodeURIComponent(username)}`, { cache: 'no-store' });
      const text = await res.text();
      
      // Handle null or empty responses
      if (!text || text === "null" || text.trim() === "" || text.trim() === "null") {
        setGameData(null);
        return;
      }

      // Try to parse JSON
      try {
        const data: GameState = JSON.parse(text);
        if (data && (data.type || data.usernameToTacNumber || data.turn !== undefined)) {
          updateGameState(data);
        } else {
          setGameData(null);
        }
      } catch (parseErr) {
        console.error("Failed to parse game state:", parseErr);
        setGameData(null);
      }
    } catch (err) {
      console.error("Error fetching game:", err);
      setGameData(null);
    }
  };

  // Queue up for a game
  const queueUp = async () => {
    if (!username) {
      setError("Please register a username first");
      return;
    }
    setIsQueued(true);
    setError(null);
    setGameData(null);

    // Start polling queue
    if (queueIntervalRef.current) {
      clearInterval(queueIntervalRef.current);
    }

    queueIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/queue/${encodeURIComponent(username)}`, {
          method: 'POST',
          cache: 'no-store'
        });
        
        if (res.ok) {
          const text = await res.text();
          if (text && text !== "null" && text.trim() !== "") {
            try {
              const gameData: GameState = JSON.parse(text);
              if (gameData && gameData.type) {
                setIsQueued(false);
                if (queueIntervalRef.current) {
                  clearInterval(queueIntervalRef.current);
                  queueIntervalRef.current = null;
                }
                // Game found, start polling game state
                fetchGameState();
              }
            } catch (e) {
              // Not JSON or invalid, keep polling
            }
          }
        }
      } catch (err) {
        console.error("Error queueing:", err);
      }
    }, 1000);
  };

  // Poll game state when in a game
  useEffect(() => {
    if (!username || !gameData || isQueued) return;

    fetchGameState();
    const interval = setInterval(fetchGameState, 1000);
    return () => clearInterval(interval);
  }, [username, isQueued]);

  // Cleanup queue interval
  useEffect(() => {
    return () => {
      if (queueIntervalRef.current) {
        clearInterval(queueIntervalRef.current);
      }
    };
  }, []);

  // Make a move
  const handleCellClick = async (cellIndex: number) => {
    if (!username || !gameData || isMakingMove) return;
    if (board[cellIndex] !== "") return; // Cell already occupied
    if (turn !== myTacNumber) return; // Not your turn

    // Convert 1D index to 2D [row, col]
    const row = Math.floor(cellIndex / 3);
    const col = cellIndex % 3;

    setIsMakingMove(true);
    setError(null);

    try {
      const movePayload = {
        username: username,
        location: [row, col]
      };

      const res = await fetch(`/api/make_move/tictactoe/${encodeURIComponent(username)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify(movePayload),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(`Move failed: ${text || res.status}`);
      } else {
        // Refresh game state after move
        setTimeout(() => {
          fetchGameState();
        }, 100);
      }
    } catch (err) {
      setError(`Error making move: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsMakingMove(false);
    }
  };

  const myTacNumber =
    username && gameData && gameData.usernameToTacNumber
      ? gameData.usernameToTacNumber[username] || 0
      : 0;

  const canMakeMove = !isMakingMove && turn === myTacNumber && winner === 0 && gameData !== null;

  return (
    <RegisterGate>
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-6">
      <h1 className="text-4xl font-bold mb-4">Tic - Tac - Toe</h1>

      {/* Queue button */}
      {!gameData && !isQueued && (
        <button
          onClick={queueUp}
          className="mb-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Enter Queue
        </button>
      )}

      {isQueued && (
        <p className="mb-4 text-lg">Waiting for opponent...</p>
      )}

      {error && (
        <p className="mb-4 text-red-600">{error}</p>
      )}

      {gameData && (
        <div className="rounded-2xl border-4 border-black p-8 w-[400px] flex flex-col items-center justify-between">
          {/* Game board */}
          <div className="grid grid-cols-3 grid-rows-3 gap-2 w-48 h-48">
            {board.map((cell, i) => (
              <button
                key={i}
                onClick={() => handleCellClick(i)}
                disabled={!canMakeMove || cell !== ""}
                className={`border-2 border-black w-full h-full flex items-center justify-center text-3xl font-bold ${
                  canMakeMove && cell === "" 
                    ? "cursor-pointer hover:bg-gray-100 active:bg-gray-200" 
                    : "cursor-not-allowed opacity-60"
                }`}
              >
                {cell}
              </button>
            ))}
          </div>

        {/* Player info */}
        <div className="flex justify-between w-full mt-6">
          <div className="text-left">
            <p className="font-semibold underline">
              You ({myTacNumber === 1 ? "X" : "O"})
            </p>
            <p>{player}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold underline">
              Opponent ({myTacNumber === 1 ? "O" : "X"})
            </p>
            <p>{opponent}</p>
          </div>
        </div>

          {/* Game status */}
          <div className="mt-4 text-center">
            {winner === 0 ? (
              <p>
                {turn === myTacNumber ? "Your turn!" : "Opponent's turn"}
              </p>
            ) : (
              <p className="font-bold">
                {winner === myTacNumber ? "You won!" : "You lost!"}
              </p>
            )}
          </div>
        </div>
      )}

      {!gameData && !isQueued && (
        <p className="mt-4 text-gray-600">Enter the queue to start a game</p>
      )}
    </div>
    </RegisterGate>
  );
}
