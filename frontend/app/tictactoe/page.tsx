"use client";

import { useEffect, useState } from "react";

interface GameState {
  type: string;
  winner: number;
  usernameToTacNumber: Record<string, number>;
  turn: number;
}

export default function TicTacToe() {
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [player, setPlayer] = useState("");
  const [opponent, setOpponent] = useState("");
  const [turn, setTurn] = useState(0);
  const [winner, setWinner] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : null;

  useEffect(() => {
    if (!username) return;

    const fetchGameState = async () => {
      try {
        const res = await fetch(`${API_URL}/api/gameState/${username}`);
        const data: GameState = await res.json();

        // Identify players
        const entries = Object.entries(data.usernameToTacNumber);
        const currentPlayer = entries.find(([, num]) => num === 1)?.[0] || "";
        const opponentPlayer = entries.find(([, num]) => num === 2)?.[0] || "";

        setPlayer(currentPlayer);
        setOpponent(opponentPlayer);
        setTurn(data.turn);
        setWinner(data.winner);

        // (Optional) If your API later includes board data:
        // setBoard(data.board);

      } catch (err) {
        console.error("Error fetching game:", err);
      }
    };

    fetchGameState();
    const interval = setInterval(fetchGameState, 1000);
    return () => clearInterval(interval);
  }, [API_URL, username]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black">
      <h1 className="text-4xl font-bold mb-8">Tic - Tac - Toe</h1>

      <div className="rounded-2xl border-4 border-black p-8 w-[400px] h-[400px] flex flex-col items-center justify-between">
        {/* Game board */}
        <div className="grid grid-cols-3 grid-rows-3 gap-2 w-48 h-48">
          {board.map((cell, i) => (
            <div
              key={i}
              className="border-2 border-black w-full h-full flex items-center justify-center text-3xl font-bold cursor-pointer hover:bg-gray-100"
            >
              {cell}
            </div>
          ))}
        </div>

        {/* Player info */}
        <div className="flex justify-between w-full mt-6">
          <div className="text-left">
            <p className="font-semibold underline">
              You ({player === username ? "X" : "O"})
            </p>
            <p>{player}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold underline">
              Opponent ({player === username ? "O" : "X"})
            </p>
            <p>{opponent}</p>
          </div>
        </div>

        {/* Game status */}
        <div className="mt-4 text-center">
          {winner === 0 ? (
            <p>{turn === data?.usernameToTacNumber[username] ? "Your turn!" : "Opponent’s turn"}</p>
          ) : (
            <p className="font-bold">
              {winner === data?.usernameToTacNumber[username]
                ? "You won!"
                : "You lost!"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
