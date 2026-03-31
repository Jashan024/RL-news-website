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

      const { data: relData } = await supabase
        .from('articles')
        .select('*, categories(name)')
        .eq('status', 'published')
        .eq('category_id', data.category_id)
        .neq('id', data.id)
        .order('created_at', { ascending: false })
        .limit(4);
      setRelated(relData || []);

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
      <div className="art-loading">
        <div className="art-spinner" />
        <p>Loading article...</p>
        <style jsx global>{articleStyles}</style>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="art-loading">
        <p style={{ fontSize: 48, marginBottom: 12 }}>📰</p>
        <h2>Article Not Found</h2>
        <p style={{ color: '#888', marginBottom: 20 }}>The article you are looking for does not exist.</p>
        <button onClick={() => router.push('/')} className="art-back-btn">← Back to Home</button>
        <style jsx global>{articleStyles}</style>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <style jsx global>{articleStyles}</style>

      {/* ── TOPBAR ── */}
      <div className="art-topbar">
        <div className="art-container">
          <div className="art-topbar-inner">
            <span className="art-topbar-loc">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Ludhiana, Punjab
            </span>
            <div className="art-topbar-links">
              <a href="#">ਪੰਜਾਬੀ</a>
              <a href="#">हिन्दी</a>
            </div>
          </div>
        </div>
      </div>

      {/* ── HEADER ── */}
      <header className="art-header">
        <div className="art-container art-header-inner">
          <a href="/" className="art-logo-link">
            <img src="/images/logo.jpeg" alt="RL Logo" className="art-logo-img" />
            <div className="art-logo-text">
              <h1>Report Ludhiana Newspaper</h1>
              <span>ਹਰ ਕਦਮ ਤੁਹਾਡੇ ਨਾਲ</span>
            </div>
          </a>
          <button onClick={() => router.push('/')} className="art-home-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </button>
        </div>
      </header>

      {/* ── BREADCRUMB ── */}
      <div className="art-breadcrumb">
        <div className="art-container">
          <a href="/">Home</a>
          <span>/</span>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }}>{article.categories?.name || 'News'}</a>
          <span>/</span>
          <span className="art-breadcrumb-title">{article.title?.substring(0, 40)}...</span>
        </div>
      </div>

      {/* ── TOP AD ── */}
      {ads.top.length > 0 && (
        <div className="art-ad-top">
          {ads.top.map(ad => (
            <a key={ad.id} href={ad.click_url || '#'} target="_blank" rel="noopener noreferrer">
              <img src={ad.image_url} alt={ad.title} />
            </a>
          ))}
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="art-main">
        <div className="art-container">
          <div className="art-layout">
            {/* Article */}
            <article className="art-content">
              <span className="art-cat-badge">{article.categories?.name || 'News'}</span>
              <h1 className="art-title">{article.title}</h1>

              <div className="art-meta">
                <div className="art-meta-item">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  {formatDate(article.created_at)}
                </div>
                <div className="art-meta-item">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Report Ludhiana Newspaper
                </div>
              </div>

              <div className="art-share-bar">
                <span>Share:</span>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="art-share-btn art-share-fb">
                  <svg width="14" height="14" fill="#fff" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  Facebook
                </a>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="art-share-btn art-share-wa">
                  <svg width="14" height="14" fill="#fff" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                  WhatsApp
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="art-share-btn art-share-tw">
                  <svg width="14" height="14" fill="#fff" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  X
                </a>
              </div>

              {article.image_url && (
                <div className="art-featured-img">
                  <img src={article.image_url} alt={article.title} />
                </div>
              )}

              {article.excerpt && (
                <p className="art-excerpt">{article.excerpt}</p>
              )}

              <div
                className="art-body"
                dangerouslySetInnerHTML={{ __html: article.content?.replace(/\n/g, '<br/>') || '<p>No content available.</p>' }}
              />

              <div className="art-tag-bar">
                <span>Category:</span>
                <span className="art-tag">{article.categories?.name || 'News'}</span>
              </div>

              <div className="art-share-bar art-share-bottom">
                <span>Share this article:</span>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="art-share-btn art-share-wa">WhatsApp</a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="art-share-btn art-share-fb">Facebook</a>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="art-sidebar">
              <div className="art-side-box">
                <div className="art-side-box-title">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  Related News
                </div>
                {related.length > 0 ? related.map((item, i) => (
                  <a key={item.id} href={`/article/${item.id}`} className="art-related-item">
                    <div className="art-related-num">{i + 1}</div>
                    <div className="art-related-info">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.title} className="art-related-img" />
                      )}
                      <h4>{item.title}</h4>
                      <span>{timeAgo(item.created_at)}</span>
                    </div>
                  </a>
                )) : (
                  <p className="art-no-related">No related articles yet</p>
                )}
              </div>

              {ads.sidebar.length > 0 ? (
                ads.sidebar.map(ad => (
                  <a key={ad.id} href={ad.click_url || '#'} target="_blank" rel="noopener noreferrer" className="art-sidebar-ad">
                    <img src={ad.image_url} alt={ad.title} />
                  </a>
                ))
              ) : (
                <div className="art-ad-placeholder">📢 Ad Space — 300 x 250</div>
              )}

              <button onClick={() => router.push('/')} className="art-side-home-btn">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Back to Home Page
              </button>
            </aside>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="art-footer">
        <div className="art-container">
          <div className="art-footer-inner">
            <div className="art-footer-brand">
              <img src="/images/logo.jpeg" alt="RL Logo" />
              <span>Report Ludhiana Newspaper</span>
            </div>
            <span className="art-footer-copy">&copy; 2026 Report Ludhiana Newspaper. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </>
  );
}

const articleStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #fff; }
  a { text-decoration: none; }
  img { max-width: 100%; height: auto; }

  @keyframes spin { to { transform: rotate(360deg); } }

  .art-loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 60vh; font-family: 'Segoe UI', system-ui, sans-serif;
  }
  .art-spinner {
    width: 40px; height: 40px; border: 4px solid #eee; border-top: 4px solid #D42A2A;
    border-radius: 50%; animation: spin 1s linear infinite;
  }
  .art-loading p { color: #888; margin-top: 16px; }
  .art-loading h2 { color: #333; margin-bottom: 8px; }
  .art-back-btn {
    padding: 10px 24px; background: #D42A2A; color: #fff; border: none;
    border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
  }

  .art-container { max-width: 1200px; margin: 0 auto; padding: 0 16px; }

  /* TOPBAR */
  .art-topbar { background: #1a237e; color: #fff; padding: 6px 0; font-size: 12px; }
  .art-topbar-inner { display: flex; justify-content: space-between; align-items: center; }
  .art-topbar-loc { display: flex; align-items: center; gap: 4px; }
  .art-topbar-links { display: flex; gap: 16px; }
  .art-topbar-links a { color: rgba(255,255,255,0.8); font-size: 12px; }

  /* HEADER */
  .art-header {
    background: #fff; padding: 10px 0; border-bottom: 3px solid #D42A2A;
    position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  .art-header-inner { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .art-logo-link { display: flex; align-items: center; gap: 10px; text-decoration: none; min-width: 0; }
  .art-logo-img { width: 40px; height: 40px; flex-shrink: 0; }
  .art-logo-text h1 { font-size: 18px; font-weight: 800; color: #D42A2A; margin: 0; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .art-logo-text span { font-size: 10px; color: #1a237e; font-weight: 500; }
  .art-home-btn {
    display: flex; align-items: center; gap: 6px; padding: 8px 16px; flex-shrink: 0;
    background: #1a237e; color: #fff; border: none; border-radius: 8px;
    font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;
  }

  /* BREADCRUMB */
  .art-breadcrumb { background: #f8f8f8; padding: 8px 0; border-bottom: 1px solid #eee; overflow: hidden; }
  .art-breadcrumb .art-container { display: flex; align-items: center; gap: 0; white-space: nowrap; overflow: hidden; }
  .art-breadcrumb a { color: #D42A2A; font-size: 12px; font-weight: 500; flex-shrink: 0; }
  .art-breadcrumb span { color: #ccc; margin: 0 6px; }
  .art-breadcrumb-title { color: #666; font-size: 12px; overflow: hidden; text-overflow: ellipsis; }

  /* AD TOP */
  .art-ad-top { text-align: center; padding: 12px 16px; }
  .art-ad-top img { max-width: 728px; width: 100%; border-radius: 8px; }

  /* MAIN LAYOUT */
  .art-main { padding: 20px 0 40px; }
  .art-layout { display: flex; gap: 28px; align-items: flex-start; }
  .art-content { flex: 1; min-width: 0; overflow: hidden; }
  .art-sidebar { width: 300px; flex-shrink: 0; }

  /* ARTICLE STYLES */
  .art-cat-badge {
    display: inline-block; background: #D42A2A; color: #fff; padding: 4px 14px;
    border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
    margin-bottom: 12px; text-transform: uppercase;
  }
  .art-title { font-size: 26px; font-weight: 800; color: #111; line-height: 1.3; margin-bottom: 14px; word-wrap: break-word; }
  .art-meta { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
  .art-meta-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #666; }

  /* SHARE */
  .art-share-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
  .art-share-bar > span { font-size: 12px; font-weight: 600; color: #555; }
  .art-share-btn {
    display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px;
    border-radius: 6px; color: #fff; font-size: 11px; font-weight: 600;
  }
  .art-share-fb { background: #1877F2; }
  .art-share-wa { background: #25D366; }
  .art-share-tw { background: #000; }
  .art-share-bottom { border-top: 1px solid #eee; margin-top: 20px; padding-top: 14px; }

  /* IMAGE */
  .art-featured-img {
    margin-bottom: 20px; border-radius: 10px; overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }
  .art-featured-img img { width: 100%; display: block; border-radius: 10px; }

  /* EXCERPT */
  .art-excerpt {
    font-size: 15px; color: #444; line-height: 1.6; font-weight: 500; font-style: italic;
    padding: 14px 16px; background: #f8f9fa; border-left: 4px solid #D42A2A;
    border-radius: 0 8px 8px 0; margin-bottom: 20px;
  }

  /* BODY */
  .art-body { font-size: 15px; color: #333; line-height: 1.8; margin-bottom: 20px; word-wrap: break-word; overflow-wrap: break-word; }
  .art-body img { max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; }

  /* TAGS */
  .art-tag-bar { display: flex; align-items: center; gap: 8px; padding-top: 14px; border-top: 1px solid #eee; }
  .art-tag-bar > span:first-child { font-size: 12px; font-weight: 600; color: #555; }
  .art-tag { display: inline-block; background: #f0f0f0; color: #333; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }

  /* SIDEBAR */
  .art-side-box { background: #fff; border-radius: 12px; border: 1px solid #eee; margin-bottom: 16px; overflow: hidden; }
  .art-side-box-title { display: flex; align-items: center; gap: 8px; padding: 12px 14px; background: #1a237e; color: #fff; font-size: 13px; font-weight: 700; }
  .art-related-item { display: flex; gap: 10px; padding: 10px 14px; border-bottom: 1px solid #f0f0f0; color: inherit; }
  .art-related-item:hover { background: #f8f8f8; }
  .art-related-num {
    width: 22px; height: 22px; border-radius: 50%; background: #D42A2A; color: #fff;
    display: flex; align-items: center; justify-content: center; font-size: 10px;
    font-weight: 700; flex-shrink: 0; margin-top: 2px;
  }
  .art-related-info { flex: 1; min-width: 0; }
  .art-related-img { width: 100%; height: 70px; object-fit: cover; border-radius: 6px; margin-bottom: 4px; }
  .art-related-info h4 { font-size: 12px; font-weight: 600; color: #222; line-height: 1.4; margin: 0; }
  .art-related-info span { font-size: 10px; color: #999; }
  .art-no-related { font-size: 13px; color: #aaa; text-align: center; padding: 20px; }
  .art-sidebar-ad img { width: 100%; border-radius: 12px; }
  .art-ad-placeholder { padding: 30px; background: #f5f5f5; border-radius: 12px; text-align: center; color: #aaa; font-size: 12px; margin-bottom: 16px; }
  .art-side-home-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 12px; background: #D42A2A; color: #fff;
    border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;
  }

  /* FOOTER */
  .art-footer { background: #1a237e; padding: 14px 0; }
  .art-footer-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  .art-footer-brand { display: flex; align-items: center; gap: 8px; }
  .art-footer-brand img { width: 32px; height: 32px; }
  .art-footer-brand span { color: #fff; font-weight: 700; font-size: 13px; }
  .art-footer-copy { color: rgba(255,255,255,0.6); font-size: 11px; }

  /* ══════════ MOBILE RESPONSIVE ══════════ */
  @media (max-width: 768px) {
    .art-layout { flex-direction: column !important; }
    .art-sidebar { width: 100% !important; }
    .art-title { font-size: 20px !important; }
    .art-logo-text h1 { font-size: 14px !important; }
    .art-logo-text span { font-size: 9px !important; }
    .art-logo-img { width: 34px !important; height: 34px !important; }
    .art-home-btn { padding: 6px 12px !important; font-size: 12px !important; }
    .art-home-btn svg { width: 14px; height: 14px; }
    .art-meta { gap: 8px; }
    .art-meta-item { font-size: 11px !important; }
    .art-share-btn { padding: 4px 10px !important; font-size: 10px !important; }
    .art-excerpt { font-size: 14px !important; padding: 12px 14px !important; }
    .art-body { font-size: 14px !important; line-height: 1.7 !important; }
    .art-cat-badge { font-size: 10px !important; padding: 3px 10px !important; }
    .art-breadcrumb a { font-size: 11px !important; }
    .art-breadcrumb-title { font-size: 11px !important; }
    .art-container { padding: 0 12px !important; }
    .art-main { padding: 14px 0 30px !important; }
    .art-footer-inner { flex-direction: column; text-align: center; }
    .art-footer-brand { justify-content: center; }
    .art-topbar-loc { font-size: 11px !important; }
  }

  @media (max-width: 400px) {
    .art-title { font-size: 18px !important; }
    .art-logo-text h1 { font-size: 12px !important; }
    .art-home-btn span { display: none; }
    .art-share-bar { gap: 6px !important; }
    .art-share-btn { padding: 4px 8px !important; font-size: 10px !important; }
  }
`;
