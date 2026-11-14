import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Play,
  RotateCcw,
  Target,
  FileText,
  CheckSquare,
  Lock,
  Code,
  ShieldCheck,
  Layers,
  Zap,
} from "lucide-react";
import { api } from "../lib/platform";
import { Analysis, CHALLENGES, CRITERIA, qualityBand } from "../lib/practice";
import { InteractivePromptBuilder } from "../components/prompting/InteractivePromptBuilder";

const STORAGE_KEY_PRACTICE_COMPLETED = "ai_verse_practice_completed_challenges";

export default function PromptingPracticePage() {
  const [activeMode, setActiveMode] = useState<"builder" | "challenges">("builder");
  const [challenge, setChallenge] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [analysis, setAnalysis] = useState<Analysis>();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [output, setOutput] = useState("");
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);
  const revision = useRef(0);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Load real completed challenges from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRACTICE_COMPLETED);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCompletedChallenges(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const markChallengeCompleted = (idx: number) => {
    setCompletedChallenges((prev) => {
      if (prev.includes(idx)) return prev;
      const updated = [...prev, idx];
      try {
        localStorage.setItem(STORAGE_KEY_PRACTICE_COMPLETED, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clear = () => {
    revision.current++;
    setAnalysis(undefined);
    setOutput("");
    setError("");
  };

  async function request(action: "analyze" | "execute") {
    const current = revision.current;
    setBusy(action);
    setError("");
    try {
      if (action === "analyze") {
        const result = await api<Analysis>(action, { prompt, challenge });
        if (current === revision.current) {
          setAnalysis(result);
          if (result.score >= 70) {
            markChallengeCompleted(challenge);
          }
        }
      } else {
        const result = await api<{ output: string }>(action, {
          prompt,
          challenge,
          ticket: analysis?.ticket,
        });
        if (current === revision.current) {
          setOutput(result.output);
          markChallengeCompleted(challenge);
        }
      }
    } catch (e) {
      if (current === revision.current) setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  async function handleAnalyzeCustomPrompt(customPromptText: string) {
    setPrompt(customPromptText);
    const current = revision.current;
    setBusy("analyze");
    setError("");
    try {
      const result = await api<Analysis>("analyze", { prompt: customPromptText, challenge });
      if (current === revision.current) {
        setAnalysis(result);
        if (result.score >= 70) {
          markChallengeCompleted(challenge);
        }
      }
    } catch (e) {
      if (current === revision.current) setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  async function handleExecuteCustomPrompt() {
    if (!analysis?.ticket) return;
    const current = revision.current;
    setBusy("execute");
    setError("");
    try {
      const result = await api<{ output: string }>("execute", {
        prompt,
        challenge,
        ticket: analysis?.ticket,
      });
      if (current === revision.current) {
        setOutput(result.output);
        markChallengeCompleted(challenge);
      }
    } catch (e) {
      if (current === revision.current) setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  const scrollToEditor = () => {
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    editorRef.current?.focus();
  };

  const completedCount = completedChallenges.length;
  const progressPct = Math.round((completedCount / CHALLENGES.length) * 100);

  // Exact 8 criteria matching CRITERIA weights [15, 15, 20, 15, 10, 10, 5, 10]
  const criteriaConfig = [
    { name: "Task / Goal", max: 15, icon: Target, color: "#c084fc", bg: "rgba(192,132,252,0.15)" },
    { name: "Context", max: 15, icon: FileText, color: "#60a5fa", bg: "rgba(59,130,246,0.15)" },
    { name: "Requirements", max: 20, icon: CheckSquare, color: "#34d399", bg: "rgba(52,211,153,0.15)" },
    { name: "Constraints", max: 15, icon: Lock, color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
    { name: "Input / Ref", max: 10, icon: Layers, color: "#2dd4bf", bg: "rgba(45,212,191,0.15)" },
    { name: "Output Format", max: 10, icon: Code, color: "#22d3ee", bg: "rgba(34,211,238,0.15)" },
    { name: "Style / Tone", max: 5, icon: Zap, color: "#f472b6", bg: "rgba(244,114,182,0.15)" },
    { name: "Success Criteria", max: 10, icon: ShieldCheck, color: "#fb923c", bg: "rgba(251,146,60,0.15)" },
  ];

  return (
    <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 24px 60px" }}>
      {/* ------------------------------------------------------------- */}
      {/* SCREEN 5: TOP INTRO & 8 CRITERIA CARDS                        */}
      {/* ------------------------------------------------------------- */}
      <div className="prompting-lab-header">
        <div className="prompting-title-col">
          <div className="prompting-badge-pill">
            <Sparkles size={11} />
            <span>Prompting Practice</span>
          </div>
          <h1 className="prompting-heading">Prompting Practice Lab</h1>
          <p className="prompting-sub">
            Train better prompts through guided challenges and AI-powered scoring.
          </p>
        </div>

        {/* Real Progress Card (Backed by actual completed challenge records) */}
        <div className="prompting-progress-card">
          <div className="prompting-progress-header">
            <span style={{ color: "var(--text-muted)" }}>Your Progress</span>
            <span style={{ color: "#a78bfa", fontWeight: 600 }}>({progressPct}%)</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span className="prompting-progress-score">{completedCount}</span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              / {CHALLENGES.length} Mastered (Score ≥ 70)
            </span>
          </div>
          <div className="assessment-progress-track" style={{ width: "100%", height: "5px" }}>
            <div className="assessment-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Row of 8 Compact Criteria Cards with exact weights totaling 100 */}
      <div className="prompting-criteria-row">
        {criteriaConfig.map((item) => {
          const IconComp = item.icon;
          return (
            <div key={item.name} className="criterion-card">
              <div className="criterion-icon-squircle" style={{ background: item.bg, color: item.color }}>
                <IconComp size={15} />
              </div>
              <div className="criterion-name">{item.name}</div>
              <div className="criterion-weight">/{item.max}</div>
            </div>
          );
        })}
      </div>

      {/* Mode Selector Tabs */}
      <div style={{ display: "flex", gap: "10px", margin: "20px 0 24px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setActiveMode("builder")}
          style={{
            background: activeMode === "builder" ? "linear-gradient(90deg, rgba(124, 58, 237, 0.28) 0%, rgba(99, 102, 241, 0.18) 100%)" : "transparent",
            border: activeMode === "builder" ? "1px solid rgba(124, 58, 237, 0.5)" : "1px solid transparent",
            borderLeft: activeMode === "builder" ? "3px solid #a78bfa" : "1px solid transparent",
            color: activeMode === "builder" ? "#ffffff" : "var(--text-muted)",
            fontWeight: activeMode === "builder" ? 600 : 500,
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            transition: "all 0.15s ease"
          }}
        >
          <Sparkles size={14} color={activeMode === "builder" ? "#c4b5fd" : "currentColor"} />
          <span>Interactive Prompt Builder & Guide (8 Rubrics)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode("challenges")}
          style={{
            background: activeMode === "challenges" ? "linear-gradient(90deg, rgba(124, 58, 237, 0.28) 0%, rgba(99, 102, 241, 0.18) 100%)" : "transparent",
            border: activeMode === "challenges" ? "1px solid rgba(124, 58, 237, 0.5)" : "1px solid transparent",
            borderLeft: activeMode === "challenges" ? "3px solid #a78bfa" : "1px solid transparent",
            color: activeMode === "challenges" ? "#ffffff" : "var(--text-muted)",
            fontWeight: activeMode === "challenges" ? 600 : 500,
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            transition: "all 0.15s ease"
          }}
        >
          <Target size={14} color={activeMode === "challenges" ? "#c4b5fd" : "currentColor"} />
          <span>Guided Scenario Challenges (10 Scenarios)</span>
        </button>
      </div>

      {/* Render Mode Content */}
      {activeMode === "builder" ? (
        <InteractivePromptBuilder
          onAnalyzePrompt={handleAnalyzeCustomPrompt}
          analysis={analysis}
          busy={busy}
          output={output}
          onExecute={handleExecuteCustomPrompt}
          error={error}
        />
      ) : (
        <>
          {/* Practice Challenge Banner */}
          <div className="practice-challenge-banner">
            <div className="challenge-banner-info">
              <div className="challenge-icon-box">
                <Target size={20} />
              </div>
              <div>
                <div className="challenge-banner-title">Practice Challenge</div>
                <div className="challenge-banner-desc">
                  {CHALLENGES[challenge][1]}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={scrollToEditor}
              className="btn-hero-primary"
              style={{ height: "36px", padding: "0 18px", fontSize: "13px" }}
            >
              <Sparkles size={14} />
              <span>Start Practice →</span>
            </button>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* INTERACTIVE PROMPT CHALLENGE WORKSPACE                         */}
          {/* ------------------------------------------------------------- */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: "20px" }}>
        {/* Left: Challenge Selector & Prompt Editor */}
        <section
          style={{
            background: "var(--surface-navy)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ fontSize: "11px", fontFamily: "JetBrains Mono, monospace", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "1px" }}>
              CHALLENGE {String(challenge + 1).padStart(2, "0")} OF {CHALLENGES.length}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                disabled={challenge === 0}
                onClick={() => {
                  clear();
                  setPrompt("");
                  setChallenge((c) => c - 1);
                }}
                className="btn-compact-secondary"
                style={{ height: "28px", padding: "0 8px" }}
              >
                <ArrowLeft size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  clear();
                  setPrompt("");
                  setChallenge((c) => (c + 1) % CHALLENGES.length);
                }}
                className="btn-compact-secondary"
                style={{ height: "28px", padding: "0 8px" }}
              >
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
            {CHALLENGES[challenge][0]}
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
            {CHALLENGES[challenge][1]}
          </p>

          <div>
            <label
              htmlFor="prompt-editor"
              style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}
            >
              Your Complete Prompt
            </label>
            <textarea
              ref={editorRef}
              id="prompt-editor"
              maxLength={12000}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                clear();
              }}
              placeholder="Describe the task, context, role, constraints, reference material, output format, and success criteria in detail..."
              style={{
                width: "100%",
                minHeight: "180px",
                padding: "12px",
                background: "var(--surface-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                color: "#ffffff",
                fontFamily: "inherit",
                fontSize: "13px",
                lineHeight: "1.6",
                resize: "vertical",
                outline: "none",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "11px", color: "var(--text-subtle)" }}>
              <span>Be specific and comprehensive.</span>
              <span>{prompt.length.toLocaleString()} / 12,000</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              disabled={!!busy || !prompt.trim()}
              onClick={() => request("analyze")}
              className="btn-hero-primary"
              style={{ height: "36px", padding: "0 18px", fontSize: "13px" }}
            >
              <Sparkles size={14} />
              <span>{busy === "analyze" ? "Evaluating…" : "Analyze Prompt"}</span>
            </button>

            <button
              type="button"
              disabled={!!busy || !prompt}
              onClick={() => {
                clear();
                setPrompt("");
                editorRef.current?.focus();
              }}
              className="btn-compact-secondary"
            >
              <RotateCcw size={14} />
              <span>Clear</span>
            </button>

            {analysis && (
              <button
                type="button"
                disabled={!!busy || !analysis?.ticket || analysis.score < 70}
                onClick={() => request("execute")}
                className="btn-compact-primary"
                style={{
                  background: analysis.score >= 70 ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "rgba(255,255,255,0.08)",
                }}
              >
                <Play size={14} />
                <span>{busy === "execute" ? "Executing…" : "Execute (Score ≥ 70)"}</span>
              </button>
            )}
          </div>

          {error && (
            <div
              role="alert"
              style={{
                padding: "10px 12px",
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.4)",
                color: "#fca5a5",
                borderRadius: "8px",
                fontSize: "12.5px",
              }}
            >
              {error}
            </div>
          )}

          {output && (
            <div
              style={{
                marginTop: "12px",
                padding: "14px",
                background: "var(--surface-input)",
                border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: "8px",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#34d399", marginBottom: "8px" }}>
                Execution Preview
              </div>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "12.5px",
                  color: "#f1f5f9",
                  margin: 0,
                  maxHeight: "240px",
                  overflowY: "auto",
                }}
              >
                {output}
              </pre>
            </div>
          )}
        </section>

        {/* Right: AI Score & Component Blueprint */}
        <aside
          style={{
            background: "var(--surface-navy)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "11px", fontFamily: "JetBrains Mono, monospace", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "1px" }}>
              PROMPT SCORE
            </span>

            <div
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                background: `conic-gradient(#7c3aed ${((analysis?.score || 0) / 100) * 360}deg, #1e2548 0deg)`,
                padding: "6px",
                margin: "12px auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "#0d1224",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontFamily: "Sora, sans-serif", fontSize: "28px", fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>
                  {analysis ? analysis.score : "—"}
                </span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>/ 100</span>
              </div>
            </div>

            <div style={{ fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
              {analysis ? qualityBand(analysis.score) : "Evaluation Blueprint"}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              {analysis
                ? "Detailed feedback generated across the 8 criteria."
                : "Submit your prompt to see its component strengths."}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", maxHeight: "380px" }}>
            {(
              analysis?.sections ||
              CRITERIA.map(([label, max]) => ({
                label,
                max,
                score: 0,
                status: "Pending" as const,
                evidence: "",
                feedback: "",
              }))
            ).map((s) => (
              <div
                key={s.label}
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  background: "var(--surface-input)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>{s.label}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: s.score > 0 ? "#a78bfa" : "var(--text-subtle)" }}>
                    {analysis ? s.score : "—"} / {s.max}
                  </span>
                </div>
                {s.feedback && (
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "4px 0 0", lineHeight: 1.4 }}>
                    {s.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
      </>
      )}
    </main>
  );
}
