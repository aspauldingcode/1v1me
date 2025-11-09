"use client";

import Image from "next/image";
import RegisterGate from "@/components/RegisterGate";
import { useEffect, useMemo, useRef, useState } from "react";

type Move = "ROCK" | "PAPER" | "SCISSORS";
type MoveResponse = { username: string; rps: Move | null };
type GameObj = {
  type: "rockpaperscissors" | "tictactoe" | string;
  opponentUsername?: string;
  players?: string[];
  p1?: string;
  p2?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

function decideWinner(a: Move, b: Move): "YOU" | "OPPONENT" | "DRAW" {
  if (a === b) return "DRAW";
  if ((a === "ROCK" && b === "SCISSORS") || (a === "PAPER" && b === "ROCK") || (a === "SCISSORS" && b === "PAPER")) {
    return "YOU";
  }
  return "OPPONENT";
}

export default function RockPaperScissorsPage() {
  // identities
  const [you, setYou] = useState(() => (typeof window === "undefined" ? "" : localStorage.getItem("rps_you") || ""));
  const [opp, setOpp] = useState(() => (typeof window === "undefined" ? "" : localStorage.getItem("rps_opp") || ""));

  useEffect(() => { if (you) localStorage.setItem("rps_you", you.trim()); }, [you]);
  useEffect(() => { if (opp) localStorage.setItem("rps_opp", opp.trim()); }, [opp]);

  // matchmaking + round state
  const [game, setGame] = useState<GameObj | null>(null);
  const [phase, setPhase] = useState<"IDLE" | "QUEUING" | "CHOOSING" | "POLLING" | "DONE" | "ERROR">("IDLE");
  const [error, setError] = useState<string | null>(null);

  // moves
  const [yourMove, setYourMove] = useState<Move | null>(null);
  const [oppMove, setOppMove] = useState<Move | null>(null);

  /* ---------------- Queue loop ---------------- */
  const queueTimer = useRef<NodeJS.Timeout | null>(null);

  function stopQueue() {
    if (queueTimer.current) clearInterval(queueTimer.current);
    queueTimer.current = null;
  }
  useEffect(() => () => stopQueue(), []);

  async function startQueue() {
    const me = you.trim();
    if (!me) { setError("Enter your username."); return; }
    setError(null);
    setPhase("QUEUING");
    setGame(null);
    setOppMove(null);
    setYourMove(null);

    stopQueue();
    queueTimer.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/queue/${encodeURIComponent(me)}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Queue HTTP ${res.status}`);
        const txt = await res.text();
        if (!txt || txt === "null") return; // no match yet
        const obj: GameObj = JSON.parse(txt);
        setGame(obj);

        // Infer opponent username from returned object
        const inferredOpp =
          obj.opponentUsername ??
          obj.players?.find((p) => p !== me) ??
          (obj.p1 === me ? obj.p2 : obj.p1) ??
          opp;
        if (inferredOpp) setOpp(inferredOpp);

        if (obj.type === "rockpaperscissors") {
          setPhase("CHOOSING");
        } else {
          setPhase("ERROR");
          setError(`Queued into "${obj.type}", but this page only handles rock-paper-scissors.`);
        }
        stopQueue();
      } catch (e: any) {
        setPhase("ERROR");
        setError(e.message || "Queue failed");
        stopQueue();
      }
    }, 1000);
  }

  /* ------------- Submit move + poll opponent ------------- */
  const pollTimer = useRef<NodeJS.Timeout | null>(null);
  const pollCount = useRef(0);

  function stopPoll() {
    if (pollTimer.current) clearInterval(pollTimer.current);
    pollTimer.current = null;
  }
  useEffect(() => () => stopPoll(), []);

  async function submitMove(m: Move) {
    const me = you.trim();
    const opponent = opp.trim();
    if (!me || !opponent) { setError("Both usernames required."); return; }

    try {
      setError(null);
      setYourMove(m);
      setOppMove(null);
      setPhase("POLLING");

      // Send my move
      const r = await fetch(`${API}/set_move/rock_paper_scissors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ username: me, rps: m }),
      });
      if (!r.ok) throw new Error(`Submit HTTP ${r.status}`);

      // Begin polling opponent move
      stopPoll();
      pollCount.current = 0;
      pollTimer.current = setInterval(async () => {
        pollCount.current += 1;
        try {
          const res = await fetch(`${API}/get_move/rock_paper_scissors/${encodeURIComponent(opponent)}`, { cache: "no-store" });
          if (!res.ok) throw new Error(`Poll HTTP ${res.status}`);
          const data: MoveResponse = await res.json();
          if (data?.rps) {
            setOppMove(data.rps);
            stopPoll();
            setPhase("DONE");
          } else if (pollCount.current > 60) {
            stopPoll();
            setPhase("ERROR");
            setError("Opponent hasn't submitted a move (timeout).");
          }
        } catch (err: any) {
          stopPoll();
          setPhase("ERROR");
          setError(err.message || "Polling failed");
        }
      }, 1000);
    } catch (e: any) {
      setPhase("ERROR");
      setError(e.message || "Failed to submit move");
    }
  }

  const result = useMemo(() => (yourMove && oppMove ? decideWinner(yourMove, oppMove) : null), [yourMove, oppMove]);

  function resetRound(clearMatch = false) {
    stopPoll();
    setYourMove(null);
    setOppMove(null);
    setError(null);
    if (clearMatch) {
      setGame(null);
      setPhase("IDLE");
    } else {
      setPhase("CHOOSING");
    }
  }

  /* ---------------- Picture button ---------------- */
  function MovePic({ m, src, alt }: { m: Move; src: string; alt: string }) {
    const disabled = phase === "POLLING" || phase === "DONE";
    return (
      <button
        onClick={() => submitMove(m)}
        disabled={disabled}
        className={`w-full rounded-2xl border p-3 hover:shadow transition ${disabled ? "opacity-60" : ""}`}
      >
        <div className="flex items-center gap-3">
          <Image src={src} alt={alt} width={48} height={48} className="rounded-md" />
          <div className="text-lg font-medium">{alt}</div>
        </div>
      </button>
    );
  }

  return (
    <RegisterGate>
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Rock · Paper · Scissors</h1>

      {/* Top controls */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Your username</label>
          <input
            className="w-full px-3 py-2 border rounded-xl"
            value={you}
            onChange={(e) => setYou(e.target.value)}
            placeholder="e.g. joel"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Opponent (filled by queue)</label>
          <input
            className="w-full px-3 py-2 border rounded-xl"
            value={opp}
            onChange={(e) => setOpp(e.target.value)}
            placeholder="e.g. alex"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={startQueue}
            className="px-4 py-2 rounded-2xl border shadow-sm hover:shadow w-full"
            disabled={!you || phase === "QUEUING" || phase === "CHOOSING" || phase === "POLLING"}
          >
            {phase === "QUEUING" ? "Queueing…" : "Enter Queue"}
          </button>
          {phase !== "IDLE" && (
            <button onClick={() => resetRound(true)} className="px-3 py-2 rounded-2xl border">
              Reset
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {/* Game card */}
      {game && game.type === "rockpaperscissors" && (
        <div className="rounded-2xl border p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: YOU with three pictures */}
            <div>
              <div className="text-xs uppercase text-gray-500 mb-1">You</div>
              <div className="text-lg font-semibold mb-3">{you || "—"}</div>
              <div className="space-y-3">
                <MovePic m="ROCK"     src="/rps/rock.jpeg"     alt="Rock" />
                <MovePic m="PAPER"    src="/rps/paper.jpeg"    alt="Paper" />
                <MovePic m="SCISSORS" src="/rps/scissors.jpeg" alt="Scissors" />
              </div>
            </div>

            {/* Right: Opponent status */}
            <div>
              <div className="text-xs uppercase text-gray-500 mb-1">Opponent</div>
              <div className="text-lg font-semibold mb-3">{opp || "—"}</div>
              <div className="rounded-xl border p-4 h-[148px] flex items-center justify-center text-lg">
                {oppMove ? oppMove : (phase === "POLLING" || phase === "CHOOSING") ? "Thinking…" : "—"}
              </div>
            </div>
          </div>

          {/* Outcome tray */}
          {(yourMove || oppMove) && (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border p-3">
                <div className="text-xs text-gray-500">Your move</div>
                <div className="text-lg">{yourMove ?? "—"}</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-xs text-gray-500">Opponent move</div>
                <div className="text-lg">{oppMove ?? "—"}</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-xs text-gray-500">Outcome</div>
                <div className="text-lg">
                  {yourMove && oppMove
                    ? (decideWinner(yourMove, oppMove) === "YOU"
                        ? "🎉 You win!"
                        : decideWinner(yourMove, oppMove) === "OPPONENT"
                        ? "😤 You lose!"
                        : "🤝 Draw.")
                    : (phase === "POLLING" ? "Awaiting opponent…" : "—")}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </RegisterGate>
  );
}