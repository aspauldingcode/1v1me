"use client";

import { useEffect, useState } from "react";

const API_URL: string = ""

export default function TicTacToe() {
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [player, setPlayer] = useState("you");
  const [opponent, setOpponent] = useState("opponent");

  // Fetch game state periodically
  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const res = await fetch(`${API_URL}/api/game`); // your API endpoint
        const data = await res.json();
        // Expecting something like { board: ["X", "", "O", ...], you: "Mekai", opponent: "Alex" }
        setBoard(data.board);
        setPlayer(data.you);
        setOpponent(data.opponent);
      } catch (err) {
        console.error("Error fetching game:", err);
      }
    };

    fetchGameState();
    const interval = setInterval(fetchGameState, 1000); // refresh every second
    return () => clearInterval(interval);
  }, []);

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
            <p className="font-semibold underline">You (X)</p>
            <p>{player}</p>
          </div>

          <div className="text-right">
            <p className="font-semibold underline">Opponent (O)</p>
            <p>{opponent}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
