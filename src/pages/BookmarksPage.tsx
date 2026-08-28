import React, { useState } from 'react';
import { ALL_TOOLS } from '../data/catalog/toolsData';
import { getProgressMap } from '../lib/storage';
import { ToolGrid } from '../components/ToolGrid';
import { Bookmark, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BookmarksPageProps {
  comparedSlugs: string[];
  onToggleCompare: (slug: string) => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({ comparedSlugs, onToggleCompare }) => {
  const [refresh, setRefresh] = useState(0);
  const progressMap = getProgressMap();

  const bookmarkedTools = ALL_TOOLS.filter(t => progressMap[t.id]?.bookmarked);

  return (
    <div className="container">
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '28px', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bookmark size={28} color="var(--accent4)" /> My Saved Bookmarks ({bookmarkedTools.length})
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '14px' }}>
          Access all your bookmarked AI tools instantly across device sessions.
        </p>
      </div>

      {bookmarkedTools.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <Bookmark size={48} color="var(--muted)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '20px', marginBottom: '8px' }}>
            No Bookmarked AI Tools Yet
          </h3>
          <p style={{ color: 'var(--muted)', maxWidth: '400px', margin: '0 auto 20px', fontSize: '14px' }}>
            Click the bookmark icon on any tool card in the catalog to save tools for quick access later.
          </p>
          <Link to="/" className="btn-primary">
            Explore All 1,500+ Tools
          </Link>
        </div>
      ) : (
        <ToolGrid
          tools={bookmarkedTools}
          comparedSlugs={comparedSlugs}
          onToggleCompare={onToggleCompare}
          onBookmarkChange={() => setRefresh(prev => prev + 1)}
          onResetFilters={() => {}}
        />
      )}
    </div>
  );
};
