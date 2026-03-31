'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function VideosManager() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadVideos(); }, []);

  async function loadVideos() {
    const { data } = await supabase
      .from('videos')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    setVideos(data || []);
    setLoading(false);
  }

  async function deleteVideo(id, title) {
    if (!confirm(`Delete video "${title}"?`)) return;
    await supabase.from('videos').delete().eq('id', id);
    await supabase.from('activity_log').insert({ action: 'deleted', entity_type: 'video', entity_title: title });
    loadVideos();
  }

  async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    await supabase.from('videos').update({ status: newStatus }).eq('id', id);
    loadVideos();
  }

  async function toggleFeatured(id, current) {
    await supabase.from('videos').update({ is_featured: !current }).eq('id', id);
    loadVideos();
  }

  function getYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
    return match ? match[1] : null;
  }

  const filtered = filter === 'all' ? videos :
    filter === 'published' ? videos.filter(v => v.status === 'published') :
    filter === 'draft' ? videos.filter(v => v.status === 'draft') :
    videos.filter(v => v.is_featured);

  const timeAgo = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0 }}>🎬 Videos</h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{videos.length} total videos</p>
        </div>
        <a href="/admin/videos/new" style={{
          padding: '10px 24px', background: '#D42A2A', color: '#fff',
          borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(212,42,42,0.25)', display: 'flex', alignItems: 'center', gap: 6,
        }}>+ Add Video</a>
      </div>

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

      <div style={{
        background: '#fff', borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
      }}>
        {loading ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading videos...</p>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 50, textAlign: 'center' }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>🎬</p>
            <p style={{ fontSize: 14, color: '#888' }}>No videos found</p>
            <a href="/admin/videos/new" style={{
              display: 'inline-block', marginTop: 12, padding: '8px 20px',
              background: '#D42A2A', color: '#fff', borderRadius: 8,
              fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}>+ Add First Video</a>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Video</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Featured</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(vid => {
                const ytId = getYouTubeId(vid.youtube_url);
                return (
                  <tr key={vid.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {ytId && (
                          <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt=""
                            style={{ width: 64, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#333', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {vid.title}
                          </div>
                          <div style={{ fontSize: 11, color: '#aaa', marginTop: 2, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {vid.youtube_url}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#f0f0f0', color: '#555' }}>
                        {vid.categories?.name || '\u2014'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button onClick={() => toggleStatus(vid.id, vid.status)} style={{
                        padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        background: vid.status === 'published' ? '#E8F5E9' : '#FFF3E0',
                        color: vid.status === 'published' ? '#2E7D32' : '#E65100',
                      }}>{vid.status}</button>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button onClick={() => toggleFeatured(vid.id, vid.is_featured)} style={{
                        fontSize: 18, background: 'none', border: 'none', cursor: 'pointer',
                      }}>{vid.is_featured ? '\u2B50' : '\u2606'}</button>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#999', fontSize: 12 }}>{timeAgo(vid.created_at)}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <a href={`/admin/videos/edit?id=${vid.id}`} style={{
                          padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                          background: '#E3F2FD', color: '#1565C0', textDecoration: 'none',
                        }}>Edit</a>
                        <button onClick={() => deleteVideo(vid.id, vid.title)} style={{
                          padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                          background: '#FFEBEE', color: '#C62828', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
