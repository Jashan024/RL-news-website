'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AdsManager() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAds(); }, []);

  async function loadAds() {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Failed to load ads:', error);
    setAds(data || []);
    setLoading(false);
  }

  async function deleteAd(ad) {
    if (!confirm(`Delete ad "${ad.title}"? This cannot be undone.`)) return;

    // Delete image from storage if it's in our uploads bucket
    if (ad.image_url && ad.image_url.includes('/storage/v1/object/public/uploads/')) {
      try {
        const path = ad.image_url.split('/storage/v1/object/public/uploads/')[1];
        if (path) {
          await supabase.storage.from('uploads').remove([path]);
        }
      } catch (e) {
        console.warn('Could not delete image from storage:', e);
      }
    }

    const { error } = await supabase.from('ads').delete().eq('id', ad.id);
    if (error) {
      alert('Failed to delete ad: ' + error.message);
      return;
    }

    await supabase.from('activity_log').insert({
      action: 'deleted', entity_type: 'ad', entity_title: ad.title,
    });

    loadAds();
  }

  async function toggleActive(id, current) {
    const { error } = await supabase.from('ads').update({ is_active: !current }).eq('id', id);
    if (error) { alert('Failed to update: ' + error.message); return; }
    loadAds();
  }

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const placementColors = {
    top: { bg: '#E3F2FD', color: '#1565C0' },
    middle: { bg: '#F3E5F5', color: '#7B1FA2' },
    sidebar: { bg: '#FFF3E0', color: '#E65100' },
    bottom: { bg: '#E8F5E9', color: '#2E7D32' },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0 }}>📢 Advertisements</h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{ads.length} total ads</p>
        </div>
        <a href="/admin/ads/new" style={{
          padding: '10px 24px', background: '#D42A2A', color: '#fff',
          borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(212,42,42,0.25)', display: 'flex', alignItems: 'center', gap: 6,
        }}>+ Add Ad</a>
      </div>

      <div style={{
        background: '#fff', borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
      }}>
        {loading ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading ads...</p>
        ) : ads.length === 0 ? (
          <div style={{ padding: 50, textAlign: 'center' }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>📢</p>
            <p style={{ fontSize: 14, color: '#888' }}>No advertisements yet</p>
            <a href="/admin/ads/new" style={{
              display: 'inline-block', marginTop: 12, padding: '8px 20px',
              background: '#D42A2A', color: '#fff', borderRadius: 8,
              fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}>+ Create First Ad</a>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Ad</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Placement</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Active</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Expiry</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map(ad => {
                const pColor = placementColors[ad.placement] || { bg: '#f0f0f0', color: '#555' };
                return (
                  <tr key={ad.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {ad.image_url && (
                          <img src={ad.image_url} alt="" style={{ width: 60, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#333', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ad.title}
                          </div>
                          {ad.click_url && (
                            <div style={{ fontSize: 11, color: '#aaa', marginTop: 2, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ad.click_url}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: pColor.bg, color: pColor.color,
                      }}>{ad.placement || '—'}</span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button onClick={() => toggleActive(ad.id, ad.is_active)} style={{
                        padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        background: ad.is_active ? '#E8F5E9' : '#f0f0f0',
                        color: ad.is_active ? '#2E7D32' : '#999',
                      }}>{ad.is_active ? 'Active' : 'Inactive'}</button>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12 }}>
                      {ad.expires_at ? (
                        <span style={{ color: isExpired(ad.expires_at) ? '#C62828' : '#999' }}>
                          {formatDate(ad.expires_at)}
                          {isExpired(ad.expires_at) && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: '#C62828' }}>EXPIRED</span>}
                        </span>
                      ) : (
                        <span style={{ color: '#ccc' }}>No expiry</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button onClick={() => deleteAd(ad)} style={{
                        padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: '#FFEBEE', color: '#C62828', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      }}>Delete</button>
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
