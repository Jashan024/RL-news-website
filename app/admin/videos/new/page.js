'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';

export default function NewVideo() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    youtube_url: '',
    category_id: '',
    thumbnail_url: '',
    is_featured: false,
    status: 'draft',
  });

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data || []));
  }, []);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  function getYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
    return match ? match[1] : null;
  }

  const handleSubmit = async (status) => {
    if (!form.title.trim()) { alert('Please enter a title'); return; }
    if (!form.youtube_url.trim()) { alert('Please enter a YouTube URL'); return; }
    setSaving(true);

    const videoData = {
      ...form,
      status,
      category_id: form.category_id || null,
    };

    const { error } = await supabase.from('videos').insert(videoData);
    if (error) { alert('Error saving video: ' + error.message); setSaving(false); return; }

    await supabase.from('activity_log').insert({
      action: 'created',
      entity_type: 'video',
      entity_title: form.title,
    });

    router.push('/admin/videos');
  };

  const inputStyle = {
    width: '100%', padding: '11px 16px', border: '2px solid #e8e8e8', borderRadius: 10,
    fontSize: 14, fontFamily: 'inherit', transition: 'all 0.2s', outline: 'none', boxSizing: 'border-box',
    background: '#fafafa',
  };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 };
  const cardStyle = {
    background: '#fff', borderRadius: 14, padding: 24,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
  };

  const ytId = getYouTubeId(form.youtube_url);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0 }}>🎬 Add Video</h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Add a new video from YouTube</p>
        </div>
        <a href="/admin/videos" style={{
          padding: '8px 18px', background: '#f0f0f0', borderRadius: 8,
          fontSize: 12, fontWeight: 600, color: '#555', textDecoration: 'none',
        }}>&larr; Back to Videos</a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={cardStyle}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Video Title *</label>
              <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter video title..." style={{ ...inputStyle, fontSize: 18, fontWeight: 600, padding: '14px 16px' }}
                onFocus={(e) => e.target.style.borderColor = '#D42A2A'} onBlur={(e) => e.target.style.borderColor = '#e8e8e8'} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>YouTube URL *</label>
              <input type="text" value={form.youtube_url} onChange={(e) => handleChange('youtube_url', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..." style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#D42A2A'} onBlur={(e) => e.target.style.borderColor = '#e8e8e8'} />
            </div>

            {ytId && (
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Preview</label>
                <div style={{ borderRadius: 10, overflow: 'hidden', aspectRatio: '16/9', background: '#000' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            <div>
              <label style={labelStyle}>Custom Thumbnail URL (optional)</label>
              <input type="text" value={form.thumbnail_url} onChange={(e) => handleChange('thumbnail_url', e.target.value)}
                placeholder="https://... (leave empty to use YouTube thumbnail)" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#D42A2A'} onBlur={(e) => e.target.style.borderColor = '#e8e8e8'} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 16 }}>Publish</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleSubmit('draft')} disabled={saving} style={{
                flex: 1, padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                border: '2px solid #e0e0e0', background: '#fff', color: '#555', cursor: 'pointer', fontFamily: 'inherit',
              }}>Save Draft</button>
              <button onClick={() => handleSubmit('published')} disabled={saving} style={{
                flex: 1, padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                border: 'none', background: '#D42A2A', color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(212,42,42,0.25)',
              }}>{saving ? 'Saving...' : 'Publish'}</button>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 16 }}>Category</h3>
            <select value={form.category_id} onChange={(e) => handleChange('category_id', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Select Category</option>
              {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 16 }}>Options</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#555' }}>
              <input type="checkbox" checked={form.is_featured} onChange={(e) => handleChange('is_featured', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#D42A2A' }} />
              <span style={{ fontWeight: 600 }}>Mark as Featured</span>
            </label>
            <p style={{ fontSize: 11, color: '#aaa', marginTop: 6, marginLeft: 28 }}>
              Featured videos appear prominently on the homepage
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
