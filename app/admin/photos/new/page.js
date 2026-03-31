'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';

export default function NewGallery() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    cover_image: '',
    status: 'draft',
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    const ext = file.name.split('.').pop();
    const fileName = `galleries/covers/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('uploads').upload(fileName, file);
    if (error) { alert('Cover upload failed: ' + error.message); return; }
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    handleChange('cover_image', urlData.publicUrl);
  };

  const handlePhotosUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);

    const newPhotos = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const fileName = `galleries/photos/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error } = await supabase.storage.from('uploads').upload(fileName, file);
      if (error) { console.error('Upload failed:', error.message); continue; }
      const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
      newPhotos.push({
        url: urlData.publicUrl,
        preview: URL.createObjectURL(file),
        caption: '',
      });
    }

    setPhotos(prev => [...prev, ...newPhotos]);
    setUploading(false);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const updateCaption = (index, caption) => {
    setPhotos(prev => prev.map((p, i) => i === index ? { ...p, caption } : p));
  };

  const handleSubmit = async (status) => {
    if (!form.title.trim()) { alert('Please enter a gallery title'); return; }
    setSaving(true);

    const galleryData = { ...form, status };
    const { data: gallery, error } = await supabase.from('galleries').insert(galleryData).select().single();
    if (error) { alert('Error creating gallery: ' + error.message); setSaving(false); return; }

    if (photos.length > 0) {
      const photoRecords = photos.map((p, i) => ({
        gallery_id: gallery.id,
        image_url: p.url,
        caption: p.caption || '',
        sort_order: i,
      }));
      await supabase.from('gallery_photos').insert(photoRecords);
    }

    await supabase.from('activity_log').insert({
      action: 'created',
      entity_type: 'gallery',
      entity_title: form.title,
    });

    router.push('/admin/photos');
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
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0 }}>🖼️ New Gallery</h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Create a new photo gallery</p>
        </div>
        <a href="/admin/photos" style={{
          padding: '8px 18px', background: '#f0f0f0', borderRadius: 8,
          fontSize: 12, fontWeight: 600, color: '#555', textDecoration: 'none',
        }}>&larr; Back to Galleries</a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Gallery Details */}
          <div style={cardStyle}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Gallery Title *</label>
              <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter gallery title..." style={{ ...inputStyle, fontSize: 18, fontWeight: 600, padding: '14px 16px' }}
                onFocus={(e) => e.target.style.borderColor = '#D42A2A'} onBlur={(e) => e.target.style.borderColor = '#e8e8e8'} />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe this gallery..." rows={4}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
                onFocus={(e) => e.target.style.borderColor = '#D42A2A'} onBlur={(e) => e.target.style.borderColor = '#e8e8e8'} />
            </div>
          </div>

          {/* Photos Upload */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 16 }}>Gallery Photos</h3>

            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: 32, border: '2px dashed #e0e0e0', borderRadius: 10,
              cursor: 'pointer', background: '#fafafa', marginBottom: 16,
            }}>
              <span style={{ fontSize: 32 }}>📷</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#888' }}>
                {uploading ? 'Uploading...' : 'Click to upload photos'}
              </span>
              <span style={{ fontSize: 11, color: '#bbb' }}>You can select multiple images</span>
              <input type="file" accept="image/*" multiple onChange={handlePhotosUpload} style={{ display: 'none' }} disabled={uploading} />
            </label>

            {photos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {photos.map((photo, i) => (
                  <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                    <img src={photo.preview || photo.url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                    <button onClick={() => removePhoto(i)} style={{
                      position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer',
                      fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>&times;</button>
                    <input type="text" placeholder="Caption..." value={photo.caption}
                      onChange={(e) => updateCaption(i, e.target.value)}
                      style={{
                        width: '100%', padding: '6px 8px', border: 'none', borderTop: '1px solid #f0f0f0',
                        fontSize: 11, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                      }} />
                  </div>
                ))}
              </div>
            )}

            {photos.length === 0 && (
              <p style={{ textAlign: 'center', color: '#ccc', fontSize: 12, margin: 0 }}>No photos added yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
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
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 16 }}>Cover Image</h3>
            {coverPreview || form.cover_image ? (
              <div style={{ marginBottom: 12 }}>
                <img src={coverPreview || form.cover_image} alt="Cover" style={{ width: '100%', borderRadius: 10, objectFit: 'cover', aspectRatio: '16/10' }} />
                <button onClick={() => { setCoverPreview(null); handleChange('cover_image', ''); }} style={{
                  marginTop: 8, fontSize: 12, color: '#D42A2A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                }}>✕ Remove Cover</button>
              </div>
            ) : null}
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: 24, border: '2px dashed #e0e0e0', borderRadius: 10, cursor: 'pointer', background: '#fafafa',
            }}>
              <span style={{ fontSize: 28 }}>📷</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#888' }}>Upload cover image</span>
              <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
