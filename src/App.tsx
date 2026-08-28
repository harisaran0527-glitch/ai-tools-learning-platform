import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';

const ToolDetailPage = lazy(() => import('./pages/ToolDetailPage').then(m => ({ default: m.ToolDetailPage })));
const AssessmentPage = lazy(() => import('./pages/AssessmentPage').then(m => ({ default: m.AssessmentPage })));
const AssessmentResultPage = lazy(() => import('./pages/AssessmentResultPage').then(m => ({ default: m.AssessmentResultPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage').then(m => ({ default: m.BookmarksPage })));
const LearningPathsPage = lazy(() => import('./pages/LearningPathsPage').then(m => ({ default: m.LearningPathsPage })));
const FacultyPathPage = lazy(() => import('./pages/FacultyPathPage').then(m => ({ default: m.FacultyPathPage })));
const ComparePage = lazy(() => import('./pages/ComparePage').then(m => ({ default: m.ComparePage })));

const LoadingFallback = () => (
  <div className="container" style={{ padding: '65px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '15px' }}>
    <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', marginBottom: '12px' }} />
    <div>Loading page...</div>
  </div>
);

export const App: React.FC = () => {
  const [comparedSlugs, setComparedSlugs] = useState<string[]>([]);

  const handleToggleCompare = (slug: string) => {
    setComparedSlugs(prev => {
      if (prev.includes(slug)) {
        return prev.filter(s => s !== slug);
      }
      if (prev.length >= 3) {
        alert('You can compare up to 3 tools at a time.');
        return prev;
      }
      return [...prev, slug];
    });
  };

  const handleRemoveCompare = (slug: string) => {
    setComparedSlugs(prev => prev.filter(s => s !== slug));
  };

  const handleClearCompare = () => {
    setComparedSlugs([]);
  };

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
        <Navbar />

        <div style={{ flexGrow: 1 }}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    comparedSlugs={comparedSlugs}
                    onToggleCompare={handleToggleCompare}
                  />
                }
              />
              <Route path="/tools/:slug" element={<ToolDetailPage />} />
              <Route path="/assessment/:slug" element={<AssessmentPage />} />
              <Route path="/results/:attemptId" element={<AssessmentResultPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route
                path="/bookmarks"
                element={
                  <BookmarksPage
                    comparedSlugs={comparedSlugs}
                    onToggleCompare={handleToggleCompare}
                  />
                }
              />
              <Route path="/learning-paths" element={<LearningPathsPage />} />
              <Route path="/faculty-path" element={<FacultyPathPage />} />
              <Route
                path="/compare"
                element={
                  <ComparePage
                    comparedSlugs={comparedSlugs}
                    onRemoveCompare={handleRemoveCompare}
                    onClearCompare={handleClearCompare}
                  />
                }
              />
              <Route path="*" element={<HomePage comparedSlugs={comparedSlugs} onToggleCompare={handleToggleCompare} />} />
            </Routes>
          </Suspense>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;

