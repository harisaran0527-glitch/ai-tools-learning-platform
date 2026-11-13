import { Sparkles } from "lucide-react";
import { catalogSummaries } from "../data/catalog/summaryData";
export const Hero = () => (
  <section className="hero">
    <div className="hero-badge">
      <Sparkles size={13} /> AI TOOLS ACADEMY
    </div>
    <h1>Learn. Practice. Master AI.</h1>
    <p>
      Explore powerful AI tools, learn through practical video guidance, access
      official documentation, and validate your knowledge through structured
      assessments.
    </p>
    <p className="hero-closing">
      Build real-world AI skills — one tool at a time.
    </p>
    <div className="stats-row">
      <div className="stat">
        <span className="stat-num">
          {catalogSummaries.length.toLocaleString()}
        </span>
        <span className="stat-label">AI Tools</span>
      </div>
      <div className="stat">
        <span className="stat-num">
          {new Set(catalogSummaries.map((t) => t.category)).size}
        </span>
        <span className="stat-label">Categories</span>
      </div>
      <div className="stat">
        <span className="stat-num">100</span>
        <span className="stat-label">Practice Marks</span>
      </div>
    </div>
  </section>
);
