'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin');
      } else {
        setError('Invalid username or password');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A237E 0%, #D42A2A 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: "'Poppins', sans-serif",
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/images/logo.jpeg"
            alt="RL Logo"
            style={{ width: 72, height: 72, margin: '0 auto 12px', display: 'block', objectFit: 'contain' }}
          />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0, lineHeight: 1.2 }}>
            Report Ludhiana Newspaper
          </h1>
          <p style={{ fontSize: 12, color: '#888', marginTop: 4, fontFamily: "'Noto Sans Gurmukhi', sans-serif" }}>
            ਹਰ ਕਦਮ ਤੁਹਾਡੇ ਨਾਲ
          </p>
          <div style={{
            marginTop: 16,
            padding: '6px 16px',
            background: '#f5f5f5',
            borderRadius: 20,
            display: 'inline-block',
            fontSize: 12,
            fontWeight: 600,
            color: '#555',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}>
            Admin Panel
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: 10,
                fontSize: 14,
                fontFamily: 'inherit',
                transition: 'all 0.2s',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#D42A2A'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: 10,
                fontSize: 14,
                fontFamily: 'inherit',
                transition: 'all 0.2s',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#D42A2A'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: '#FEE',
              border: '1px solid #FCC',
              borderRadius: 8,
              color: '#C00',
              fontSize: 13,
              marginBottom: 16,
              textAlign: 'center',
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: loading ? '#999' : 'linear-gradient(135deg, #D42A2A, #B71C1C)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(212,42,42,0.3)',
            }}
          >
            {loading ? 'Logging in...' : 'Login to Admin Panel'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 24 }}>
          &copy; 2026 Report Ludhiana Newspaper
        </p>
      </div>
    </div>
  );
}
