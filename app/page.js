'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

/* ── Inline SVG Icons ── */
const Icons = {
  search: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  play: <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>,
  playSmall: <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>,
  clock: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  fire: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 23c-3.6 0-8-2.4-8-8.5C4 9.5 9 4 12 1c3 3 8 8.5 8 13.5 0 6.1-4.4 8.5-8 8.5z"/></svg>,
  camera: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  video: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><rect x="2" y="4" width="14" height="16" rx="2"/><path d="m22 7-6 3.5L22 14z"/></svg>,
  newspaper: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8m8-4h-8m4 8h-4"/></svg>,
  trending: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  chevron: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>,
  images: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>,
  fb: <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  twitter: <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  youtube: <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff"/></svg>,
  instagram: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg>,
  mail: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  phone: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  mapPin: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  zap: <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
};

/* ── Helpers ── */
const placeholder = (w, h, text, bg = 'e0e0e0', color = '999') =>
  `https://placehold.co/${w}x${h}/${bg}/${color}?text=${encodeURIComponent(text)}&font=poppins`;

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
  return match ? match[1] : null;
}

function getYouTubeThumbnail(url) {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

/* ── Fallback Data (used when no Supabase data exists) ── */
const fallbackBreaking = [
  'Ludhiana Municipal Corporation announces new smart city projects worth ₹500 crore',
  'Punjab CM visits Ludhiana industrial zone, promises infrastructure upgrade',
  'Heavy rains expected in Ludhiana region for next 48 hours — IMD alert',
];

export default function Home() {
  const [currentTime, setCurrentTime] = useState('');
  const [articles, setArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [breaking, setBreaking] = useState([]);
  const [videos, setVideos] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [ads, setAds] = useState({ top: [], middle: [], sidebar: [], bottom: [] });
  const [categories, setCategories] = useState([]);
  const [categoryArticles, setCategoryArticles] = useState({});
  const [activeCategory, setActiveCategory] = useState('Home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadData();

    // Reload data when user navigates back to this page
    const handleFocus = () => { setActiveCategory('Home'); loadData(); };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('popstate', () => { setActiveCategory('Home'); loadData(); });
    window.addEventListener('pageshow', (e) => { if (e.persisted) { setActiveCategory('Home'); loadData(); } });

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  async function loadData() {
    try {
      const [artRes, featRes, breakRes, vidRes, galRes, adsRes, catRes] = await Promise.all([
        supabase.from('articles').select('*, categories(name)').eq('status', 'published').order('created_at', { ascending: false }).limit(9),
        supabase.from('articles').select('*, categories(name)').eq('status', 'published').eq('is_featured', true).order('created_at', { ascending: false }).limit(3),
        supabase.from('breaking_news').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('videos').select('*, categories(name)').eq('status', 'published').order('created_at', { ascending: false }).limit(5),
        supabase.from('galleries').select('*, gallery_photos(id)').eq('status', 'published').order('created_at', { ascending: false }).limit(5),
        supabase.from('ads').select('*').eq('is_active', true),
        supabase.from('categories').select('*').order('name'),
      ]);

      setArticles(artRes.data || []);
      setAllArticles(artRes.data || []);
      setFeatured(featRes.data || []);
      setBreaking(breakRes.data || []);
      setVideos(vidRes.data || []);
      setGalleries(galRes.data || []);
      setCategories(catRes.data || []);

      // Organize ads by placement
      const allAds = adsRes.data || [];
      setAds({
        top: allAds.filter(a => a.placement === 'top'),
        middle: allAds.filter(a => a.placement === 'middle'),
        sidebar: allAds.filter(a => a.placement === 'sidebar'),
        bottom: allAds.filter(a => a.placement === 'bottom'),
      });

      // Load articles for Sports and Entertainment categories
      const sportsCat = (catRes.data || []).find(c => c.slug === 'sports');
      const entertainCat = (catRes.data || []).find(c => c.slug === 'entertainment');
      const catArticlesObj = {};

      if (sportsCat) {
        const { data } = await supabase.from('articles').select('*, categories(name)')
          .eq('status', 'published').eq('category_id', sportsCat.id)
          .order('created_at', { ascending: false }).limit(3);
        catArticlesObj['Sports'] = data || [];
      }
      if (entertainCat) {
        const { data } = await supabase.from('articles').select('*, categories(name)')
          .eq('status', 'published').eq('category_id', entertainCat.id)
          .order('created_at', { ascending: false }).limit(3);
        catArticlesObj['Entertainment'] = data || [];
      }
      setCategoryArticles(catArticlesObj);

    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  }

  // Filter articles when category changes
  async function handleCategoryClick(categoryName) {
    setActiveCategory(categoryName);
    if (categoryName === 'Home') {
      setArticles(allArticles);
      return;
    }
    // Special tabs - scroll to section
    if (categoryName === 'Videos') {
      document.querySelector('.video-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (categoryName === 'Photos') {
      document.querySelector('.gallery-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    try {
      // First get the category from DB directly
      const { data: catData } = await supabase.from('categories').select('*')
        .or(`name.ilike.${categoryName},slug.ilike.${categoryName.toLowerCase()}`)
        .limit(1);

      if (catData && catData.length > 0) {
        const cat = catData[0];
        const { data } = await supabase.from('articles').select('*, categories(name)')
          .eq('status', 'published').eq('category_id', cat.id)
          .order('created_at', { ascending: false }).limit(20);
        setArticles(data || []);
      } else {
        setArticles([]);
      }
    } catch (err) {
      console.error('Filter error:', err);
      setArticles([]);
    }
  }

  // Use featured articles for hero, or fall back to latest
  const heroArticles = (activeCategory === 'Home' && featured.length > 0) ? featured : articles.slice(0, 3);
  const heroMain = heroArticles[0];
  const heroSide = heroArticles.slice(1, 3);

  // Latest news (excluding hero)
  const heroIds = heroArticles.map(a => a?.id);
  const latestNews = articles.filter(a => !heroIds.includes(a.id)).slice(0, 6);

  // Breaking news with fallback
  const breakingItems = breaking.length > 0 ? breaking.map(b => b.headline) : fallbackBreaking;

  // Trending = most recent articles
  const trendingNews = articles.slice(0, 5);

  // Videos
  const mainVideo = videos[0];
  const sideVideos = videos.slice(1, 5);

  return (
    <>
      {/* ── TOPBAR ── */}
      <div className="topbar">
        <div className="container">
          <div className="topbar-left">
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{Icons.mapPin} Ludhiana, Punjab</span>
            <span>{currentTime}</span>
          </div>
          <div className="topbar-right">
            <a href="#">ਪੰਜਾਬੀ</a>
            <a href="#">हिन्दी</a>
            <div className="topbar-social">
              <a href="https://www.facebook.com/share/184kDqRTQr/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">{Icons.fb}</a>
              <a href="https://www.instagram.com/_davvy_rajput_?igsh=MXM0ZnY3OG41NzV6cw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram">{Icons.instagram}</a>
              <a href="https://youtube.com/@reportludhiana?si=Sd3Z7i8U5CAr6IqI" target="_blank" rel="noopener noreferrer" aria-label="YouTube">{Icons.youtube}</a>
            </div>
          </div>
        </div>
      </div>

      {/* ── HEADER ── */}
      <header className="header">
        <div className="container">
          <div className="logo-area">
            <img src="/images/logo.jpeg" alt="RL Logo" className="logo-img" />
            <div className="logo-text">
              <h1>Report Ludhiana Newspaper</h1>
              <span>ਹਰ ਕਦਮ ਤੁਹਾਡੇ ਨਾਲ</span>
            </div>
          </div>
          <div className="header-search">
            <input type="text" placeholder="Search news, topics, videos..." />
            <button aria-label="Search">{Icons.search}</button>
          </div>
          <div className="header-actions">
            <a href="#" className="btn-epaper">{Icons.newspaper} E-Paper</a>
          </div>
        </div>
      </header>

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="container">
          <div className="nav-menu">
            {['Home', 'Ludhiana', 'Punjab', 'National', 'Politics', 'Crime', 'Sports', 'Business', 'Entertainment', 'Education', 'Videos', 'Photos'].map(cat => (
              <a
                key={cat}
                href="#"
                className={activeCategory === cat ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleCategoryClick(cat); }}
              >
                {cat}
              </a>
            ))}
            <button className="nav-more">More {Icons.chevron}</button>
          </div>
        </div>
      </nav>

      {/* ── BREAKING NEWS TICKER ── */}
      <div className="ticker">
        <div className="container">
          <div className="ticker-label">{Icons.zap} Breaking</div>
          <div className="ticker-track">
            <div className="ticker-content">
              {[...breakingItems, ...breakingItems].map((item, i) => (
                <span className="ticker-item" key={i}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── TOP AD BANNER ── */}
      {ads.top.length > 0 ? (
        <div className="ad-banner">
          {ads.top.map(ad => (
            <a key={ad.id} href={ad.click_url || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'block', maxWidth: 970, margin: '0 auto' }}>
              <img src={ad.image_url} alt={ad.title} style={{ width: '100%', borderRadius: 8 }} />
            </a>
          ))}
        </div>
      ) : (
        <div className="ad-banner">
          <div className="ad-banner-inner">📢 Advertisement Banner — 970 x 90 — Contact: reportludhiananewspaper@gmail.com</div>
        </div>
      )}

      {/* ── HERO SECTION ── */}
      <section className="hero">
        <div className="container">
          {heroMain ? (
            <div className="hero-grid">
              <Link href={`/article/${heroMain.id}`} className="hero-main" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <img src={heroMain.image_url || placeholder(900, 560, 'Report+Ludhiana', 'cc2222', 'fff')} alt={heroMain.title} />
                <div className="hero-overlay">
                  <span className="hero-category">{heroMain.categories?.name || 'News'}</span>
                  <h2>{heroMain.title}</h2>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{Icons.clock} {timeAgo(heroMain.created_at)}</p>
                </div>
              </Link>
              <div className="hero-side">
                {heroSide.map((item, i) => (
                  <Link href={`/article/${item.id}`} className="hero-side-card" key={item.id || i} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <img src={item.image_url || placeholder(600, 380, 'News', '1a237e', 'fff')} alt={item.title} />
                    <div className="hero-side-overlay">
                      <span className="hero-category">{item.categories?.name || 'News'}</span>
                      <h3>{item.title}</h3>
                    </div>
                  </Link>
                ))}
                {heroSide.length < 2 && (
                  <div className="hero-side-card" style={{ background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
                    <p style={{ color: '#aaa', fontSize: 13 }}>More news coming soon...</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>📰</p>
              <p style={{ fontSize: 16, fontWeight: 600 }}>No published articles yet</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Add articles from the admin panel to see them here</p>
            </div>
          )}
        </div>
      </section>

      {/* ── LATEST NEWS + SIDEBAR ── */}
      <section className="news-section">
        <div className="container">
          <div className="news-layout">
            <div>
              <div className="section-title">
                <div className="icon">{Icons.newspaper}</div>
                <h2>{activeCategory === 'Home' ? 'Latest News' : `${activeCategory} News`}</h2>
                {activeCategory !== 'Home' && (
                  <a href="#" className="view-all" onClick={(e) => { e.preventDefault(); handleCategoryClick('Home'); }}>← Back to All {Icons.chevron}</a>
                )}
                {activeCategory === 'Home' && <a href="#" className="view-all">View All {Icons.chevron}</a>}
              </div>
              {latestNews.length > 0 ? (
                <div className="news-grid">
                  {latestNews.map((item) => (
                    <Link href={`/article/${item.id}`} className="news-card" key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="news-card-img">
                        <img src={item.image_url || placeholder(800, 500, item.categories?.name || 'News', 'cc3333', 'fff')} alt={item.title} />
                        <span className="news-card-cat">{item.categories?.name || 'News'}</span>
                      </div>
                      <div className="news-card-body">
                        <h3>{item.title}</h3>
                        <p>{item.excerpt || item.content?.substring(0, 120) || ''}</p>
                        <div className="news-card-meta">
                          <span>{Icons.clock} {timeAgo(item.created_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#aaa', background: '#fafafa', borderRadius: 12 }}>
                  <p style={{ fontSize: 13 }}>No articles yet. Add content from admin panel.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="sidebar">
              <div className="sidebar-box">
                <div className="sidebar-box-title">{Icons.trending} Trending Now</div>
                <div className="sidebar-box-body">
                  {trendingNews.length > 0 ? trendingNews.map((item, i) => (
                    <Link href={`/article/${item.id}`} className="trending-item" key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="trending-num">{i + 1}</div>
                      <div>
                        <h4>{item.title}</h4>
                        <div className="meta">{timeAgo(item.created_at)}</div>
                      </div>
                    </Link>
                  )) : (
                    <p style={{ fontSize: 13, color: '#aaa', textAlign: 'center', padding: 20 }}>No trending news yet</p>
                  )}
                </div>
              </div>

              {ads.sidebar.length > 0 ? (
                ads.sidebar.map(ad => (
                  <a key={ad.id} href={ad.click_url || '#'} target="_blank" rel="noopener noreferrer">
                    <img src={ad.image_url} alt={ad.title} style={{ width: '100%', borderRadius: 12 }} />
                  </a>
                ))
              ) : (
                <div className="ad-sidebar">📢 Ad Space — 300 x 250</div>
              )}

              <div className="sidebar-box">
                <div className="sidebar-box-title">{Icons.mail} Stay Connected</div>
                <div className="sidebar-box-body">
                  <p style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>Get breaking news delivered to your inbox.</p>
                  <input type="email" placeholder="Enter your email" style={{
                    width: '100%', padding: '10px 14px', border: '2px solid #ddd',
                    borderRadius: 8, fontSize: 13, marginBottom: 10, fontFamily: 'inherit', boxSizing: 'border-box',
                  }} />
                  <button style={{
                    width: '100%', padding: '10px', background: '#D42A2A', color: '#fff',
                    borderRadius: 8, fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
                    cursor: 'pointer', border: 'none',
                  }}>Subscribe Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MID AD BANNER ── */}
      {ads.middle.length > 0 ? (
        <div className="ad-banner">
          {ads.middle.map(ad => (
            <a key={ad.id} href={ad.click_url || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'block', maxWidth: 970, margin: '0 auto' }}>
              <img src={ad.image_url} alt={ad.title} style={{ width: '100%', borderRadius: 8 }} />
            </a>
          ))}
        </div>
      ) : (
        <div className="ad-banner">
          <div className="ad-banner-inner">📢 Advertisement Banner — 970 x 90 — Premium Placement</div>
        </div>
      )}

      {/* ── VIDEO SECTION ── */}
      <section className="video-section">
        <div className="container">
          <div className="section-title">
            <div className="icon">{Icons.video}</div>
            <h2>Video News</h2>
            <a href="#" className="view-all">View All {Icons.chevron}</a>
          </div>
          {mainVideo ? (
            <div className="video-grid">
              <div className="video-main">
                {getYouTubeId(mainVideo.youtube_url) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(mainVideo.youtube_url)}`}
                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img src={mainVideo.thumbnail_url || placeholder(900, 506, 'VIDEO', 'cc2222', 'fff')} alt={mainVideo.title} />
                    <div className="video-play">{Icons.play}</div>
                    <div className="video-info">
                      <h3>{mainVideo.title}</h3>
                      <p>{timeAgo(mainVideo.created_at)}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="video-list">
                {sideVideos.map((v) => {
                  const ytThumb = v.thumbnail_url || getYouTubeThumbnail(v.youtube_url);
                  return (
                    <a key={v.id} href={v.youtube_url} target="_blank" rel="noopener noreferrer" className="video-thumb" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="video-thumb-img">
                        <img src={ytThumb || placeholder(300, 180, 'VIDEO', '1a237e', 'fff')} alt={v.title} />
                        <div className="video-thumb-play">{Icons.playSmall}</div>
                      </div>
                      <div className="video-thumb-info">
                        <h4>{v.title}</h4>
                        <div className="meta">{timeAgo(v.created_at)}</div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#aaa', background: '#fff', borderRadius: 12 }}>
              <p style={{ fontSize: 13 }}>No videos yet. Add YouTube videos from admin panel.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── PHOTO GALLERY ── */}
      <section className="gallery-section">
        <div className="container">
          <div className="section-title">
            <div className="icon">{Icons.camera}</div>
            <h2>Photo Gallery</h2>
            <a href="#" className="view-all">View All {Icons.chevron}</a>
          </div>
          {galleries.length > 0 ? (
            <div className="gallery-grid">
              {galleries.map((g) => (
                <div className="gallery-item" key={g.id}>
                  <img src={g.cover_image_url || placeholder(700, 500, 'Gallery', 'cc3333', 'fff')} alt={g.title} />
                  <div className="gallery-count">{Icons.images} {g.gallery_photos?.length || 0} Photos</div>
                  <div className="gallery-overlay">
                    <p>{g.title}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#aaa', background: '#fafafa', borderRadius: 12 }}>
              <p style={{ fontSize: 13 }}>No photo galleries yet. Create galleries from admin panel.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── AD BANNER ── */}
      {ads.bottom.length > 0 ? (
        <div className="ad-banner">
          {ads.bottom.map(ad => (
            <a key={ad.id} href={ad.click_url || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'block', maxWidth: 970, margin: '0 auto' }}>
              <img src={ad.image_url} alt={ad.title} style={{ width: '100%', borderRadius: 8 }} />
            </a>
          ))}
        </div>
      ) : (
        <div className="ad-banner">
          <div className="ad-banner-inner">📢 Advertisement Banner — 970 x 90 — Your Brand Here</div>
        </div>
      )}

      {/* ── CATEGORY SECTIONS (Sports & Entertainment) ── */}
      <section className="cat-strip">
        <div className="container">
          <div className="cat-strip-grid">
            {Object.entries(categoryArticles).map(([cat, items]) => (
              <div className="cat-block" key={cat}>
                <div className="section-title">
                  <div className="icon">{cat === 'Sports' ? Icons.trending : Icons.fire}</div>
                  <h2>{cat}</h2>
                  <a href="#" className="view-all">View All {Icons.chevron}</a>
                </div>
                {items.length > 0 ? (
                  <div className="cat-block-list">
                    {items.map((item) => (
                      <Link href={`/article/${item.id}`} className="cat-block-item" key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="cat-block-thumb">
                          <img src={item.image_url || placeholder(300, 200, cat, '553399', 'fff')} alt={item.title} />
                        </div>
                        <div className="cat-block-info">
                          <h4>{item.title}</h4>
                          <div className="meta">{Icons.clock} {timeAgo(item.created_at)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: '#aaa', padding: 20, textAlign: 'center' }}>No {cat.toLowerCase()} articles yet</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-about">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src="/images/logo.jpeg" alt="RL Logo" style={{ width: 44, height: 44 }} />
                <div className="logo-text">
                  <h2 style={{ color: '#fff' }}>Report Ludhiana Newspaper</h2>
                  <span>ਹਰ ਕਦਮ ਤੁਹਾਡੇ ਨਾਲ</span>
                </div>
              </div>
              <p>Your most trusted source for local news from Ludhiana and Punjab. We bring you the latest in politics, sports, crime, business, entertainment, and community events — 24/7.</p>
              <div className="footer-social">
                <a href="https://www.facebook.com/share/184kDqRTQr/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">{Icons.fb}</a>
                <a href="https://www.instagram.com/_davvy_rajput_?igsh=MXM0ZnY3OG41NzV6cw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram">{Icons.instagram}</a>
                <a href="https://youtube.com/@reportludhiana?si=Sd3Z7i8U5CAr6IqI" target="_blank" rel="noopener noreferrer" aria-label="YouTube">{Icons.youtube}</a>
              </div>
            </div>
            <div className="footer-col">
              <h3>Categories</h3>
              <ul>
                <li><a href="#">Ludhiana</a></li>
                <li><a href="#">Punjab</a></li>
                <li><a href="#">National</a></li>
                <li><a href="#">Politics</a></li>
                <li><a href="#">Sports</a></li>
                <li><a href="#">Entertainment</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Advertise</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">E-Paper</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Contact</h3>
              <ul>
                <li><a href="#" style={{ gap: 8 }}>{Icons.mapPin} Ludhiana, Punjab, India</a></li>
                <li><a href="#" style={{ gap: 8 }}>{Icons.phone} +91 86999 70543</a></li>
                <li><a href="#" style={{ gap: 8 }}>{Icons.mail} reportludhiananewspaper@gmail.com</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 Report Ludhiana Newspaper. All rights reserved.</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>Designed with ❤️ in Ludhiana</span>
              <a href="/admin/login" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textDecoration: 'none', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }}>Admin</a>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
