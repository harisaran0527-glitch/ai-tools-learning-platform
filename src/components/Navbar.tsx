import { Link, useLocation } from "react-router-dom";
import { Compass, Sparkles } from "lucide-react";
export const Navbar = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return (
    <header className="main-header academy-header">
      <Link to="/" className="logo-brand">
        <span className="logo-brand-icon" aria-hidden="true">
          ⚡
        </span>
        <span>AI Tools Academy</span>
      </Link>
      <nav aria-label="Main navigation">
        <Link
          to="/"
          className={`tab-btn ${pathname === "/" ? "active" : ""}`}
          aria-current={pathname === "/" ? "page" : undefined}
        >
          <Compass size={16} />
          Explore Catalog
        </Link>
        <Link
          to="/prompting"
          className={`tab-btn ${pathname.startsWith("/prompting") ? "active" : ""}`}
          aria-current={pathname === "/prompting" ? "page" : undefined}
        >
          <Sparkles size={16} />
          Prompting
        </Link>
      </nav>
    </header>
  );
};
