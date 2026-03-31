'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function PhotoGalleriesManager() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadGalleries(); }, []);

  async function loadGalleries() {
    const { data } = await supabase
      .from('galleries')
      .select('*, gallery_photos(id)')
      .order('created_at', { ascending: false });
    setGalleries(data || []);
    setLoading(false);
  }

  async function deleteGallery(id, title) {
    if (!confirm(`Delete gallery "${title}" and all its photos?`)) return;
    await supabase.from('gallery_photos').delete().eq('gallery_id', id);
    await supabase.from('galleries').delete().eq('id', id);
    await supabase.from('activity_log').insert({ action: 'deleted', entity_type: 'gallery', entity_title: title });
    loadGalleries();
  }

  async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    await supabase.from('galleries').update({ status: newStatus }).eq('id', id);
    loadGalleries();
  }

  const timeAgo = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0 }}>🖼️ Photo Galleries</h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{galleries.length} total galleries</p>
        </div>
        <a href="/admin/photos/new" style={{
          padding: '10px 24px', background: '#D42A2A', color: '#fff',
          borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(212,42,42,0.25)', display: 'flex', alignItems: 'center', gap: 6,
        }}>+ New Gallery</a>
      </div>

      <div style={{
        background: '#fff', borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
      }}>
        {loading ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading galleries...</p>
        ) : galleries.length === 0 ? (
          <div style={{ padding: 50, textAlign: 'center' }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>🖼️</p>
            <p style={{ fontSize: 14, color: '#888' }}>No photo galleries yet</p>
            <a href="/admin/photos/new" style={{
              display: 'inline-block', marginTop: 12, padding: '8px 20px',
              background: '#D42A2A', color: '#fff', borderRadius: 8,
              fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}>+ Create First Gallery</a>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Gallery</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Photos</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {galleries.map(gal => (
                <tr key={gal.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {gal.cover_image && (
                        <img src={gal.cover_image} alt="" style={{ width: 50, height: 35, borderRadius: 6, objectFit: 'cover' }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: '#333', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {gal.title}
                        </div>
                        {gal.description && (
                          <div style={{ fontSize: 11, color: '#aaa', marginTop: 2, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {gal.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{
                      padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: '#F3E5F5', color: '#7B1FA2',
                    }}>{gal.gallery_photos?.length || 0}</span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button onClick={() => toggleStatus(gal.id, gal.status)} style={{
                      padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      background: gal.status === 'published' ? '#E8F5E9' : '#FFF3E0',
                      color: gal.status === 'published' ? '#2E7D32' : '#E65100',
                    }}>{gal.status || 'draft'}</button>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#999', fontSize: 12 }}>{timeAgo(gal.created_at)}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <a href={`/admin/photos/edit?id=${gal.id}`} style={{
                        padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: '#E3F2FD', color: '#1565C0', textDecoration: 'none',
                      }}>Edit</a>
                      <button onClick={() => deleteGallery(gal.id, gal.title)} style={{
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
