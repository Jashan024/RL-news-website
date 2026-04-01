'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';

export default function NewAd() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingAds, setExistingAds] = useState([]);

  const [form, setForm] = useState({
    title: '',
    image_url: '',
    click_url: '',
    placement: 'top',
    is_active: true,
    expires_at: '',
    replace_existing: true,
  });

  useEffect(() => {
    loadExistingAds();
  }, []);

  async function loadExistingAds() {
    const { data } = await supabase.from('ads').select('id, title, placement, image_url').eq('is_active', true);
    setExistingAds(data || []);
  }

  const existingForPlacement = existingAds.filter(a => a.placement === form.placement);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    const ext = file.name.split('.').pop();
    const fileName = `ads/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('uploads').upload(fileName, file);
    if (error) { alert('Image upload failed: ' + error.message); return; }
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    handleChange('image_url', urlData.publicUrl);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { alert('Please enter a title'); return; }
    if (!form.image_url.trim()) { alert('Please upload or enter an image URL'); return; }
    setSaving(true);

    try {
      // If replace_existing is checked, delete old ads in same placement
      if (form.replace_existing && existingForPlacement.length > 0) {
        for (const oldAd of existingForPlacement) {
          // Delete old image from storage
          if (oldAd.image_url && oldAd.image_url.includes('/storage/v1/object/public/uploads/')) {
            try {
              const path = oldAd.image_url.split('/storage/v1/object/public/uploads/')[1];
              if (path) await supabase.storage.from('uploads').remove([path]);
            } catch (e) {
              console.warn('Could not delete old image:', e);
            }
          }
          // Delete the old ad record
          await supabase.from('ads').delete().eq('id', oldAd.id);
        }
      }

      const adData = {
        title: form.title,
        image_url: form.image_url,
        click_url: form.click_url || null,
        placement: form.placement,
        is_active: form.is_active,
        expires_at: form.expires_at || null,
      };

      const { error } = await supabase.from('ads').insert(adData);
      if (error) { alert('Error creating ad: ' + error.message); setSaving(false); return; }

      await supabase.from('activity_log').insert({
        action: 'created', entity_type: 'ad', entity_title: form.title,
      });

      router.push('/admin/ads');
    } catch (err) {
      alert('Error: ' + err.message);
      setSaving(false);
    }
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0 }}>📢 New Advertisement</h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Create a new ad placement</p>
        </div>
        <a href="/admin/ads" style={{
          padding: '8px 18px', background: '#f0f0f0', borderRadius: 8,
          fontSize: 12, fontWeight: 600, color: '#555', textDecoration: 'none',
        }}>&larr; Back to Ads</a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={cardStyle}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Ad Title *</label>
              <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter ad title..." style={{ ...inputStyle, fontSize: 16, fontWeight: 600, padding: '14px 16px' }}
                onFocus={(e) => e.target.style.borderColor = '#D42A2A'} onBlur={(e) => e.target.style.borderColor = '#e8e8e8'} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Click URL</label>
              <input type="text" value={form.click_url} onChange={(e) => handleChange('click_url', e.target.value)}
                placeholder="https://advertiser-website.com" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#D42A2A'} onBlur={(e) => e.target.style.borderColor = '#e8e8e8'} />
            </div>

            <div>
              <label style={labelStyle}>Banner Image *</label>
              {imagePreview || form.image_url ? (
                <div style={{ marginBottom: 12 }}>
                  <img src={imagePreview || form.image_url} alt="Banner Preview" style={{
                    width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 200,
                  }} />
                  <button onClick={() => { setImagePreview(null); handleChange('image_url', ''); }} style={{
                    marginTop: 8, fontSize: 12, color: '#D42A2A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                  }}>✕ Remove Image</button>
                </div>
              ) : null}
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                padding: 32, border: '2px dashed #e0e0e0', borderRadius: 10, cursor: 'pointer', background: '#fafafa',
              }}>
                <span style={{ fontSize: 28 }}>📷</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#888' }}>Click to upload banner image</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
              <div style={{ marginTop: 10, fontSize: 11, color: '#aaa', textAlign: 'center' }}>Or paste image URL:</div>
              <input type="text" value={form.image_url}
                onChange={(e) => { handleChange('image_url', e.target.value); setImagePreview(null); }}
                placeholder="https://..." style={{ ...inputStyle, fontSize: 12, padding: '8px 12px', marginTop: 6 }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 16 }}>Save</h3>
            <button onClick={handleSubmit} disabled={saving} style={{
              width: '100%', padding: '12px', borderRadius: 8, fontSize: 13, fontWeight: 700,
              border: 'none', background: saving ? '#999' : '#D42A2A', color: '#fff', cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit',
              boxShadow: saving ? 'none' : '0 4px 12px rgba(212,42,42,0.25)',
            }}>{saving ? 'Saving...' : 'Create Ad'}</button>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 16 }}>Placement</h3>
            <select value={form.placement} onChange={(e) => handleChange('placement', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="top">Top Banner</option>
              <option value="middle">Middle (In-content)</option>
              <option value="sidebar">Sidebar</option>
              <option value="bottom">Bottom Banner</option>
            </select>

            {existingForPlacement.length > 0 && (
              <div style={{
                marginTop: 14, padding: 12, background: '#FFF8E1', borderRadius: 8,
                border: '1px solid #FFE082',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#F57F17', marginBottom: 6 }}>
                  ⚠️ {existingForPlacement.length} existing ad{existingForPlacement.length > 1 ? 's' : ''} in "{form.placement}"
                </div>
                <div style={{ fontSize: 11, color: '#795548', marginBottom: 8 }}>
                  {existingForPlacement.map(a => a.title).join(', ')}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: '#D84315', fontWeight: 600 }}>
                  <input type="checkbox" checked={form.replace_existing}
                    onChange={(e) => handleChange('replace_existing', e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#D42A2A' }} />
                  Replace existing ads in this placement
                </label>
                <p style={{ fontSize: 10, color: '#999', marginTop: 4, marginLeft: 24 }}>
                  Old ads will be deleted when you create this one
                </p>
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 16 }}>Schedule</h3>
            <label style={labelStyle}>Expiry Date</label>
            <input type="date" value={form.expires_at} onChange={(e) => handleChange('expires_at', e.target.value)}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#D42A2A'} onBlur={(e) => e.target.style.borderColor = '#e8e8e8'} />
            <p style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>Leave empty for no expiry</p>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 16 }}>Options</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#555' }}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => handleChange('is_active', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#D42A2A' }} />
              <span style={{ fontWeight: 600 }}>Active</span>
            </label>
            <p style={{ fontSize: 11, color: '#aaa', marginTop: 6, marginLeft: 28 }}>
              Active ads are displayed on the website
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
