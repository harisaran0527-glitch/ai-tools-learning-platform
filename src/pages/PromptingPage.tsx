import { Link } from "react-router-dom";
import { ArrowRight, Target, Layers, CheckCircle, Sparkles } from "lucide-react";

export default function PromptingPage() {
  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 80px", textAlign: "center" }}>
      <div className="hero-badge-pill" style={{ margin: "0 auto 16px" }}>
        <Sparkles size={12} />
        <span>AI Verse Prompting Lab</span>
      </div>

      <h1
        style={{
          fontFamily: "Sora, sans-serif",
          fontSize: "clamp(28px, 4vw, 42px)",
          fontWeight: 800,
          color: "#ffffff",
          lineHeight: 1.2,
          marginBottom: "12px",
        }}
      >
        Train Better Prompts with <span className="hero-gradient-text">Real AI Feedback</span>
      </h1>

      <p
        style={{
          fontSize: "14.5px",
          color: "var(--text-muted)",
          maxWidth: "580px",
          margin: "0 auto 28px",
          lineHeight: 1.6,
        }}
      >
        Turn ideas into rigorous prompts across 10 guided challenges. Evaluate context, goals,
        constraints, and accuracy with instant automated scoring.
      </p>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "44px" }}>
        <Link to="/prompting/practice" className="btn-hero-primary" style={{ height: "42px", padding: "0 24px", fontSize: "14px" }}>
          <span>Enter Practice Lab</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "16px",
          textAlign: "left",
        }}
      >
        {[
          {
            icon: Target,
            num: "01",
            title: "Choose a Challenge",
            text: "Select from real scenarios across web development, education, analysis, and research.",
            color: "#60a5fa",
          },
          {
            icon: Layers,
            num: "02",
            title: "Eight-Component Blueprint",
            text: "Get scored on context, goal clarity, requirements, constraints, format, accuracy, and usability.",
            color: "#c084fc",
          },
          {
            icon: CheckCircle,
            num: "03",
            title: "Score & Execute",
            text: "Refine your prompt to achieve 70+ marks to unlock live model execution previews.",
            color: "#34d399",
          },
        ].map((card) => {
          const IconC = card.icon;
          return (
            <div
              key={card.num}
              style={{
                padding: "22px",
                background: "var(--surface-navy)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: card.color,
                  }}
                >
                  <IconC size={18} />
                </div>
                <span
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "12px",
                    color: "var(--text-subtle)",
                    fontWeight: 600,
                  }}
                >
                  {card.num}
                </span>
              </div>
              <h3 style={{ fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                {card.title}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                {card.text}
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
