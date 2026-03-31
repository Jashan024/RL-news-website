'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function NewsManager() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadArticles(); }, []);

  async function loadArticles() {
    const { data } = await supabase
      .from('articles')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    setArticles(data || []);
    setLoading(false);
  }

  async function deleteArticle(id, title) {
    if (!confirm(`Delete "${title}"?`)) return;
    await supabase.from('articles').delete().eq('id', id);
    await supabase.from('activity_log').insert({ action: 'deleted', entity_type: 'article', entity_title: title });
    loadArticles();
  }

  async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    await supabase.from('articles').update({ status: newStatus }).eq('id', id);
    loadArticles();
  }

  async function toggleFeatured(id, current) {
    await supabase.from('articles').update({ is_featured: !current }).eq('id', id);
    loadArticles();
  }

  const filtered = filter === 'all' ? articles :
    filter === 'published' ? articles.filter(a => a.status === 'published') :
    filter === 'draft' ? articles.filter(a => a.status === 'draft') :
    articles.filter(a => a.is_featured);

  const timeAgo = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0 }}>📰 News Articles</h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{articles.length} total articles</p>
        </div>
        <a href="/admin/news/new" style={{
          padding: '10px 24px', background: '#D42A2A', color: '#fff',
          borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(212,42,42,0.25)', display: 'flex', alignItems: 'center', gap: 6,
        }}>+ Add Article</a>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'published', 'draft', 'featured'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 18px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            border: '1px solid', cursor: 'pointer', fontFamily: 'inherit',
            background: filter === f ? '#D42A2A' : '#fff',
            color: filter === f ? '#fff' : '#555',
            borderColor: filter === f ? '#D42A2A' : '#e0e0e0',
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: '#fff', borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
      }}>
        {loading ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading articles...</p>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 50, textAlign: 'center' }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>📝</p>
            <p style={{ fontSize: 14, color: '#888' }}>No articles found</p>
            <a href="/admin/news/new" style={{
              display: 'inline-block', marginTop: 12, padding: '8px 20px',
              background: '#D42A2A', color: '#fff', borderRadius: 8,
              fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}>+ Create First Article</a>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Article</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Featured</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(art => (
                <tr key={art.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {art.image_url && (
                        <img src={art.image_url} alt="" style={{ width: 50, height: 35, borderRadius: 6, objectFit: 'cover' }} />
                      )}
                      <div style={{ fontWeight: 600, color: '#333', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {art.title}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: '#f0f0f0', color: '#555',
                    }}>{art.categories?.name || '—'}</span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button onClick={() => toggleStatus(art.id, art.status)} style={{
                      padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      background: art.status === 'published' ? '#E8F5E9' : '#FFF3E0',
                      color: art.status === 'published' ? '#2E7D32' : '#E65100',
                    }}>{art.status}</button>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button onClick={() => toggleFeatured(art.id, art.is_featured)} style={{
                      fontSize: 18, background: 'none', border: 'none', cursor: 'pointer',
                    }}>{art.is_featured ? '⭐' : '☆'}</button>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#999', fontSize: 12 }}>{timeAgo(art.created_at)}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <a href={`/admin/news/edit?id=${art.id}`} style={{
                        padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: '#E3F2FD', color: '#1565C0', textDecoration: 'none',
                      }}>Edit</a>
                      <button onClick={() => deleteArticle(art.id, art.title)} style={{
                        padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: '#FFEBEE', color: '#C62828', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
