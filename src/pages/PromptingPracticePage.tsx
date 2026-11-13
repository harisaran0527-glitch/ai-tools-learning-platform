import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, Play, RotateCcw } from "lucide-react";
import { api } from "../lib/platform";
import { Analysis, CHALLENGES, CRITERIA, qualityBand } from "../lib/practice";
export default function PromptingPracticePage() {
  const [challenge, setChallenge] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [analysis, setAnalysis] = useState<Analysis>();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [output, setOutput] = useState("");
  const revision = useRef(0);
  const editor = useRef<HTMLTextAreaElement>(null);
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
        if (current === revision.current) setAnalysis(result);
      } else {
        const result = await api<{ output: string }>(action, {
          prompt,
          challenge,
          ticket: analysis?.ticket,
        });
        if (current === revision.current) setOutput(result.output);
      }
    } catch (e) {
      if (current === revision.current) setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <main className="academy-page">
      <Link className="quiet-link" to="/prompting">
        <ArrowLeft size={16} /> Prompting Studio
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            PRACTICE / {String(challenge + 1).padStart(2, "0")}
          </span>
          <h1>Make your intent clear.</h1>
        </div>
        <span className="pill">Practice only · 100 marks</span>
      </div>
      <div className="practice-layout">
        <section className="academy-card editor-panel">
          <div className="section-heading">
            <span className="eyebrow">YOUR CHALLENGE</span>
            <span>
              {challenge + 1} / {CHALLENGES.length}
            </span>
          </div>
          <h2>{CHALLENGES[challenge][0]}</h2>
          <p>{CHALLENGES[challenge][1]}</p>
          <label htmlFor="prompt-editor">Your complete prompt</label>
          <textarea
            ref={editor}
            id="prompt-editor"
            maxLength={12000}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              clear();
            }}
            placeholder="Describe the task, audience, requirements, constraints, reference material, output, tone and how success will be checked…"
          />
          <div className="section-heading">
            <small>Write one complete prompt.</small>
            <small>{prompt.length.toLocaleString()} / 12,000</small>
          </div>
          <div className="action-row">
            <button
              className="btn-primary"
              disabled={!!busy}
              onClick={() => request("analyze")}
            >
              <Sparkles size={16} />
              {busy === "analyze" ? "Analyzing…" : "Analyze Prompt"}
            </button>
            <button
              className="btn-secondary"
              disabled={!!busy}
              onClick={() => {
                clear();
                setPrompt("");
                editor.current?.focus();
              }}
            >
              <RotateCcw size={16} />
              Try Again
            </button>
          </div>
          <div className="action-row">
            <button
              className="btn-secondary"
              disabled={!!busy || challenge === 0}
              onClick={() => {
                clear();
                setPrompt("");
                setChallenge((c) => c - 1);
              }}
            >
              <ArrowLeft size={16} />
              Previous
            </button>
            <button
              className="btn-secondary"
              disabled={!!busy}
              onClick={() => {
                clear();
                setPrompt("");
                setChallenge((c) => (c + 1) % CHALLENGES.length);
              }}
            >
              Next Challenge
              <ArrowRight size={16} />
            </button>
          </div>
          <button
            className="btn-primary execute-button"
            disabled={!!busy || !analysis?.ticket || analysis.score < 70}
            onClick={() => request("execute")}
          >
            <Play size={16} />
            {busy === "execute" ? "Executing…" : "Execute Prompt"}
          </button>
          {(!analysis || analysis.score < 70) && (
            <small>
              Improve the highlighted prompt sections before execution.
            </small>
          )}
          <small>
            Analysis sends your prompt to the AI service. Avoid personal or
            confidential information.
          </small>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          {output && (
            <section className="practice-output">
              <h2>Execution preview</h2>
              <pre>{output}</pre>
            </section>
          )}
        </section>
        <aside
          className="academy-card analysis-panel"
          aria-label="Prompt analysis"
          aria-live="polite"
          aria-busy={busy === "analyze"}
        >
          <span className="eyebrow">YOUR PROMPT BLUEPRINT</span>
          <div
            className="score-orbit"
            style={{ "--score": analysis?.score || 0 } as React.CSSProperties}
          >
            <div>
              <strong>{analysis?.score ?? "—"}</strong>
              <span>/ 100</span>
            </div>
          </div>
          <h2 className="score-title">
            {analysis ? qualityBand(analysis.score) : "Ready when you are"}
          </h2>
          {!analysis && (
            <p>
              Analyze your prompt to reveal its strengths and the sections to
              improve.
            </p>
          )}
          <div className="blueprint">
            {(
              analysis?.sections ||
              CRITERIA.map(([label, max]) => ({
                label,
                max,
                score: 0,
                status: "Pending",
                evidence: "",
                feedback: "",
              }))
            ).map((s) => (
              <details
                key={s.label}
                className={`criterion ${s.status.toLowerCase()}`}
                open={analysis && s.status !== "Complete"}
              >
                <summary>
                  <span>
                    <i aria-hidden="true">
                      {s.status === "Complete"
                        ? "✓"
                        : s.status === "Missing"
                          ? "×"
                          : "·"}
                    </i>
                    {s.label}
                  </span>
                  <strong>
                    {analysis ? s.score : "—"} / {s.max}
                  </strong>
                </summary>
                <span className="criterion-status">{s.status}</span>
                {s.evidence && <blockquote>{s.evidence}</blockquote>}
                <p>{s.feedback}</p>
              </details>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
