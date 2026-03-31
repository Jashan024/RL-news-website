'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function BreakingNewsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHeadline, setNewHeadline] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    const { data } = await supabase
      .from('breaking_news')
      .select('*')
      .order('sort_order', { ascending: true });
    setItems(data || []);
    setLoading(false);
  }

  async function addHeadline() {
    if (!newHeadline.trim()) return;
    setAdding(true);
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order || 0)) + 1 : 0;

    const { error } = await supabase.from('breaking_news').insert({
      headline: newHeadline.trim(),
      is_active: true,
      sort_order: maxOrder,
    });

    if (error) { alert('Error adding headline: ' + error.message); setAdding(false); return; }

    await supabase.from('activity_log').insert({
      action: 'created',
      entity_type: 'breaking_news',
      entity_title: newHeadline.trim(),
    });

    setNewHeadline('');
    setAdding(false);
    loadItems();
  }

  async function deleteItem(id, headline) {
    if (!confirm(`Delete breaking news: "${headline}"?`)) return;
    await supabase.from('breaking_news').delete().eq('id', id);
    await supabase.from('activity_log').insert({ action: 'deleted', entity_type: 'breaking_news', entity_title: headline });
    loadItems();
  }

  async function toggleActive(id, current) {
    await supabase.from('breaking_news').update({ is_active: !current }).eq('id', id);
    loadItems();
  }

  async function moveItem(id, direction) {
    const idx = items.findIndex(i => i.id === id);
    if (direction === 'up' && idx <= 0) return;
    if (direction === 'down' && idx >= items.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const currentOrder = items[idx].sort_order;
    const swapOrder = items[swapIdx].sort_order;

    await supabase.from('breaking_news').update({ sort_order: swapOrder }).eq('id', items[idx].id);
    await supabase.from('breaking_news').update({ sort_order: currentOrder }).eq('id', items[swapIdx].id);
    loadItems();
  }

  const inputStyle = {
    width: '100%', padding: '11px 16px', border: '2px solid #e8e8e8', borderRadius: 10,
    fontSize: 14, fontFamily: 'inherit', transition: 'all 0.2s', outline: 'none', boxSizing: 'border-box',
    background: '#fafafa',
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0 }}>🔴 Breaking News</h1>
        <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{items.length} headlines &middot; Drag to reorder</p>
      </div>

      {/* Add New */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: 20, marginBottom: 20,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
      }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <input type="text" value={newHeadline} onChange={(e) => setNewHeadline(e.target.value)}
            placeholder="Enter breaking news headline..."
            style={{ ...inputStyle, flex: 1 }}
            onFocus={(e) => e.target.style.borderColor = '#D42A2A'}
            onBlur={(e) => e.target.style.borderColor = '#e8e8e8'}
            onKeyDown={(e) => { if (e.key === 'Enter') addHeadline(); }} />
          <button onClick={addHeadline} disabled={adding || !newHeadline.trim()} style={{
            padding: '11px 28px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            border: 'none', background: '#D42A2A', color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(212,42,42,0.25)', whiteSpace: 'nowrap',
            opacity: adding || !newHeadline.trim() ? 0.5 : 1,
          }}>{adding ? 'Adding...' : '+ Add Headline'}</button>
        </div>
      </div>

      {/* List */}
      <div style={{
        background: '#fff', borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
      }}>
        {loading ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading...</p>
        ) : items.length === 0 ? (
          <div style={{ padding: 50, textAlign: 'center' }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>🔴</p>
            <p style={{ fontSize: 14, color: '#888' }}>No breaking news headlines</p>
            <p style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>Add your first headline using the form above</p>
          </div>
        ) : (
          <div>
            {items.map((item, idx) => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
                borderBottom: idx < items.length - 1 ? '1px solid #f5f5f5' : 'none',
                background: item.is_active ? '#fff' : '#fafafa',
              }}>
                {/* Reorder Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <button onClick={() => moveItem(item.id, 'up')} disabled={idx === 0} style={{
                    width: 24, height: 20, borderRadius: 4, border: '1px solid #e0e0e0',
                    background: '#fafafa', cursor: idx === 0 ? 'default' : 'pointer', fontSize: 10,
                    color: idx === 0 ? '#ddd' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>&uarr;</button>
                  <button onClick={() => moveItem(item.id, 'down')} disabled={idx === items.length - 1} style={{
                    width: 24, height: 20, borderRadius: 4, border: '1px solid #e0e0e0',
                    background: '#fafafa', cursor: idx === items.length - 1 ? 'default' : 'pointer', fontSize: 10,
                    color: idx === items.length - 1 ? '#ddd' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>&darr;</button>
                </div>

                {/* Order Number */}
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', background: '#f0f0f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#888', flexShrink: 0,
                }}>{idx + 1}</span>

                {/* Headline */}
                <div style={{
                  flex: 1, fontSize: 14, fontWeight: 600,
                  color: item.is_active ? '#333' : '#bbb',
                  textDecoration: item.is_active ? 'none' : 'line-through',
                }}>{item.headline}</div>

                {/* Active Toggle */}
                <button onClick={() => toggleActive(item.id, item.is_active)} style={{
                  padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: item.is_active ? '#E8F5E9' : '#f0f0f0',
                  color: item.is_active ? '#2E7D32' : '#999',
                }}>{item.is_active ? 'Active' : 'Inactive'}</button>

                {/* Delete */}
                <button onClick={() => deleteItem(item.id, item.headline)} style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: '#FFEBEE', color: '#C62828', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
