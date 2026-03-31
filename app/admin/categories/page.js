'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    setCategories(data || []);
    setLoading(false);
  }

  function generateSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  }

  async function addCategory() {
    if (!newName.trim()) return;
    setAdding(true);

    const { error } = await supabase.from('categories').insert({
      name: newName.trim(),
      slug: generateSlug(newName.trim()),
    });

    if (error) { alert('Error adding category: ' + error.message); setAdding(false); return; }

    await supabase.from('activity_log').insert({
      action: 'created',
      entity_type: 'category',
      entity_title: newName.trim(),
    });

    setNewName('');
    setAdding(false);
    loadCategories();
  }

  async function deleteCategory(id, name) {
    if (!confirm(`Delete category "${name}"? Articles using this category will be uncategorized.`)) return;
    await supabase.from('categories').delete().eq('id', id);
    await supabase.from('activity_log').insert({ action: 'deleted', entity_type: 'category', entity_title: name });
    loadCategories();
  }

  function startEdit(cat) {
    setEditingId(cat.id);
    setEditName(cat.name);
  }

  async function saveEdit(id) {
    if (!editName.trim()) return;
    const { error } = await supabase.from('categories').update({
      name: editName.trim(),
      slug: generateSlug(editName.trim()),
    }).eq('id', id);

    if (error) { alert('Error updating category: ' + error.message); return; }

    await supabase.from('activity_log').insert({
      action: 'updated',
      entity_type: 'category',
      entity_title: editName.trim(),
    });

    setEditingId(null);
    setEditName('');
    loadCategories();
  }

  const inputStyle = {
    width: '100%', padding: '11px 16px', border: '2px solid #e8e8e8', borderRadius: 10,
    fontSize: 14, fontFamily: 'inherit', transition: 'all 0.2s', outline: 'none', boxSizing: 'border-box',
    background: '#fafafa',
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0 }}>🏷️ Categories</h1>
        <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{categories.length} categories</p>
      </div>

      {/* Add New */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: 20, marginBottom: 20,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
      }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter category name..."
            style={{ ...inputStyle, flex: 1 }}
            onFocus={(e) => e.target.style.borderColor = '#D42A2A'}
            onBlur={(e) => e.target.style.borderColor = '#e8e8e8'}
            onKeyDown={(e) => { if (e.key === 'Enter') addCategory(); }} />
          <button onClick={addCategory} disabled={adding || !newName.trim()} style={{
            padding: '11px 28px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            border: 'none', background: '#D42A2A', color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(212,42,42,0.25)', whiteSpace: 'nowrap',
            opacity: adding || !newName.trim() ? 0.5 : 1,
          }}>{adding ? 'Adding...' : '+ Add Category'}</button>
        </div>
        {newName.trim() && (
          <p style={{ fontSize: 11, color: '#aaa', marginTop: 8, marginLeft: 4 }}>
            Slug: <span style={{ fontWeight: 600, color: '#888' }}>{generateSlug(newName.trim())}</span>
          </p>
        )}
      </div>

      {/* List */}
      <div style={{
        background: '#fff', borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
      }}>
        {loading ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading...</p>
        ) : categories.length === 0 ? (
          <div style={{ padding: 50, textAlign: 'center' }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>🏷️</p>
            <p style={{ fontSize: 14, color: '#888' }}>No categories yet</p>
            <p style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>Add your first category using the form above</p>
          </div>
        ) : (
          <div>
            {categories.map((cat, idx) => (
              <div key={cat.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                borderBottom: idx < categories.length - 1 ? '1px solid #f5f5f5' : 'none',
              }}>
                {editingId === cat.id ? (
                  <>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                      style={{ ...inputStyle, flex: 1, padding: '8px 14px' }}
                      onFocus={(e) => e.target.style.borderColor = '#D42A2A'}
                      onBlur={(e) => e.target.style.borderColor = '#e8e8e8'}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                      autoFocus />
                    <button onClick={() => saveEdit(cat.id)} style={{
                      padding: '6px 16px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: '#E8F5E9', color: '#2E7D32', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{
                      padding: '6px 16px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: '#f0f0f0', color: '#888', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>{cat.name}</span>
                      <span style={{ fontSize: 11, color: '#bbb', marginLeft: 10 }}>/{cat.slug}</span>
                    </div>
                    <button onClick={() => startEdit(cat)} style={{
                      padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: '#E3F2FD', color: '#1565C0', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    }}>Edit</button>
                    <button onClick={() => deleteCategory(cat.id, cat.name)} style={{
                      padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: '#FFEBEE', color: '#C62828', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    }}>Delete</button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
