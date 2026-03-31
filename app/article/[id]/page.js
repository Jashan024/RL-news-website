'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} days ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export default function ArticlePage() {
  const { id } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState({ top: [], sidebar: [] });

  useEffect(() => {
    if (id) loadArticle();
  }, [id]);

  async function loadArticle() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*, categories(name, slug)')
        .eq('id', id)
        .single();

      if (error || !data) {
        setArticle(null);
        setLoading(false);
        return;
      }

      setArticle(data);

      // Load related articles from same category
      const { data: relData } = await supabase
        .from('articles')
        .select('*, categories(name)')
        .eq('status', 'published')
        .eq('category_id', data.category_id)
        .neq('id', data.id)
        .order('created_at', { ascending: false })
        .limit(4);
      setRelated(relData || []);

      // Load ads
      const { data: adsData } = await supabase.from('ads').select('*').eq('is_active', true);
      const allAds = adsData || [];
      setAds({
        top: allAds.filter(a => a.placement === 'top'),
        sidebar: allAds.filter(a => a.placement === 'sidebar'),
      });

    } catch (err) {
      console.error('Error loading article:', err);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p style={{ color: '#888', marginTop: 16 }}>Loading article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={styles.loadingWrap}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>📰</p>
        <h2 style={{ color: '#333', marginBottom: 8 }}>Article Not Found</h2>
        <p style={{ color: '#888', marginBottom: 20 }}>The article you are looking for does not exist.</p>
        <button onClick={() => router.push('/')} style={styles.backBtn}>← Back to Home</button>
      </div>
    );
  }

  return (
    <>
      {/* ── TOPBAR ── */}
      <div style={styles.topbar}>
        <div style={styles.container}>
          <div style={styles.topbarInner}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Ludhiana, Punjab
            </span>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <a href="#" style={styles.topLink}>ਪੰਜਾਬੀ</a>
              <a href="#" style={styles.topLink}>हिन्दी</a>
            </div>
          </div>
        </div>
      </div>

      {/* ── HEADER ── */}
      <header style={styles.header}>
        <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <img src="/images/logo.jpeg" alt="RL Logo" style={{ width: 48, height: 48 }} />
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#D42A2A', margin: 0, lineHeight: 1.2 }}>Report Ludhiana Newspaper</h1>
              <span style={{ fontSize: 11, color: '#1a237e', fontWeight: 500 }}>ਹਰ ਕਦਮ ਤੁਹਾਡੇ ਨਾਲ</span>
            </div>
          </a>
          <button onClick={() => router.push('/')} style={styles.homeBtn}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </button>
        </div>
      </header>

      {/* ── BREADCRUMB ── */}
      <div style={styles.breadcrumb}>
        <div style={styles.container}>
          <a href="/" style={styles.breadLink}>Home</a>
          <span style={{ color: '#ccc', margin: '0 8px' }}>/</span>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }} style={styles.breadLink}>{article.categories?.name || 'News'}</a>
          <span style={{ color: '#ccc', margin: '0 8px' }}>/</span>
          <span style={{ color: '#666', fontSize: 13 }}>{article.title?.substring(0, 50)}...</span>
        </div>
      </div>

      {/* ── TOP AD ── */}
      {ads.top.length > 0 && (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          {ads.top.map(ad => (
            <a key={ad.id} href={ad.click_url || '#'} target="_blank" rel="noopener noreferrer">
              <img src={ad.image_url} alt={ad.title} style={{ maxWidth: 728, width: '100%', borderRadius: 8 }} />
            </a>
          ))}
        </div>
      )}

      {/* ── ARTICLE CONTENT ── */}
      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.articleLayout}>
            {/* Main article */}
            <article style={styles.articleMain}>
              {/* Category badge */}
              <span style={styles.catBadge}>{article.categories?.name || 'News'}</span>

              {/* Title */}
              <h1 style={styles.title}>{article.title}</h1>

              {/* Meta */}
              <div style={styles.meta}>
                <div style={styles.metaItem}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  {formatDate(article.created_at)}
                </div>
                <div style={styles.metaItem}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Report Ludhiana Newspaper
                </div>
              </div>

              {/* Share buttons */}
              <div style={styles.shareBar}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>Share:</span>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? window.location.href : ''}`} target="_blank" rel="noopener noreferrer" style={{ ...styles.shareBtn, background: '#1877F2' }}>
                  <svg width="14" height="14" fill="#fff" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  Facebook
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' ? window.location.href : ''}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" style={{ ...styles.shareBtn, background: '#000' }}>
                  <svg width="14" height="14" fill="#fff" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Twitter
                </a>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`} target="_blank" rel="noopener noreferrer" style={{ ...styles.shareBtn, background: '#25D366' }}>
                  <svg width="14" height="14" fill="#fff" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                  WhatsApp
                </a>
              </div>

              {/* Featured Image */}
              {article.image_url && (
                <div style={styles.featuredImg}>
                  <img src={article.image_url} alt={article.title} style={{ width: '100%', borderRadius: 12 }} />
                </div>
              )}

              {/* Excerpt */}
              {article.excerpt && (
                <p style={styles.excerpt}>{article.excerpt}</p>
              )}

              {/* Article body */}
              <div
                style={styles.body}
                dangerouslySetInnerHTML={{ __html: article.content?.replace(/\n/g, '<br/>') || '<p>No content available.</p>' }}
              />

              {/* Tags / Category */}
              <div style={styles.tagBar}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>Category:</span>
                <span style={styles.tag}>{article.categories?.name || 'News'}</span>
              </div>

              {/* Bottom share */}
              <div style={{ ...styles.shareBar, borderTop: '1px solid #eee', marginTop: 24, paddingTop: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>Share this article:</span>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`} target="_blank" rel="noopener noreferrer" style={{ ...styles.shareBtn, background: '#25D366' }}>
                  WhatsApp
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? window.location.href : ''}`} target="_blank" rel="noopener noreferrer" style={{ ...styles.shareBtn, background: '#1877F2' }}>
                  Facebook
                </a>
              </div>
            </article>

            {/* Sidebar */}
            <aside style={styles.sidebar}>
              {/* Related News */}
              <div style={styles.sideBox}>
                <div style={styles.sideBoxTitle}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  Related News
                </div>
                {related.length > 0 ? related.map((item, i) => (
                  <a
                    key={item.id}
                    href={`/article/${item.id}`}
                    style={styles.relatedItem}
                    onClick={(e) => { e.preventDefault(); router.push(`/article/${item.id}`); }}
                  >
                    <div style={styles.relatedNum}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      {item.image_url && (
                        <img src={item.image_url} alt={item.title} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 6 }} />
                      )}
                      <h4 style={{ fontSize: 13, fontWeight: 600, color: '#222', lineHeight: 1.4, margin: 0 }}>{item.title}</h4>
                      <span style={{ fontSize: 11, color: '#999' }}>{timeAgo(item.created_at)}</span>
                    </div>
                  </a>
                )) : (
                  <p style={{ fontSize: 13, color: '#aaa', textAlign: 'center', padding: 20 }}>No related articles yet</p>
                )}
              </div>

              {/* Sidebar Ad */}
              {ads.sidebar.length > 0 ? (
                ads.sidebar.map(ad => (
                  <a key={ad.id} href={ad.click_url || '#'} target="_blank" rel="noopener noreferrer">
                    <img src={ad.image_url} alt={ad.title} style={{ width: '100%', borderRadius: 12 }} />
                  </a>
                ))
              ) : (
                <div style={styles.adPlaceholder}>📢 Ad Space — 300 x 250</div>
              )}

              {/* Back to Home */}
              <button onClick={() => router.push('/')} style={styles.sideHomeBtn}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Back to Home Page
              </button>
            </aside>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/images/logo.jpeg" alt="RL Logo" style={{ width: 36, height: 36 }} />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Report Ludhiana Newspaper</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>&copy; 2026 Report Ludhiana Newspaper. All rights reserved.</span>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #fff; }
        a { text-decoration: none; }
        img { max-width: 100%; }
        @media (max-width: 768px) {
          .article-layout { flex-direction: column !important; }
          .article-sidebar { width: 100% !important; }
        }
      `}</style>
    </>
  );
}

const styles = {
  loadingWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', fontFamily: 'Segoe UI, system-ui, sans-serif',
  },
  spinner: {
    width: 40, height: 40, border: '4px solid #eee', borderTop: '4px solid #D42A2A',
    borderRadius: '50%', animation: 'spin 1s linear infinite',
  },
  backBtn: {
    padding: '10px 24px', background: '#D42A2A', color: '#fff', border: 'none',
    borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  topbar: {
    background: '#1a237e', color: '#fff', padding: '6px 0', fontSize: 12,
  },
  container: {
    maxWidth: 1200, margin: '0 auto', padding: '0 20px',
  },
  topbarInner: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  topLink: {
    color: 'rgba(255,255,255,0.8)', fontSize: 12, textDecoration: 'none',
  },
  header: {
    background: '#fff', padding: '12px 0', borderBottom: '3px solid #D42A2A',
    position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  homeBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px',
    background: '#1a237e', color: '#fff', border: 'none', borderRadius: 8,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  breadcrumb: {
    background: '#f8f8f8', padding: '10px 0', borderBottom: '1px solid #eee',
  },
  breadLink: {
    color: '#D42A2A', fontSize: 13, fontWeight: 500, textDecoration: 'none',
  },
  main: {
    padding: '24px 0 40px',
  },
  articleLayout: {
    display: 'flex', gap: 32, alignItems: 'flex-start',
  },
  articleMain: {
    flex: 1, minWidth: 0,
  },
  catBadge: {
    display: 'inline-block', background: '#D42A2A', color: '#fff', padding: '4px 14px',
    borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, marginBottom: 12,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28, fontWeight: 800, color: '#111', lineHeight: 1.3, marginBottom: 16,
  },
  meta: {
    display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16,
  },
  metaItem: {
    display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666',
  },
  shareBar: {
    display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20,
  },
  shareBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px',
    borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none',
  },
  featuredImg: {
    marginBottom: 24, borderRadius: 12, overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  excerpt: {
    fontSize: 16, color: '#444', lineHeight: 1.6, fontWeight: 500, fontStyle: 'italic',
    padding: '16px 20px', background: '#f8f9fa', borderLeft: '4px solid #D42A2A',
    borderRadius: '0 8px 8px 0', marginBottom: 24,
  },
  body: {
    fontSize: 16, color: '#333', lineHeight: 1.9, marginBottom: 24,
  },
  tagBar: {
    display: 'flex', alignItems: 'center', gap: 8, paddingTop: 16,
    borderTop: '1px solid #eee',
  },
  tag: {
    display: 'inline-block', background: '#f0f0f0', color: '#333', padding: '4px 14px',
    borderRadius: 20, fontSize: 12, fontWeight: 600,
  },
  sidebar: {
    width: 320, flexShrink: 0,
  },
  sideBox: {
    background: '#fff', borderRadius: 12, border: '1px solid #eee', marginBottom: 20, overflow: 'hidden',
  },
  sideBoxTitle: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px',
    background: '#1a237e', color: '#fff', fontSize: 14, fontWeight: 700,
  },
  relatedItem: {
    display: 'flex', gap: 10, padding: '12px 16px', borderBottom: '1px solid #f0f0f0',
    textDecoration: 'none', cursor: 'pointer', transition: 'background 0.2s',
  },
  relatedNum: {
    width: 24, height: 24, borderRadius: '50%', background: '#D42A2A', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
    fontWeight: 700, flexShrink: 0, marginTop: 2,
  },
  adPlaceholder: {
    padding: 40, background: '#f5f5f5', borderRadius: 12, textAlign: 'center',
    color: '#aaa', fontSize: 13, marginBottom: 20,
  },
  sideHomeBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', padding: '12px', background: '#D42A2A', color: '#fff',
    border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  footer: {
    background: '#1a237e', padding: '16px 0',
  },
};
