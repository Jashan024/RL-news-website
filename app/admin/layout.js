'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const menuItems = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'News Articles', href: '/admin/news', icon: '📰' },
  { label: 'Videos', href: '/admin/videos', icon: '🎥' },
  { label: 'Photo Gallery', href: '/admin/photos', icon: '📸' },
  { label: 'Ads Manager', href: '/admin/ads', icon: '📢' },
  { label: 'Breaking News', href: '/admin/breaking', icon: '⚡' },
  { label: 'Categories', href: '/admin/categories', icon: '📂' },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setChecking(false);
      setAuthenticated(true); // login page doesn't need auth
      return;
    }
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/admin/login');
        } else {
          setAuthenticated(true);
        }
        setChecking(false);
      })
      .catch(() => {
        router.push('/admin/login');
        setChecking(false);
      });
  }, [pathname, router]);

  // Login page renders without admin chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Poppins', sans-serif", background: '#f5f5f5',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, border: '4px solid #e0e0e0', borderTopColor: '#D42A2A',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: '#888', fontSize: 14 }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Poppins', sans-serif", background: '#f0f2f5' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 260 : 70,
        background: '#1A237E',
        color: '#fff',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: sidebarOpen ? '20px 20px 16px' : '20px 10px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minHeight: 72,
        }}>
          <img src="/images/logo.jpeg" alt="RL" style={{
            width: 38, height: 38, borderRadius: 8, objectFit: 'contain', background: '#fff', padding: 2, flexShrink: 0,
          }} />
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap' }}>Report Ludhiana</div>
              <div style={{ fontSize: 10, opacity: 0.6, whiteSpace: 'nowrap' }}>Admin Panel</div>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {menuItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: sidebarOpen ? '11px 16px' : '11px 0',
                  borderRadius: 10,
                  marginBottom: 4,
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {sidebarOpen && item.label}
              </a>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <a href="/" target="_blank" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: sidebarOpen ? '10px 16px' : '10px 0',
            borderRadius: 10, fontSize: 13, color: 'rgba(255,255,255,0.7)',
            textDecoration: 'none', justifyContent: sidebarOpen ? 'flex-start' : 'center',
            whiteSpace: 'nowrap',
          }}>
            <span style={{ fontSize: 18 }}>🌐</span>
            {sidebarOpen && 'View Website'}
          </a>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            padding: sidebarOpen ? '10px 16px' : '10px 0',
            borderRadius: 10, fontSize: 13, color: '#FF8A80',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            whiteSpace: 'nowrap',
          }}>
            <span style={{ fontSize: 18 }}>🚪</span>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <header style={{
          background: '#fff',
          padding: '0 28px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e8e8e8',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 20,
              padding: '6px 10px', borderRadius: 8, color: '#555',
            }}
          >
            ☰
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #D42A2A, #1A237E)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 13, fontWeight: 700,
            }}>A</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>Admin</div>
              <div style={{ fontSize: 10, color: '#999' }}>Report Ludhiana Newspaper</div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: 28 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
