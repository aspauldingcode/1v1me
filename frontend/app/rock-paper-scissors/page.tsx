"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type Move = "ROCK" | "PAPER" | "SCISSORS";
type MoveResponse = { username: string; rps: Move | null };

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

function decideWinner(a: Move, b: Move): "YOU" | "OPPONENT" | "DRAW" {
  if (a === b) return "DRAW";
  if (
    (a === "ROCK" && b === "SCISSORS") ||
    (a === "PAPER" && b === "ROCK") ||
    (a === "SCISSORS" && b === "PAPER")
  ) return "YOU";
  return "OPPONENT";
}

export default function RpsPage() {
  // ===== 1) game context from queue (URL query) =====
  const qp = useSearchParams();
  const youFromQueue = (qp.get("you") || "").trim();
  const oppFromQueue = (qp.get("opponent") || "").trim();
  const gameId = qp.get("gameId") || ""; // optional – included for future use

  // banner if people open this page directly
  const missingContext = !youFromQueue || !oppFromQueue;

  // ===== 2) round state =====
  const [yourMove, setYourMove] = useState<Move | null>(null);
  const [oppMove, setOppMove] = useState<Move | null>(null);
  const [phase, setPhase] = useState<"IDLE" | "POLLING" | "DONE" | "ERROR">("IDLE");
  const [error, setError] = useState<string | null>(null);

  // ===== 3) polling timer =====
  const pollTimer = useRef<NodeJS.Timeout | null>(null);
  const pollCount = useRef(0);
  function stopPoll() {
    if (pollTimer.current) clearInterval(pollTimer.current);
    pollTimer.current = null;
  }
  useEffect(() => () => stopPoll(), []);

  // ===== 4) submit your move + poll opponent =====
  async function submitMove(m: Move) {
    if (missingContext) return;
    try {
      setError(null);
      setYourMove(m);
      setOppMove(null);
      setPhase("POLLING");

      // NOTE: backend ignores gameId for now; add it to body if you want.
      const r = await fetch(`${API}/set_move/rock_paper_scissors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ username: youFromQueue, rps: m }),
      });
      if (!r.ok) throw new Error(`Submit HTTP ${r.status}`);

      pollCount.current = 0;
      stopPoll();
      pollTimer.current = setInterval(async () => {
        pollCount.current += 1;
        try {
          const res = await fetch(
            `${API}/get_move/rock_paper_scissors/${encodeURIComponent(oppFromQueue)}`,
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
    const disabled = phase === "POLLING" || phase === "DONE" || missingContext;
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

      {/* Context banner */}
      {missingContext && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3">
          <div className="font-medium">Waiting for game context…</div>
          <div className="text-sm opacity-80">
            This page should be opened by the Queue screen, which will pass
            <code className="mx-1">you</code> and
            <code className="mx-1">opponent</code> in the URL.
            For manual testing:{" "}
            <code>/rock-paper-scissors?you=alice&opponent=bob</code>
          </div>
        </div>
      )}

      {error && <p className="text-red-600">{error}</p>}

      {/* Game card */}
      <div className="rounded-2xl border p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: you + pictures */}
          <div>
            <div className="text-xs uppercase text-gray-500 mb-1">You</div>
            <div className="text-lg font-semibold mb-3">{youFromQueue || "—"}</div>
            <div className="space-y-3">
              <MovePic m="ROCK"     src="/rps/rock.png"     alt="Rock" />
              <MovePic m="PAPER"    src="/rps/paper.png"    alt="Paper" />
              <MovePic m="SCISSORS" src="/rps/scissors.png" alt="Scissors" />
            </div>
          </div>

          {/* Right: opponent status */}
          <div>
            <div className="text-xs uppercase text-gray-500 mb-1">Opponent</div>
            <div className="text-lg font-semibold mb-3">{oppFromQueue || "—"}</div>
            <div className="rounded-xl border p-4 h-[170px] flex items-center justify-center text-lg">
              {oppMove
                ? oppMove
                : (phase === "POLLING" || yourMove)
                  ? <span className="animate-thinking">Thinking…</span>
                  : "—"}
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

        <div className="mt-4">
          <button onClick={resetRound} className="px-3 py-2 rounded-2xl border">
            Reset round
          </button>
        </div>
      </div>

      {/* inline CSS for pulsing “Thinking…” */}
      <style jsx global>{`
        @keyframes thinkingPulse {
          0%, 100% { opacity: 0.55; transform: translateY(0); }
          50%      { opacity: 1;    transform: translateY(-1px); }
        }
        .animate-thinking { animation: thinkingPulse 1.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
