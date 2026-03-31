'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';

function EditArticleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id');

  const [categories, setCategories] = useState([]);
  const [editorMode, setEditorMode] = useState('simple');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const editorRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category_id: '',
    is_featured: false,
    status: 'draft',
    image_url: '',
  });

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data || []));
    if (articleId) loadArticle();
  }, [articleId]);

  async function loadArticle() {
    const { data, error } = await supabase.from('articles').select('*').eq('id', articleId).single();
    if (error || !data) {
      alert('Article not found');
      router.push('/admin/news');
      return;
    }
    setForm({
      title: data.title || '',
      content: data.content || '',
      excerpt: data.excerpt || '',
      category_id: data.category_id || '',
      is_featured: data.is_featured || false,
      status: data.status || 'draft',
      image_url: data.image_url || '',
    });
    if (data.image_url) setImagePreview(data.image_url);
    setLoading(false);
  }

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    const ext = file.name.split('.').pop();
    const fileName = `articles/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('uploads').upload(fileName, file);
    if (error) { alert('Image upload failed: ' + error.message); return; }
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    handleChange('image_url', urlData.publicUrl);
  };

  const handleSubmit = async (status) => {
    if (!form.title.trim()) { alert('Please enter a title'); return; }
    setSaving(true);

    let content = form.content;
    if (editorMode === 'rich' && editorRef.current) {
      content = editorRef.current.innerHTML;
    }

    const articleData = {
      ...form,
      content,
      status,
      category_id: form.category_id || null,
      excerpt: form.excerpt || form.content?.substring(0, 160) || '',
    };

    const { error } = await supabase.from('articles').update(articleData).eq('id', articleId);
    if (error) { alert('Error updating article: ' + error.message); setSaving(false); return; }

    await supabase.from('activity_log').insert({
      action: 'updated',
      entity_type: 'article',
      entity_title: form.title,
    });

    router.push('/admin/news');
  };

  const inputStyle = {
    width: '100%', padding: '11px 16px', border: '2px solid #e8e8e8', borderRadius: 10,
    fontSize: 14, fontFamily: 'inherit', transition: 'all 0.2s', outline: 'none', boxSizing: 'border-box',
    background: '#fafafa',
  };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 };

  if (loading) return <p style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading article...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0 }}>✏️ Edit Article</h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Update existing article</p>
        </div>
        <a href="/admin/news" style={{
          padding: '8px 18px', background: '#f0f0f0', borderRadius: 8,
          fontSize: 12, fontWeight: 600, color: '#555', textDecoration: 'none',
        }}>&larr; Back to Articles</a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Main Form */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: 28,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
        }}>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Article Title *</label>
            <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter article headline..." style={{ ...inputStyle, fontSize: 18, fontWeight: 600, padding: '14px 16px' }}
              onFocus={(e) => e.target.style.borderColor = '#D42A2A'} onBlur={(e) => e.target.style.borderColor = '#e8e8e8'} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Short Excerpt</label>
            <input type="text" value={form.excerpt} onChange={(e) => handleChange('excerpt', e.target.value)}
              placeholder="Brief summary for listing pages..." style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#D42A2A'} onBlur={(e) => e.target.style.borderColor = '#e8e8e8'} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Article Content</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button onClick={() => setEditorMode('simple')} style={{
                padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: '1px solid', cursor: 'pointer', fontFamily: 'inherit',
                background: editorMode === 'simple' ? '#D42A2A' : '#fff',
                color: editorMode === 'simple' ? '#fff' : '#555',
                borderColor: editorMode === 'simple' ? '#D42A2A' : '#e0e0e0',
              }}>Simple Editor</button>
              <button onClick={() => setEditorMode('rich')} style={{
                padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: '1px solid', cursor: 'pointer', fontFamily: 'inherit',
                background: editorMode === 'rich' ? '#D42A2A' : '#fff',
                color: editorMode === 'rich' ? '#fff' : '#555',
                borderColor: editorMode === 'rich' ? '#D42A2A' : '#e0e0e0',
              }}>Rich Editor</button>
            </div>
          </div>

          {editorMode === 'simple' && (
            <textarea value={form.content} onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Write your article content here..." rows={14}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
              onFocus={(e) => e.target.style.borderColor = '#D42A2A'} onBlur={(e) => e.target.style.borderColor = '#e8e8e8'} />
          )}

          {editorMode === 'rich' && (
            <div>
              <div style={{
                display: 'flex', gap: 4, padding: '8px 12px', background: '#fafafa',
                borderRadius: '10px 10px 0 0', border: '2px solid #e8e8e8', borderBottom: 'none', flexWrap: 'wrap',
              }}>
                {[
                  { cmd: 'bold', icon: 'B', style: { fontWeight: 700 } },
                  { cmd: 'italic', icon: 'I', style: { fontStyle: 'italic' } },
                  { cmd: 'underline', icon: 'U', style: { textDecoration: 'underline' } },
                  { cmd: 'insertOrderedList', icon: '1.' },
                  { cmd: 'insertUnorderedList', icon: '\u2022' },
                  { cmd: 'formatBlock:H2', icon: 'H2', style: { fontWeight: 700, fontSize: 12 } },
                  { cmd: 'formatBlock:H3', icon: 'H3', style: { fontWeight: 700, fontSize: 11 } },
                  { cmd: 'formatBlock:P', icon: '\u00B6' },
                ].map(btn => (
                  <button key={btn.cmd} style={{
                    padding: '5px 10px', borderRadius: 4, border: '1px solid #ddd',
                    background: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', minWidth: 32, ...btn.style,
                  }} onClick={() => {
                    if (btn.cmd.startsWith('formatBlock:')) document.execCommand('formatBlock', false, btn.cmd.split(':')[1]);
                    else document.execCommand(btn.cmd, false, null);
                  }}>{btn.icon}</button>
                ))}
                <button style={{
                  padding: '5px 10px', borderRadius: 4, border: '1px solid #ddd',
                  background: '#fff', cursor: 'pointer', fontSize: 13,
                }} onClick={() => { const url = prompt('Enter link URL:'); if (url) document.execCommand('createLink', false, url); }}>🔗</button>
              </div>
              <div ref={editorRef} contentEditable suppressContentEditableWarning style={{
                minHeight: 280, padding: 16, border: '2px solid #e8e8e8',
                borderRadius: '0 0 10px 10px', fontSize: 14, lineHeight: 1.7,
                outline: 'none', background: '#fff', fontFamily: 'inherit',
              }} onFocus={(e) => e.target.style.borderColor = '#D42A2A'} onBlur={(e) => e.target.style.borderColor = '#e8e8e8'}
                dangerouslySetInnerHTML={{ __html: form.content }} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
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
              }}>{saving ? 'Saving...' : 'Update & Publish'}</button>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 16 }}>Category</h3>
            <select value={form.category_id} onChange={(e) => handleChange('category_id', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Select Category</option>
              {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 16 }}>Featured Image</h3>
            {imagePreview || form.image_url ? (
              <div style={{ marginBottom: 12 }}>
                <img src={imagePreview || form.image_url} alt="Preview" style={{ width: '100%', borderRadius: 10, objectFit: 'cover', aspectRatio: '16/10' }} />
                <button onClick={() => { setImagePreview(null); handleChange('image_url', ''); }} style={{
                  marginTop: 8, fontSize: 12, color: '#D42A2A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                }}>✕ Remove Image</button>
              </div>
            ) : null}
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: 24, border: '2px dashed #e0e0e0', borderRadius: 10, cursor: 'pointer', background: '#fafafa',
            }}>
              <span style={{ fontSize: 28 }}>📷</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#888' }}>Click to upload image</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
            <div style={{ marginTop: 10, fontSize: 11, color: '#aaa', textAlign: 'center' }}>Or paste image URL:</div>
            <input type="text" value={form.image_url}
              onChange={(e) => { handleChange('image_url', e.target.value); setImagePreview(null); }}
              placeholder="https://..." style={{ ...inputStyle, fontSize: 12, padding: '8px 12px', marginTop: 6 }} />
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 16 }}>Options</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#555' }}>
              <input type="checkbox" checked={form.is_featured} onChange={(e) => handleChange('is_featured', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#D42A2A' }} />
              <span style={{ fontWeight: 600 }}>Mark as Featured</span>
            </label>
            <p style={{ fontSize: 11, color: '#aaa', marginTop: 6, marginLeft: 28 }}>Featured articles appear in the hero section on homepage</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditArticle() {
  return (
    <Suspense fallback={<p style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading...</p>}>
      <EditArticleForm />
    </Suspense>
  );
}
