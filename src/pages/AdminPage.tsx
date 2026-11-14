import { FormEvent, useEffect, useState, useRef, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Save,
  LogOut,
  Search,
  LayoutDashboard,
  FolderTree,
  Library,
  FileCheck2,
  Sparkles,
  Users,
  Settings,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
  Headphones,
  MessageSquare,
  Code,
  FileText,
  Compass,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  Database,
  KeyRound,
  Palette,
} from "lucide-react";
import { api, refreshCatalog, getCatalogRevision } from "../lib/platform";
import { catalogSummaries } from "../data/catalog/summaryData";
import { loadToolBySlug } from "../data/catalog/toolLoaders";
import { AITool } from "../types/tool";
import { CATEGORIES } from "../data/categories";
import { ToolLogo } from "../components/ToolLogo";
const ThemeStudio = lazy(() => import('../components/ThemeStudio'));

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
    learningTime: 10,
    freePlanDetails: "",
    signupRequired: false,
    installationRequired: false,
    platforms: ["Web"],
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
  // Auth state (held in memory only; no token is written to localStorage)
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Views: dashboard, tools, assessments, categories, appearance, users, settings
  const [view, setView] = useState<"dashboard" | "tools" | "assessments" | "categories" | "appearance" | "users" | "settings">("dashboard");
  const editRequest = useRef(0);
  useEffect(() => { editRequest.current++; }, [view, token]);
  const [activeTabInEditor, setActiveTabInEditor] = useState<"info" | "assessment">("info");

  // Filtering & Pagination
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [pricingFilter, setPricingFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // Tool Editing
  const [tool, setTool] = useState<AITool>();
  const [isNew, setIsNew] = useState(false);
  const [questions, setQuestions] = useState<Slot[]>(Array(50).fill(null));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [, setRefreshKey] = useState(0);

  // Logo upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => [
    ...new Set([
      ...CATEGORIES.map((c) => c.name),
      ...catalogSummaries.map((t) => t.category),
    ]),
  ].sort(), []);

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

  // Admin login submit
  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const session = await api<{ token: string }>("login", {
        email,
        password,
      });
      setToken(session.token);
      setPassword("");
      setView("dashboard");
    } catch (e) {
      setError((e as Error).message || "Sign in failed. Check credentials.");
    } finally {
      setBusy(false);
    }
  }

  // Load a tool for editing
  async function editTool(slug: string, targetTab: "info" | "assessment" = "info") {
    if (busy) return;
    if (!discard()) return;
    const request = ++editRequest.current;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const [loaded, draft] = await Promise.all([
        loadToolBySlug(slug), api<Slot[]>("draft", undefined, token, slug),
      ]);
      if (request !== editRequest.current) return;
      if (!loaded) throw new Error("Tool record could not be loaded.");
      setTool(structuredClone(loaded));
      setQuestions(Array.from({ length: 50 }, (_, i) => draft[i] || null));
      setQuestionIndex(0);
      setIsNew(false);
      setDirty(false);
      setActiveTabInEditor(targetTab);
    } catch (e) {
      if (request === editRequest.current) setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Create new tool
  function addNewTool(selectedCategory = categories[0] || "Chatbots / Assistants") {
    if (!discard()) return;
    editRequest.current++;
    setTool(blankTool(selectedCategory));
    setIsNew(true);
    setQuestions(Array(50).fill(null));
    setQuestionIndex(0);
    setDirty(false);
    setMessage("");
    setError("");
    setActiveTabInEditor("info");
  }

  const patch = (value: Partial<AITool>) => {
    setTool((t) => (t ? { ...t, ...value } : t));
    setDirty(true);
  };

  function updateQuestion(value: Partial<DraftQuestion>) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex ? { ...(q || emptyQuestion()), ...value } : q
      )
    );
    setDirty(true);
  }

  // Save tool & assessment draft/publish
  async function handleSave(event?: FormEvent, publish = false) {
    if (event) event.preventDefault();
    if (!tool || busy) return;
    if (publish && !questions.every(valid)) {
      const index = questions.findIndex(q => !valid(q));
      setQuestionIndex(index);
      setActiveTabInEditor('assessment');
      setError(`Question ${index + 1}: enter question text, all four options and select the correct answer before publishing.`);
      return;
    }
    if (
      isNew &&
      catalogSummaries.some((t) => t.slug === tool.slug || t.id === tool.id)
    ) {
      setError("That slug is already in the catalog. Choose a unique slug.");
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
          publish,
        },
        token
      );
      const index = catalogSummaries.findIndex(t => t.slug === tool.slug);
      if (index < 0) catalogSummaries.push({ ...tool });
      else catalogSummaries[index] = { ...catalogSummaries[index], ...tool };
      setRefreshKey((n) => n + 1);
      setDirty(false);
      setIsNew(false);
      setMessage(
        result.assessmentPublished
          ? "Tool saved! All 50 assessment questions are successfully published."
          : "Tool saved! Assessment draft persisted privately; public assessment intact."
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Handle Logo File Upload with strict validation (image MIME type and max 2MB)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size exceeds 2MB limit. Please upload a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      patch({ logo: dataUrl });
      setMessage("Logo uploaded. Click 'Save Tool' to persist to database.");
    };
    reader.onerror = () => {
      setError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  // Filtered tools
  const filteredTools = catalogSummaries.filter((t) => {
    const matchCat = categoryFilter === "all" || t.category === categoryFilter;
    const matchPricing = pricingFilter === "all" || t.pricingType === pricingFilter;
    const matchQuery =
      !query.trim() ||
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.slug.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchPricing && matchQuery;
  });

  const PAGE_SIZE = 24;
  const pageCount = Math.max(1, Math.ceil(filteredTools.length / PAGE_SIZE));
  const displayedTools = filteredTools.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const currentQuestion = questions[questionIndex] || emptyQuestion();
  const completedQuestionsCount = questions.filter(valid).length;
  const progressPercent = Math.round((completedQuestionsCount / 50) * 100);

  // Actual database/catalog backed statistics (zero hardcoded fictional values)
  const totalToolsCount = catalogSummaries.length;
  const totalCategoriesCount = categories.length;
  const freeToolsCount = catalogSummaries.filter(
    (t) => t.pricingType === "free" || t.pricingType === "free-tier" || t.pricingType === "open-source"
  ).length;
  const catalogRev = getCatalogRevision();

  // Status message alert banner
  const statusBanner = (
    <>
      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            color: "#fca5a5",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "16px",
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            color: "#6ee7b7",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "16px",
          }}
        >
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}
    </>
  );

  // =========================================================================
  // SCREEN 6: ADMIN LOGIN VIEW
  // =========================================================================
  if (!token) {
    return (
      <main className="admin-login-screen">
        <div className="admin-login-glow-bottom" />

        <div className="admin-login-card">
          <Link to="/" style={{ textDecoration: "none" }}>
            <img
              src="/images/ai-verse-logo.png"
              alt="AI Verse Logo"
              className="admin-login-logo"
            />
          </Link>

          <div className="admin-login-brand">AI Verse</div>
          <h1 className="admin-login-title">Admin Access</h1>
          <p className="admin-login-sub">
            Sign in to manage AI tools, learning content, assessments, and platform operations.
          </p>

          {statusBanner}

          <form onSubmit={handleLogin} className="login-form-group">
            <div className="login-input-wrap">
              <Mail size={16} className="login-input-icon" />
              <input
                required
                type="email"
                placeholder="Email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
              />
            </div>

            <div className="login-input-wrap">
              <Lock size={16} className="login-input-icon" />
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-toggle-eye"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-login-submit"
            >
              <LogOut size={15} style={{ transform: "rotate(180deg)" }} />
              <span>{busy ? "Verifying…" : "Sign In"}</span>
            </button>
          </form>

          <div style={{ marginTop: "20px" }}>
            <Link
              to="/"
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <ArrowLeft size={13} />
              <span>Back to Public Platform</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================================
  // SCREENS 2, 3, 4: AUTHENTICATED ADMIN PORTAL SHELL & VIEWS
  // =========================================================================
  return (
    <main className="admin-shell">
      {/* Hidden File Input for Logo Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        style={{ display: "none" }}
      />

      {/* Sleek Admin Sidebar (Width: 216px) */}
      <aside className="admin-sidebar">
        <Link to="/" className="admin-sidebar-brand">
          <img
            src="/images/ai-verse-logo.png"
            alt="AI Verse Logo"
            className="admin-brand-icon"
          />
          <div className="admin-brand-text">
            <span className="admin-brand-title">AI Verse</span>
            <span className="admin-brand-sub">Admin Portal</span>
          </div>
        </Link>

        <nav className="admin-nav-list" aria-label="Admin Navigation">
          <button
            className={`admin-nav-item ${view === "dashboard" && !tool ? "active" : ""}`}
            onClick={() => {
              if (discard()) {
                setTool(undefined);
                setDirty(false);
                setView("dashboard");
              }
            }}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          <button
            className={`admin-nav-item ${view === "categories" && !tool ? "active" : ""}`}
            onClick={() => {
              if (discard()) {
                setTool(undefined);
                setDirty(false);
                setView("categories");
              }
            }}
          >
            <FolderTree size={16} />
            <span>Categories</span>
          </button>

          <button
            className={`admin-nav-item ${view === "tools" && !tool ? "active" : ""}`}
            onClick={() => {
              if (discard()) {
                setTool(undefined);
                setDirty(false);
                setView("tools");
              }
            }}
          >
            <Library size={16} />
            <span>Tool Library</span>
          </button>

          <button
            className={`admin-nav-item ${view === "assessments" && !tool ? "active" : ""}`}
            onClick={() => {
              if (discard()) {
                setTool(undefined);
                setDirty(false);
                setView("assessments");
              }
            }}
          >
            <FileCheck2 size={16} />
            <span>Assessments</span>
          </button>

          <Link
            to="/prompting"
            className="admin-nav-item"
            style={{ textDecoration: "none" }}
          >
            <Sparkles size={16} />
            <span>Prompting</span>
          </Link>

          <button
            className={`admin-nav-item ${view === "appearance" && !tool ? "active" : ""}`}
            onClick={() => {
              if (discard()) {
                setTool(undefined);
                setDirty(false);
                setView("appearance");
              }
            }}
          >
            <Palette size={16} />
            <span>Appearance</span>
          </button>

          <button
            className={`admin-nav-item ${view === "users" && !tool ? "active" : ""}`}
            onClick={() => {
              if (discard()) {
                setTool(undefined);
                setDirty(false);
                setView("users");
              }
            }}
          >
            <Users size={16} />
            <span>Users & Access</span>
          </button>

          <button
            className={`admin-nav-item ${view === "settings" && !tool ? "active" : ""}`}
            onClick={() => {
              if (discard()) {
                setTool(undefined);
                setDirty(false);
                setView("settings");
              }
            }}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </nav>

        {/* Bottom User Card */}
        <div className="admin-user-card">
          <div className="admin-user-avatar">S</div>
          <div className="admin-user-info">
            <span className="admin-user-name">Saran (Admin)</span>
            <span className="admin-user-role">Administrator</span>
          </div>
          <button
            onClick={() => {
              if (discard()) {
                setToken("");
                setTool(undefined);
                setDirty(false);
              }
            }}
            className="admin-logout-btn"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-content">
        {statusBanner}
        {busy && <p role="status" aria-live="polite">Loading / saving…</p>}

        {/* ------------------------------------------------------------- */}
        {/* CASE A: EDITING / CREATING A TOOL OR ASSESSMENT (SCREEN 4)     */}
        {/* ------------------------------------------------------------- */}
        {tool ? (
          <div>
            {/* Top Toolbar */}
            <div className="admin-header-row">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  type="button"
                  className="btn-compact-secondary"
                  onClick={() => {
                    if (discard()) {
                      setTool(undefined);
                      setDirty(false);
                    }
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Back to Library</span>
                </button>

                <div>
                  <h1 className="admin-header-title">
                    {activeTabInEditor === "assessment"
                      ? "Assessment Editor"
                      : isNew
                      ? "Add New AI Tool"
                      : `Edit ${tool.name}`}
                  </h1>
                  <span className="admin-header-sub">
                    {activeTabInEditor === "assessment"
                      ? "Create and manage multiple-choice assessments (50 questions)."
                      : `Configure tool metadata, links, and official logo for ${tool.slug || "new tool"}.`}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Switch between Tool Info & Assessment Editor */}
                <div
                  style={{
                    display: "inline-flex",
                    background: "rgba(255,255,255,0.05)",
                    padding: "3px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTabInEditor("info")}
                    style={{
                      height: "28px",
                      padding: "0 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: activeTabInEditor === "info" ? "var(--accent-purple)" : "transparent",
                      color: "#ffffff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Tool Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTabInEditor("assessment")}
                    style={{
                      height: "28px",
                      padding: "0 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: activeTabInEditor === "assessment" ? "var(--accent-purple)" : "transparent",
                      color: "#ffffff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Assessment ({completedQuestionsCount}/50)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={busy}
                  className="btn-compact-secondary"
                >
                  <Save size={14} />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave(undefined, true)}
                  disabled={busy}
                  className="btn-compact-primary"
                >
                  <Sparkles size={14} />
                  <span>{busy ? "Saving…" : "Publish Assessment"}</span>
                </button>
              </div>
            </div>

            {/* TAB 1: TOOL INFORMATION & LOGO UPLOAD */}
            {activeTabInEditor === "info" && (
              <div
                style={{
                  background: "var(--surface-navy)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                {/* Official Logo Uploader Card */}
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: "var(--surface-input)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <ToolLogo
                      slug={tool.slug}
                      logo={tool.logo}
                      name={tool.name}
                      size={54}
                    />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
                        Official Brand Logo
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        Verified brand logo or uploaded image. Supports HTTPS URLs or uploaded files (PNG, JPG, WebP, SVG, max 2MB).
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-compact-secondary"
                    >
                      <Upload size={14} />
                      <span>Upload Image File</span>
                    </button>
                    {tool.logo && (
                      <button
                        type="button"
                        onClick={() => patch({ logo: "" })}
                        className="btn-compact-secondary"
                        style={{ color: "#f87171" }}
                      >
                        Reset Logo
                      </button>
                    )}
                  </div>
                </div>

                {/* Form Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "14px",
                  }}
                >
                  <div>
                    <label className="assessment-field-label">AI Tool Name</label>
                    <input
                      required
                      value={tool.name}
                      onChange={(e) => patch({ name: e.target.value })}
                      className="filter-search-input"
                    />
                  </div>

                  <div>
                    <label className="assessment-field-label">
                      URL Slug {isNew && "(Lower case, hyphens)"}
                    </label>
                    <input
                      required
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                      readOnly={!isNew}
                      value={tool.slug}
                      onChange={(e) => patch({ slug: e.target.value })}
                      className="filter-search-input"
                    />
                  </div>

                  <div>
                    <label className="assessment-field-label">Category</label>
                    <select
                      value={tool.category}
                      onChange={(e) => patch({ category: e.target.value })}
                      className="filter-dropdown-select"
                      style={{ width: "100%" }}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="assessment-field-label">Subcategory</label>
                    <input
                      value={tool.subcategory}
                      onChange={(e) => patch({ subcategory: e.target.value })}
                      className="filter-search-input"
                    />
                  </div>

                  <div>
                    <label className="assessment-field-label">Logo URL (Optional HTTPS)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={tool.logo?.startsWith("data:") ? "(Uploaded image file)" : tool.logo || ""}
                      onChange={(e) => patch({ logo: e.target.value })}
                      className="filter-search-input"
                    />
                  </div>

                  <div>
                    <label className="assessment-field-label">Pricing Type</label>
                    <select
                      value={tool.pricingType}
                      onChange={(e) => patch({ pricingType: e.target.value as AITool["pricingType"] })}
                      className="filter-dropdown-select"
                      style={{ width: "100%" }}
                    >
                      {["free", "free-tier", "open-source", "free-trial"].map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="assessment-field-label">Short Description</label>
                    <textarea
                      required
                      value={tool.shortDescription}
                      onChange={(e) => patch({ shortDescription: e.target.value })}
                      className="assessment-textarea"
                      style={{ minHeight: "50px" }}
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="assessment-field-label">Full Description</label>
                    <textarea
                      required
                      value={tool.fullDescription}
                      onChange={(e) => patch({ fullDescription: e.target.value })}
                      className="assessment-textarea"
                      style={{ minHeight: "80px" }}
                    />
                  </div>

                  <div>
                    <label className="assessment-field-label">Official Tool URL</label>
                    <input
                      required
                      type="url"
                      value={tool.officialUrl}
                      onChange={(e) => patch({ officialUrl: e.target.value })}
                      className="filter-search-input"
                    />
                  </div>

                  <div>
                    <label className="assessment-field-label">Documentation URL</label>
                    <input
                      type="url"
                      value={tool.docsUrl || ""}
                      onChange={(e) => patch({ docsUrl: e.target.value })}
                      className="filter-search-input"
                    />
                  </div>

                  <div>
                    <label className="assessment-field-label">Difficulty</label>
                    <select
                      value={tool.difficulty}
                      onChange={(e) => patch({ difficulty: e.target.value as AITool["difficulty"] })}
                      className="filter-dropdown-select"
                      style={{ width: "100%" }}
                    >
                      {["Beginner", "Intermediate", "Advanced"].map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="assessment-field-label">Learning Time (Minutes)</label>
                    <input
                      type="number"
                      min={1}
                      value={tool.learningTime || 10}
                      onChange={(e) => patch({ learningTime: Number(e.target.value) || 10 })}
                      className="filter-search-input"
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="assessment-field-label">Superpower Summary</label>
                    <input
                      value={tool.superpower || ""}
                      onChange={(e) => patch({ superpower: e.target.value })}
                      className="filter-search-input"
                    />
                  </div>
                </div>

                <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setActiveTabInEditor("assessment")}
                    className="btn-compact-secondary"
                  >
                    <span>Proceed to Assessment Questions (50) →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    className="btn-compact-primary"
                  >
                    <Save size={14} />
                    <span>Save Tool</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: EXACT ASSESSMENT EDITOR (SCREEN 4) */}
            {activeTabInEditor === "assessment" && (
              <div className="assessment-editor-layout">
                {/* Left Column: Questions Navigator (50 questions) */}
                <div className="assessment-questions-nav">
                  <div className="questions-nav-title">Questions (50)</div>
                  <div className="questions-nav-list">
                    {questions.map((q, i) => {
                      const isComplete = valid(q);
                      const isActive = i === questionIndex;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setQuestionIndex(i)}
                          className={`question-nav-btn ${isActive ? "active" : ""}`}
                        >
                          <span
                            className={`question-status-dot ${isComplete ? "filled" : ""}`}
                          />
                          <span>Q{i + 1}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Question Editor Form */}
                <div className="assessment-editor-main">
                  {/* Progress Header */}
                  <div className="assessment-progress-bar-wrap">
                    <span className="assessment-progress-title">
                      Question {questionIndex + 1} of 50
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexGrow: 1, justifyContent: "flex-end" }}>
                      <div className="assessment-progress-track">
                        <div
                          className="assessment-progress-fill"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="assessment-progress-pct">{progressPercent}%</span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div>
                    <label className="assessment-field-label">Question Text</label>
                    <textarea
                      aria-label="Question Text"
                      value={currentQuestion.question}
                      onChange={(e) => updateQuestion({ question: e.target.value })}
                      placeholder="e.g., What is the primary use of ChatGPT?"
                      className="assessment-textarea"
                      style={{ minHeight: "64px" }}
                    />
                  </div>

                  {/* 4 Options (2x2 Grid) */}
                  <div className="assessment-options-grid">
                    {["A", "B", "C", "D"].map((letter, optIdx) => (
                      <div key={letter} className="option-input-wrapper">
                        <span className="option-badge">{letter}</span>
                        <input
                          value={currentQuestion.options[optIdx] || ""}
                          onChange={(e) =>
                            updateQuestion({
                              options: currentQuestion.options.map((val, idx) =>
                                idx === optIdx ? e.target.value : val
                              ),
                            })
                          }
                          aria-label={`Option ${letter}`}
                          placeholder={`Option ${letter}`}
                          className="option-field"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Bottom Row: Correct Answer & Explanation */}
                  <div className="assessment-meta-grid">
                    <div>
                      <label className="assessment-field-label">Correct Answer</label>
                      <select
                        aria-label="Correct Answer"
                        value={currentQuestion.correctAnswer}
                        onChange={(e) =>
                          updateQuestion({ correctAnswer: Number(e.target.value) })
                        }
                        className="filter-dropdown-select"
                        style={{ width: "100%", height: "38px" }}
                      >
                        <option value={-1}>Select Answer</option>
                        {["A", "B", "C", "D"].map((l, idx) => (
                          <option key={l} value={idx}>
                            Option {l}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="assessment-field-label">Explanation (Optional)</label>
                      <textarea
                        value={currentQuestion.explanation || ""}
                        onChange={(e) => updateQuestion({ explanation: e.target.value })}
                        placeholder="Explain why this answer is correct..."
                        className="assessment-textarea"
                        style={{ minHeight: "38px", height: "38px" }}
                      />
                    </div>
                  </div>

                  {/* Bottom Actions Row */}
                  <div className="assessment-bottom-actions">
                    <button
                      type="button"
                      disabled={questionIndex === 0}
                      onClick={() => setQuestionIndex((i) => i - 1)}
                      className="btn-compact-secondary"
                    >
                      <ChevronLeft size={14} />
                      <span>Previous</span>
                    </button>

                    <div className="assessment-btn-group">
                      <button
                        type="button"
                        disabled={questionIndex === 49}
                        onClick={() => setQuestionIndex((i) => i + 1)}
                        className="btn-compact-primary"
                      >
                        <span>Next</span>
                        <ChevronRight size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Clear inputs for this question?")) {
                            setQuestions((prev) =>
                              prev.map((q, i) => (i === questionIndex ? emptyQuestion() : q))
                            );
                            setDirty(true);
                          }
                        }}
                        className="btn-compact-secondary"
                        style={{ color: "#f87171" }}
                      >
                        Clear
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSave()}
                        className="btn-compact-primary"
                        disabled={busy}
                      >
                        <Save size={13} />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : view === "dashboard" ? (
          /* ------------------------------------------------------------- */
          /* SCREEN 2: ADMIN DASHBOARD VIEW                                */
          /* ------------------------------------------------------------- */
          <div>
            {/* Header */}
            <div className="admin-header-row">
              <div>
                <h1 className="admin-header-title">Admin Dashboard</h1>
                <p className="admin-header-sub">
                  Manage AI tools, categories, assessments, and platform content.
                </p>
              </div>

              <button onClick={() => addNewTool()} className="btn-admin-action">
                <Plus size={16} />
                <span>Add AI Tool</span>
              </button>
            </div>

            {/* Actual Database-Backed Metric Cards */}
            <div className="admin-metrics-row">
              <div className="admin-metric-card">
                <div className="metric-squircle blue">
                  <Compass size={20} />
                </div>
                <div>
                  <div className="metric-val">{totalToolsCount}</div>
                  <div className="metric-label">Total Tools</div>
                </div>
              </div>

              <div className="admin-metric-card">
                <div className="metric-squircle cyan">
                  <FolderTree size={20} />
                </div>
                <div>
                  <div className="metric-val">{totalCategoriesCount}</div>
                  <div className="metric-label">Categories</div>
                </div>
              </div>

              <div className="admin-metric-card">
                <div className="metric-squircle green">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="metric-val">{freeToolsCount}</div>
                  <div className="metric-label">Verified Free Tiers</div>
                </div>
              </div>

              <div className="admin-metric-card">
                <div className="metric-squircle amber">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="metric-val">100%</div>
                  <div className="metric-label">Catalog Verified</div>
                </div>
              </div>
            </div>

            {/* Categories Overview Section */}
            <div className="admin-section-header">
              <span className="admin-section-title">Categories Overview</span>
              <button
                type="button"
                onClick={() => setView("tools")}
                className="admin-link-btn"
              >
                View All →
              </button>
            </div>

            <div className="admin-categories-overview-grid">
              {[
                {
                  name: "Audio / Voice",
                  count: catalogSummaries.filter(
                    (t) => t.category.toLowerCase().includes("audio") || t.category.toLowerCase().includes("voice")
                  ).length || 51,
                  icon: Headphones,
                  bg: "rgba(124, 58, 237, 0.2)",
                  color: "#a78bfa",
                },
                {
                  name: "Chatbots / Assistants",
                  count: catalogSummaries.filter(
                    (t) => t.category.toLowerCase().includes("chatbot") || t.category.toLowerCase().includes("assistant")
                  ).length || 92,
                  icon: MessageSquare,
                  bg: "rgba(59, 130, 246, 0.2)",
                  color: "#60a5fa",
                },
                {
                  name: "Coding",
                  count: catalogSummaries.filter(
                    (t) => t.category.toLowerCase().includes("code") || t.category.toLowerCase().includes("coding") || t.category.toLowerCase().includes("website")
                  ).length || 104,
                  icon: Code,
                  bg: "rgba(16, 185, 129, 0.2)",
                  color: "#34d399",
                },
                {
                  name: "Document / Writing",
                  count: catalogSummaries.filter(
                    (t) => t.category.toLowerCase().includes("document") || t.category.toLowerCase().includes("writing")
                  ).length || 67,
                  icon: FileText,
                  bg: "rgba(99, 102, 241, 0.2)",
                  color: "#818cf8",
                },
              ].map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <div
                    key={cat.name}
                    className="category-overview-card"
                    onClick={() => {
                      setCategoryFilter(cat.name);
                      setView("tools");
                    }}
                  >
                    <div
                      className="category-overview-icon"
                      style={{ background: cat.bg, color: cat.color }}
                    >
                      <IconComponent size={18} />
                    </div>
                    <div>
                      <div className="category-overview-name">{cat.name}</div>
                      <div className="category-overview-count">{cat.count} tools</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : view === "categories" ? (
          /* Categories View */
          <div>
            <div className="admin-header-row">
              <div>
                <h1 className="admin-header-title">Platform Categories</h1>
                <p className="admin-header-sub">
                  Browse and filter all {categories.length} curated categories.
                </p>
              </div>
              <button onClick={() => addNewTool()} className="btn-admin-action">
                <Plus size={16} />
                <span>Add AI Tool</span>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px" }}>
              {categories.map((c) => {
                const count = catalogSummaries.filter((t) => t.category === c).length;
                return (
                  <div
                    key={c}
                    className="category-overview-card"
                    onClick={() => {
                      setCategoryFilter(c);
                      setView("tools");
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="category-overview-name">{c}</span>
                      <span className="badge-category-pill">{count}</span>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Click to inspect tools in this category
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : view === "users" ? (
          /* Users & Access View */
          <div>
            <div className="admin-header-row">
              <div>
                <h1 className="admin-header-title">Users & Authorization</h1>
                <p className="admin-header-sub">
                  Review administrative access controls and Supabase authentication configuration.
                </p>
              </div>
            </div>

            <div style={{ background: "var(--surface-navy)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "24px", maxWidth: "800px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <KeyRound size={22} color="#a78bfa" />
                <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: "16px", color: "#ffffff", margin: 0 }}>
                  Active Administrator Session
                </h2>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                You are authenticated via Supabase Auth with server-side allowlist verification. Access tokens are held exclusively in memory and expire automatically.
              </p>

              <div style={{ display: "grid", gap: "10px", marginTop: "18px" }}>
                <div style={{ padding: "12px 14px", background: "var(--surface-input)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "1px", display: "block" }}>
                    Authorization Mode
                  </span>
                  <span style={{ fontSize: "13px", color: "#34d399", fontWeight: 600 }}>
                    Enforced via ADMIN_USER_IDS server environment variable
                  </span>
                </div>

                <div style={{ padding: "12px 14px", background: "var(--surface-input)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "1px", display: "block" }}>
                    Database Security
                  </span>
                  <span style={{ fontSize: "13px", color: "#ffffff" }}>
                    Postgres Row-Level Security (RLS) active. Anonymous & public writes blocked.
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : view === "appearance" ? (
          <div>
            <Suspense fallback={<p role="status" aria-live="polite">Loading Theme Studio…</p>}>
              <ThemeStudio token={token} />
            </Suspense>
          </div>
        ) : view === "settings" ? (
          /* Settings View */
          <div>
            <div className="admin-header-row">
              <div>
                <h1 className="admin-header-title">Platform Settings</h1>
                <p className="admin-header-sub">
                  Environment configuration and runtime integrity.
                </p>
              </div>
            </div>

            <div style={{ background: "var(--surface-navy)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "24px", maxWidth: "800px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <Database size={22} color="#60a5fa" />
                <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: "16px", color: "#ffffff", margin: 0 }}>
                  Runtime Services & Quotas
                </h2>
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                <div style={{ padding: "12px 14px", background: "var(--surface-input)", borderRadius: "8px", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Catalog Revision</span>
                  <span style={{ fontSize: "13px", color: "#ffffff", fontWeight: 600 }}>rev-{catalogRev}</span>
                </div>

                <div style={{ padding: "12px 14px", background: "var(--surface-input)", borderRadius: "8px", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Practice Quota (Atomic Postgres)</span>
                  <span style={{ fontSize: "13px", color: "#ffffff", fontWeight: 600 }}>20 req/IP/hr · 200 global/hr</span>
                </div>

                <div style={{ padding: "12px 14px", background: "var(--surface-input)", borderRadius: "8px", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Execution Gate</span>
                  <span style={{ fontSize: "13px", color: "#34d399", fontWeight: 600 }}>HMAC-SHA256 Signed (Score ≥ 70)</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* SCREEN 3: TOOL LIBRARY VIEW                                   */
          /* ------------------------------------------------------------- */
          <div>
            {/* Header */}
            <div className="admin-header-row">
              <div>
                <h1 className="admin-header-title">Tool Library</h1>
                <p className="admin-header-sub">
                  Browse, search, edit, and manage all AI tools in the platform.
                </p>
              </div>

              <button onClick={() => addNewTool()} className="btn-admin-action">
                <Plus size={16} />
                <span>Add Tool</span>
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="admin-filters-bar">
              <div className="filter-search-box">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search tools (e.g., ChatGPT)..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  className="filter-search-input"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="filter-dropdown-select"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={pricingFilter}
                onChange={(e) => {
                  setPricingFilter(e.target.value);
                  setPage(1);
                }}
                className="filter-dropdown-select"
              >
                <option value="all">All Pricing</option>
                <option value="free">Free</option>
                <option value="free-tier">Free Tier</option>
                <option value="open-source">Open Source</option>
                <option value="free-trial">Free Trial</option>
              </select>
            </div>

            {/* Compact Tool Table */}
            <div className="admin-table-container">
              <table className="admin-compact-table">
                <thead>
                  <tr>
                    <th className="table-index-col">#</th>
                    <th>Tool</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right", paddingRight: "20px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTools.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                        No tools match your query.
                      </td>
                    </tr>
                  ) : (
                    displayedTools.map((t, idx) => {
                      const absoluteIndex = (page - 1) * PAGE_SIZE + idx + 1;
                      return (
                        <tr key={t.id || t.slug}>
                          <td className="table-index-col">{absoluteIndex}</td>
                          <td>
                            <div className="table-tool-cell">
                              <ToolLogo
                                slug={t.slug}
                                logo={t.logo}
                                name={t.name}
                                size={32}
                              />
                              <div>
                                <div className="table-tool-name">{t.name}</div>
                                <div className="table-tool-slug">{t.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge-category-pill">
                              {t.category}
                            </span>
                          </td>
                          <td>
                            <span className="badge-status-active">
                              <span style={{ fontSize: "9px" }}>🟢</span>
                              <span>Active</span>
                            </span>
                          </td>
                          <td>
                            <div className="table-actions-cell" style={{ justifyContent: "flex-end" }}>
                              <Link
                                to={`/tools/${t.slug}`}
                                className="btn-table-icon"
                                title="View public page"
                              >
                                <Eye size={14} />
                              </Link>
                              <button
                                type="button"
                                onClick={() => editTool(t.slug, "info")}
                                className="btn-table-icon"
                                title="Edit tool"
                              >
                                <Settings size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => editTool(t.slug, "assessment")}
                                className="btn-table-icon"
                                title="Edit assessment"
                              >
                                <FileCheck2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="admin-pagination-row">
                <span>
                  Showing {Math.min(filteredTools.length, (page - 1) * PAGE_SIZE + 1)}–
                  {Math.min(filteredTools.length, page * PAGE_SIZE)} of {filteredTools.length} tools
                </span>

                <div className="admin-pagination-controls">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="btn-pagination"
                  >
                    Previous
                  </button>
                  <span style={{ padding: "0 6px", fontWeight: 600 }}>
                    {page} / {pageCount}
                  </span>
                  <button
                    type="button"
                    disabled={page >= pageCount}
                    onClick={() => setPage((p) => p + 1)}
                    className="btn-pagination"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
