"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Move = "ROCK" | "PAPER" | "SCISSORS";
type MoveResponse = { username: string; rps: Move | null };

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

function decideWinner(a: Move, b: Move): "YOU" | "OPPONENT" | "DRAW" {
  if (a === b) return "DRAW";
  if (
    (a === "ROCK" && b === "SCISSORS") ||
    (a === "PAPER" && b === "ROCK") ||
    (a === "SCISSORS" && b === "PAPER")
  )
    return "YOU";
  return "OPPONENT";
}

export default function RockPaperScissorsPage() {
  // user identities (typed manually)
  const [you, setYou] = useState(
    () => (typeof window === "undefined" ? "" : localStorage.getItem("rps_you") || "")
  );
  const [opp, setOpp] = useState(
    () => (typeof window === "undefined" ? "" : localStorage.getItem("rps_opp") || "")
  );
  useEffect(() => { if (you) localStorage.setItem("rps_you", you.trim()); }, [you]);
  useEffect(() => { if (opp) localStorage.setItem("rps_opp", opp.trim()); }, [opp]);

  // round state
  const [yourMove, setYourMove] = useState<Move | null>(null);
  const [oppMove, setOppMove] = useState<Move | null>(null);
  const [phase, setPhase] = useState<"IDLE" | "POLLING" | "DONE" | "ERROR">("IDLE");
  const [error, setError] = useState<string | null>(null);

  // polling timer
  const pollTimer = useRef<NodeJS.Timeout | null>(null);
  const pollCount = useRef(0);
  function stopPoll() {
    if (pollTimer.current) clearInterval(pollTimer.current);
    pollTimer.current = null;
  }
  useEffect(() => () => stopPoll(), []);

  // submit your move, then poll opponent
  async function submitMove(m: Move) {
    const me = you.trim();
    const opponent = opp.trim();
    if (!me || !opponent) {
      setError("Enter both usernames.");
      return;
    }
    try {
      setError(null);
      setYourMove(m);
      setOppMove(null);
      setPhase("POLLING");

      const r = await fetch(`${API}/set_move/rock_paper_scissors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ username: me, rps: m }),
      });
      if (!r.ok) throw new Error(`Submit HTTP ${r.status}`);

      // poll opponent
      pollCount.current = 0;
      stopPoll();
      pollTimer.current = setInterval(async () => {
        pollCount.current += 1;
        try {
          const res = await fetch(
            `${API}/get_move/rock_paper_scissors/${encodeURIComponent(opponent)}`,
            { cache: "no-store" }
          );
          if (!res.ok) throw new Error(`Poll HTTP ${res.status}`);
          const data: MoveResponse = await res.json();
          if (data?.rps) {
            setOppMove(data.rps);
            stopPoll();
            setPhase("DONE");
          } else if (pollCount.current > 60) {
            stopPoll();
            setPhase("ERROR");
            setError("Opponent hasn’t submitted a move (timeout).");
          }
        } catch (e: any) {
          stopPoll();
          setPhase("ERROR");
          setError(e.message || "Polling failed");
        }
      }, 1000);
    } catch (e: any) {
      setPhase("ERROR");
      setError(e.message || "Failed to submit move");
    }
  }

  const result = useMemo(
    () => (yourMove && oppMove ? decideWinner(yourMove, oppMove) : null),
    [yourMove, oppMove]
  );

  function resetRound() {
    stopPoll();
    setYourMove(null);
    setOppMove(null);
    setPhase("IDLE");
    setError(null);
  }

  function MovePic({ m, src, alt }: { m: Move; src: string; alt: string }) {
    const selected = yourMove === m;
    const disabled = phase === "POLLING" || phase === "DONE";
    return (
      <button
        onClick={() => submitMove(m)}
        disabled={disabled}
        className={[
          "w-full rounded-2xl border p-3 transition text-left hover:shadow focus:outline-none",
          selected ? "ring-4 ring-blue-400/60 shadow-md scale-[1.02]" : "",
          yourMove && !selected ? "opacity-70" : "",
          disabled ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.01]",
        ].join(" ")}
        title={alt}
      >
        <div className="flex items-center gap-3">
          <Image src={src} alt={alt} width={64} height={64} className="rounded-md" />
          <div className="text-lg font-semibold">{alt}</div>
        </div>
      </button>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Rock · Paper · Scissors</h1>

      {/* usernames */}
      <div className="grid gap-3 md:grid-cols-2">
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
          <label className="text-sm text-gray-600">Opponent username</label>
          <input
            className="w-full px-3 py-2 border rounded-xl"
            value={opp}
            onChange={(e) => setOpp(e.target.value)}
            placeholder="e.g. alex"
          />
        </div>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {/* game card */}
      <div className="rounded-2xl border p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* left: you + pictures */}
          <div>
            <div className="text-xs uppercase text-gray-500 mb-1">You</div>
            <div className="text-lg font-semibold mb-3">{you || "—"}</div>
            <div className="space-y-3">
              <MovePic m="ROCK"     src="/rps/rock.jpeg"     alt="Rock" />
              <MovePic m="PAPER"    src="/rps/paper.jpeg"    alt="Paper" />
              <MovePic m="SCISSORS" src="/rps/scissors.jpeg" alt="Scissors" />
            </div>
          </div>

          {/* right: opponent status */}
          <div>
            <div className="text-xs uppercase text-gray-500 mb-1">Opponent</div>
            <div className="text-lg font-semibold mb-3">{opp || "—"}</div>
            <div className="rounded-xl border p-4 h-[170px] flex items-center justify-center text-lg">
              {oppMove
                ? oppMove
                : (phase === "POLLING" || yourMove)
                  ? <span className="animate-thinking">Thinking…</span>
                  : "—"}
            </div>
          </div>
        </div>

        {/* outcome tray */}
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

        <div className="mt-4">
          <button onClick={resetRound} className="px-3 py-2 rounded-2xl border">Reset round</button>
        </div>
      </div>

      {/* inline CSS for the pulsing “Thinking…” effect */}
      <style jsx global>{`
        @keyframes thinkingPulse {
          0%, 100% { opacity: 0.55; transform: translateY(0); }
          50%      { opacity: 1;    transform: translateY(-1px); }
        }
        .animate-thinking {
          animation: thinkingPulse 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
