import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="healthcare-header">
        <div className="container">
          <div>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 6h9v2H4V6zm0 5h9v2H4v-2zm0 5h9v2H4v-2z"/>
                </svg>
                HealthAI Pro
              </h1>
            </Link>
            <p className="subtitle">Advanced Healthcare Management System</p>
          </div>
          
          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link 
              to="/" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: isActive('/') ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'background-color 0.2s'
              }}
            >
              Dashboard
            </Link>
            <Link 
              to="/analytics" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: isActive('/analytics') ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'background-color 0.2s'
              }}
            >
              Analytics
            </Link>
          </nav>
        </div>
      </header>
      
      <main>{children}</main>
    </div>
  );
};

export default Layout;