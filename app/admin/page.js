'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const statCards = [
  { label: 'Total Articles', key: 'articles', icon: '📰', color: '#D42A2A', bg: '#FEE' },
  { label: 'Total Videos', key: 'videos', icon: '🎥', color: '#1A237E', bg: '#E8EAF6' },
  { label: 'Photo Galleries', key: 'galleries', icon: '📸', color: '#2E7D32', bg: '#E8F5E9' },
  { label: 'Active Ads', key: 'ads', icon: '📢', color: '#E65100', bg: '#FFF3E0' },
];

const quickActions = [
  { label: 'Add News', href: '/admin/news/new', icon: '📰', color: '#D42A2A' },
  { label: 'Add Video', href: '/admin/videos/new', icon: '🎥', color: '#1A237E' },
  { label: 'Add Photos', href: '/admin/photos/new', icon: '📸', color: '#2E7D32' },
  { label: 'Add Ad', href: '/admin/ads/new', icon: '📢', color: '#E65100' },
  { label: 'Breaking News', href: '/admin/breaking', icon: '⚡', color: '#F57F17' },
  { label: 'Categories', href: '/admin/categories', icon: '📂', color: '#6A1B9A' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ articles: 0, videos: 0, galleries: 0, ads: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [artRes, vidRes, galRes, adsRes, actRes, recRes] = await Promise.all([
        supabase.from('articles').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
        supabase.from('galleries').select('id', { count: 'exact', head: true }),
        supabase.from('ads').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('articles').select('id, title, status, created_at, categories(name)').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        articles: artRes.count || 0,
        videos: vidRes.count || 0,
        galleries: galRes.count || 0,
        ads: adsRes.count || 0,
      });
      setRecentActivity(actRes.data || []);
      setRecentArticles(recRes.data || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
    setLoading(false);
  }

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div>
      {/* Page Title */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Welcome back to Report Ludhiana Newspaper Admin Panel</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        {statCards.map(card => (
          <div key={card.key} style={{
            background: '#fff',
            borderRadius: 14,
            padding: '22px 24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            border: '1px solid #f0f0f0',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: card.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>{card.icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: card.color, lineHeight: 1 }}>
                {loading ? '—' : stats[card.key]}
              </div>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 500, marginTop: 2 }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: 24,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 28,
        border: '1px solid #f0f0f0',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 16 }}>⚡ Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {quickActions.map(action => (
            <a key={action.href} href={action.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: '18px 12px', borderRadius: 12,
              border: '2px dashed #e8e8e8', textDecoration: 'none',
              transition: 'all 0.2s', cursor: 'pointer',
              background: '#fafafa',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.background = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.style.background = '#fafafa'; }}
            >
              <span style={{ fontSize: 28 }}>{action.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{action.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Articles */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: 24,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>📰 Recent Articles</h2>
            <a href="/admin/news" style={{ fontSize: 12, color: '#D42A2A', fontWeight: 600, textDecoration: 'none' }}>View All →</a>
          </div>
          {loading ? (
            <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: 20 }}>Loading...</p>
          ) : recentArticles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📝</p>
              <p style={{ fontSize: 13 }}>No articles yet. Create your first one!</p>
              <a href="/admin/news/new" style={{
                display: 'inline-block', marginTop: 12, padding: '8px 20px',
                background: '#D42A2A', color: '#fff', borderRadius: 8,
                fontSize: 12, fontWeight: 600, textDecoration: 'none',
              }}>+ Add Article</a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentArticles.map(art => (
                <div key={art.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 8, background: '#fafafa',
                  border: '1px solid #f0f0f0',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: '#333',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{art.title}</div>
                    <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                      {art.categories?.name || 'Uncategorized'} • {timeAgo(art.created_at)}
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                    background: art.status === 'published' ? '#E8F5E9' : '#FFF3E0',
                    color: art.status === 'published' ? '#2E7D32' : '#E65100',
                  }}>{art.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: 24,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 16 }}>🕐 Recent Activity</h2>
          {loading ? (
            <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: 20 }}>Loading...</p>
          ) : recentActivity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📋</p>
              <p style={{ fontSize: 13 }}>No activity yet. Start adding content!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentActivity.map(act => (
                <div key={act.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 8, background: '#fafafa',
                  border: '1px solid #f0f0f0',
                }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: act.action === 'created' ? '#E8F5E9' : act.action === 'updated' ? '#E3F2FD' : '#FFEBEE',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                  }}>
                    {act.action === 'created' ? '✅' : act.action === 'updated' ? '✏️' : '🗑️'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#333' }}>
                      <strong style={{ textTransform: 'capitalize' }}>{act.action}</strong> {act.entity_type}
                    </div>
                    <div style={{
                      fontSize: 11, color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{act.entity_title}</div>
                  </div>
                  <div style={{ fontSize: 10, color: '#bbb', whiteSpace: 'nowrap' }}>{timeAgo(act.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
