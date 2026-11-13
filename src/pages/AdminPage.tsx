import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Grid2X2,
  Library,
  Plus,
  Save,
  ShieldCheck,
  LogOut,
  Search,
} from "lucide-react";
import { api, refreshCatalog } from "../lib/platform";
import { catalogSummaries } from "../data/catalog/summaryData";
import { loadToolBySlug } from "../data/catalog/toolLoaders";
import { AITool } from "../types/tool";
import { CATEGORIES } from "../data/categories";

type DraftQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};
type Slot = DraftQuestion | null;
const emptyQuestion = (): DraftQuestion => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: -1,
  explanation: "",
});
const valid = (q: Slot) =>
  !!q?.question.trim() &&
  q.options.every((o) => o.trim()) &&
  q.correctAnswer >= 0 &&
  q.correctAnswer < 4;
function blankTool(category: string): AITool {
  return {
    id: crypto.randomUUID(),
    slug: "",
    name: "",
    category,
    subcategory: "",
    shortDescription: "",
    fullDescription: "",
    officialUrl: "",
    docsUrl: "",
    logo: "",
    pricingType: "free-tier",
    difficulty: "Beginner",
    learningTime: 0,
    freePlanDetails: "",
    signupRequired: false,
    installationRequired: false,
    platforms: [],
    superpower: "",
    whyLearn: [],
    useCases: [],
    features: [],
    steps: [],
    practicalExercise: { objective: "", expectedResult: "", skillsLearned: [] },
    keywords: [],
  };
}
export default function AdminPage() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [view, setView] = useState<"categories" | "tools">("categories");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [tool, setTool] = useState<AITool>();
  const [isNew, setIsNew] = useState(false);
  const [questions, setQuestions] = useState<Slot[]>(Array(50).fill(null));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [, render] = useState(0);
  const categories = [
    ...new Set([
      ...CATEGORIES.map((c) => c.name),
      ...catalogSummaries.map((t) => t.category),
    ]),
  ].sort();
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const discard = () =>
    !dirty || window.confirm("Discard your unsaved changes?");
  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const session = await api<{ token: string }>("login", {
        email,
        password,
      });
      await refreshCatalog();
      setToken(session.token);
      setPassword("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function edit(slug: string) {
    if (!discard()) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api("session", undefined, token);
      const loaded = await loadToolBySlug(slug);
      if (!loaded) throw new Error("Tool not found.");
      const draft = await api<Slot[]>("draft", undefined, token, slug);
      setTool(structuredClone(loaded));
      setQuestions(draft.length === 50 ? draft : Array(50).fill(null));
      setQuestionIndex(0);
      setIsNew(false);
      setDirty(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function add(selected = categories[0]) {
    if (!discard()) return;
    setTool(blankTool(selected));
    setIsNew(true);
    setQuestions(Array(50).fill(null));
    setQuestionIndex(0);
    setDirty(false);
    setMessage("");
    setError("");
  }
  const patch = (value: Partial<AITool>) => {
    setTool((t) => (t ? { ...t, ...value } : t));
    setDirty(true);
  };
  function updateQuestion(value: Partial<DraftQuestion>) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex ? { ...(q || emptyQuestion()), ...value } : q,
      ),
    );
    setDirty(true);
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!tool) return;
    if (
      isNew &&
      catalogSummaries.some((t) => t.slug === tool.slug || t.id === tool.id)
    ) {
      setError("That slug is already in the catalog. Choose another.");
      return;
    }
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const result = await api<{ assessmentPublished: boolean }>(
        "save",
        {
          tool: {
            ...tool,
            manualAssessmentOnly: isNew || tool.manualAssessmentOnly,
          },
          questions,
        },
        token,
      );
      await refreshCatalog();
      render((n) => n + 1);
      setDirty(false);
      setIsNew(false);
      setMessage(
        result.assessmentPublished
          ? "Tool saved. All 50 assessment questions are published."
          : "Tool saved. Assessment draft saved; existing public assessment preserved.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const status = (
    <>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="success-message">
          {message}
        </p>
      )}
    </>
  );
  if (!token)
    return (
      <main className="academy-page admin-login">
        <Link to="/" className="quiet-link">
          <ArrowLeft size={16} />
          Academy
        </Link>
        <form className="academy-card" onSubmit={login}>
          <ShieldCheck size={32} />
          <span className="eyebrow">RESTRICTED WORKSPACE</span>
          <h1>Academy control room.</h1>
          <p>Sign in with your authorized administrator account.</p>
          <label>
            Email
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="btn-primary" disabled={busy}>
            {busy ? "Verifying…" : "Sign in securely"}
          </button>
          {status}
        </form>
      </main>
    );
  const filtered = catalogSummaries.filter(
    (t) =>
      (category === "all" || t.category === category) &&
      t.name.toLowerCase().includes(query.toLowerCase()),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / 24));
  const current = questions[questionIndex] || emptyQuestion();
  const completed = questions.filter(valid).length;
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="logo-brand">
          ⚡ Academy
        </Link>
        <span className="eyebrow">CONTROL ROOM</span>
        <button
          className={view === "categories" && !tool ? "active" : ""}
          onClick={() => {
            if (discard()) {
              setTool(undefined);
              setDirty(false);
              setView("categories");
            }
          }}
        >
          <Grid2X2 size={18} />
          Categories
        </button>
        <button
          className={view === "tools" && !tool ? "active" : ""}
          onClick={() => {
            if (discard()) {
              setTool(undefined);
              setDirty(false);
              setView("tools");
            }
          }}
        >
          <Library size={18} />
          Tool library
        </button>
        <span className="admin-sidebar-note">
          <ShieldCheck size={16} />
          Authorized workspace
        </span>
        <button
          onClick={() => {
            if (discard()) {
              setToken("");
              setTool(undefined);
              setDirty(false);
            }
          }}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>
      <div className="admin-content">
        <div className="page-heading">
          <div>
            <span className="eyebrow">CONTENT OPERATIONS</span>
            <h1>
              {tool
                ? isNew
                  ? "Add a new tool."
                  : "Refine the details."
                : view === "categories"
                  ? "A place for every tool."
                  : "Your complete library."}
            </h1>
            <p>
              {catalogSummaries.length} tools · {categories.length} categories
            </p>
          </div>
          {!tool && (
            <button
              className="btn-primary"
              disabled={busy}
              onClick={() => add()}
            >
              <Plus size={18} />
              Add AI Tool
            </button>
          )}
        </div>
        {status}
        {tool ? (
          <form onSubmit={save} className="admin-editor">
            <div className="section-heading">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  if (discard()) {
                    setTool(undefined);
                    setDirty(false);
                  }
                }}
              >
                <ArrowLeft size={16} />
                Library
              </button>
              <span className="pill">
                {dirty ? "Unsaved changes" : "Ready to edit"}
              </span>
              <button className="btn-primary" disabled={busy}>
                <Save size={16} />
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
            <section className="academy-card">
              <h2>Tool identity</h2>
              <div className="form-grid">
                <label>
                  AI Tool Name
                  <input
                    required
                    value={tool.name}
                    onChange={(e) => patch({ name: e.target.value })}
                  />
                </label>
                <label>
                  URL Slug
                  <input
                    required
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    readOnly={!isNew}
                    value={tool.slug}
                    onChange={(e) => patch({ slug: e.target.value })}
                  />
                  <small>Stable after the first save.</small>
                </label>
                <label>
                  Category
                  <select
                    value={tool.category}
                    onChange={(e) => patch({ category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Subcategory
                  <input
                    value={tool.subcategory}
                    onChange={(e) => patch({ subcategory: e.target.value })}
                  />
                </label>
                <label className="full-width">
                  Short Description
                  <textarea
                    required
                    value={tool.shortDescription}
                    onChange={(e) =>
                      patch({ shortDescription: e.target.value })
                    }
                  />
                </label>
                <label className="full-width">
                  Full Description
                  <textarea
                    required
                    value={tool.fullDescription}
                    onChange={(e) => patch({ fullDescription: e.target.value })}
                  />
                </label>
                <label>
                  Official Tool URL
                  <input
                    required
                    type="url"
                    value={tool.officialUrl}
                    onChange={(e) => patch({ officialUrl: e.target.value })}
                  />
                </label>
                <label>
                  Tutorial Video URL
                  <input
                    type="url"
                    value={tool.tutorialVideo?.url || ""}
                    onChange={(e) =>
                      patch({
                        tutorialVideo: {
                          title: tool.tutorialVideo?.title || "Tutorial",
                          url: e.target.value,
                        },
                        tutorialResource: undefined,
                        tutorialVideoStatus: e.target.value
                          ? "verified"
                          : "unavailable",
                      })
                    }
                  />
                </label>
                <label>
                  Official Documentation URL
                  <input
                    type="url"
                    value={tool.docsUrl || ""}
                    onChange={(e) =>
                      patch({
                        docsUrl: e.target.value,
                        docsStatus: e.target.value ? "verified" : "unavailable",
                        documentationResource: e.target.value
                          ? {
                              type: "official",
                              title: "Official documentation",
                              url: e.target.value,
                            }
                          : undefined,
                      })
                    }
                  />
                </label>
                <label>
                  Tool Logo / Image URL
                  <input
                    type="url"
                    value={tool.logo || ""}
                    onChange={(e) => patch({ logo: e.target.value })}
                  />
                </label>
                <label>
                  Pricing
                  <select
                    value={tool.pricingType}
                    onChange={(e) =>
                      patch({
                        pricingType: e.target.value as AITool["pricingType"],
                      })
                    }
                  >
                    {["free", "free-tier", "open-source", "free-trial"].map(
                      (v) => (
                        <option key={v}>{v}</option>
                      ),
                    )}
                  </select>
                </label>
                <label>
                  Difficulty
                  <select
                    value={tool.difficulty}
                    onChange={(e) =>
                      patch({
                        difficulty: e.target.value as AITool["difficulty"],
                      })
                    }
                  >
                    {["Beginner", "Intermediate", "Advanced"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Learning time (minutes)
                  <input
                    type="number"
                    min="0"
                    required
                    value={tool.learningTime}
                    onChange={(e) =>
                      patch({ learningTime: Number(e.target.value) })
                    }
                  />
                </label>
                <label>
                  Free plan details
                  <input
                    value={tool.freePlanDetails}
                    onChange={(e) => patch({ freePlanDetails: e.target.value })}
                  />
                </label>
                <label>
                  Superpower
                  <input
                    value={tool.superpower}
                    onChange={(e) => patch({ superpower: e.target.value })}
                  />
                </label>
                <label>
                  Keywords (comma-separated)
                  <input
                    value={tool.keywords.join(", ")}
                    onChange={(e) =>
                      patch({
                        keywords: e.target.value
                          .split(",")
                          .map((v) => v.trim()),
                      })
                    }
                  />
                </label>
                <label>
                  Platforms (comma-separated)
                  <input
                    value={tool.platforms.join(", ")}
                    onChange={(e) =>
                      patch({
                        platforms: e.target.value
                          .split(",")
                          .map((v) => v.trim()),
                      })
                    }
                  />
                </label>
                <label>
                  Badge
                  <input
                    value={tool.badge || ""}
                    onChange={(e) => patch({ badge: e.target.value })}
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={tool.signupRequired}
                    onChange={(e) =>
                      patch({ signupRequired: e.target.checked })
                    }
                  />
                  Signup required
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={tool.installationRequired}
                    onChange={(e) =>
                      patch({ installationRequired: e.target.checked })
                    }
                  />
                  Installation required
                </label>
              </div>
              <details>
                <summary>Additional learning metadata</summary>
                <p>
                  Edit existing structured metadata without replacing the tool.
                </p>
                <label>
                  Learning content (JSON)
                  <textarea
                    className="metadata-editor"
                    defaultValue={JSON.stringify(
                      {
                        whyLearn: tool.whyLearn,
                        useCases: tool.useCases,
                        features: tool.features,
                        steps: tool.steps,
                        practicalExercise: tool.practicalExercise,
                      },
                      null,
                      2,
                    )}
                    onBlur={(e) => {
                      try {
                        const data = JSON.parse(e.target.value);
                        const fields = [
                          "whyLearn",
                          "useCases",
                          "features",
                          "steps",
                          "practicalExercise",
                        ];
                        if (Object.keys(data).some((k) => !fields.includes(k)))
                          throw new Error();
                        patch(data);
                        e.target.setCustomValidity("");
                      } catch {
                        e.target.setCustomValidity(
                          "Enter valid learning metadata JSON.",
                        );
                        e.target.reportValidity();
                      }
                    }}
                  />
                </label>
              </details>
            </section>
            <section className="academy-card">
              <div className="section-heading">
                <h2>Assessment workshop</h2>
                <span className="pill">
                  {completed} / 50 Questions Completed
                </span>
              </div>
              <progress
                value={completed}
                max="50"
                aria-label="Questions completed"
              />
              <p>
                Drafts stay private. All 50 valid questions publish together;
                incomplete drafts preserve the current public assessment.
              </p>
              <div className="question-map">
                {questions.map((q, i) => (
                  <button
                    type="button"
                    aria-label={`Question ${i + 1}${valid(q) ? ", complete" : ""}`}
                    aria-current={i === questionIndex ? "step" : undefined}
                    className={valid(q) ? "complete" : ""}
                    key={i}
                    onClick={() => setQuestionIndex(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <h3>Question {questionIndex + 1} / 50</h3>
              <label>
                Question Text
                <textarea
                  value={current.question}
                  onChange={(e) => updateQuestion({ question: e.target.value })}
                />
              </label>
              <div className="form-grid">
                {["A", "B", "C", "D"].map((letter, i) => (
                  <label key={letter}>
                    Option {letter}
                    <input
                      value={current.options[i]}
                      onChange={(e) =>
                        updateQuestion({
                          options: current.options.map((value, j) =>
                            i === j ? e.target.value : value,
                          ),
                        })
                      }
                    />
                  </label>
                ))}
                <label>
                  Correct Answer
                  <select
                    value={current.correctAnswer}
                    onChange={(e) =>
                      updateQuestion({ correctAnswer: Number(e.target.value) })
                    }
                  >
                    <option value={-1}>Select an answer</option>
                    {["A", "B", "C", "D"].map((l, i) => (
                      <option value={i} key={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Explanation (optional)
                  <textarea
                    value={current.explanation}
                    onChange={(e) =>
                      updateQuestion({ explanation: e.target.value })
                    }
                  />
                </label>
              </div>
              <div className="action-row">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={questionIndex === 0}
                  onClick={() => setQuestionIndex((i) => i - 1)}
                >
                  Previous Question
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    const index = questions.findIndex((q) => !valid(q));
                    if (index >= 0) setQuestionIndex(index);
                  }}
                >
                  Add Question
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={questionIndex === 49}
                  onClick={() => setQuestionIndex((i) => i + 1)}
                >
                  Next Question
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Clear this question? The change takes effect when you save.",
                      )
                    ) {
                      setQuestions((qs) =>
                        qs.map((q, i) => (i === questionIndex ? null : q)),
                      );
                      setDirty(true);
                    }
                  }}
                >
                  Clear Question
                </button>
                <button className="btn-primary" disabled={busy}>
                  Save
                </button>
              </div>
            </section>
          </form>
        ) : view === "categories" ? (
          <div className="academy-cards category-manager">
            {categories.map((c) => (
              <article className="academy-card" key={c}>
                <span className="eyebrow">CATEGORY</span>
                <h2>{c}</h2>
                <strong className="category-count">
                  {catalogSummaries.filter((t) => t.category === c).length}
                  <small>Tools</small>
                </strong>
                <div className="action-row">
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setCategory(c);
                      setPage(1);
                      setView("tools");
                    }}
                  >
                    View Tools
                  </button>
                  <button className="btn-primary" onClick={() => add(c)}>
                    <Plus size={16} />
                    Add Tool
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className="academy-card">
            <div className="admin-filters">
              <label>
                <span>
                  <Search size={15} /> Search tools
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </label>
              <label>
                Category
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">All categories</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <p>{filtered.length} tools found</p>
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice((page - 1) * 24, page * 24).map((t) => (
                    <tr key={t.slug}>
                      <td>
                        <strong>{t.name}</strong>
                        <small>{t.slug}</small>
                      </td>
                      <td>{t.category}</td>
                      <td>
                        <div className="action-row">
                          <Link
                            className="btn-secondary"
                            to={`/tools/${t.slug}`}
                          >
                            View Tool
                          </Link>
                          <button
                            className="btn-primary"
                            disabled={busy}
                            onClick={() => edit(t.slug)}
                          >
                            Edit Tool
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!filtered.length && <p>No tools match this search.</p>}
            <div className="action-row">
              <button
                className="btn-secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ArrowLeft size={16} />
                Previous
              </button>
              <span>
                {page} / {pageCount}
              </span>
              <button
                className="btn-secondary"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
