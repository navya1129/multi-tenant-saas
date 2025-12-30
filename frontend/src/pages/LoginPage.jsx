import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subdomain, setSubdomain] = useState('demo');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tenantRequired, setTenantRequired] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTenantRequired(false);
    setLoading(true);
    try {
      const subdomainToUse = subdomain || undefined;
      await login(email, password, subdomainToUse);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      if (err.code === 'TENANT_REQUIRED' || errorMsg.includes('tenant subdomain')) {
        setTenantRequired(true);
        setError('This email is associated with a specific tenant. Please enter the tenant subdomain above.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={shell}>
      <div style={authCard}>
        <h2 style={title}>Welcome Back 👋</h2>

        {error && (
          <div style={alertError} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formGrid}>
          <div style={formGroup}>
            <label style={label}>Email</label>
            <input
              style={input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={formGroup}>
            <label style={label}>Password</label>
            <input
              style={input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={formGroup}>
            <label style={label}>
              Tenant Subdomain {tenantRequired && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <input
              style={input}
              type="text"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              placeholder="e.g. demo, acme"
            />
            {tenantRequired && (
              <small style={{ color: '#6b7280', marginTop: 4 }}>
                Required for this email
              </small>
            )}
          </div>

          <button type="submit" disabled={loading} style={btnPrimary}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={linkMuted}>
          <a href="/register" style={link}>
            Don’t have an account? Register
          </a>
        </p>

        {/* Demo Credentials */}
        <div style={demoCard}>
          <h4 style={{ marginTop: 0, marginBottom: 8, color: '#1e3a8a' }}>
            Demo Credentials
          </h4>
          <p style={demoText}>
            <strong>Super Admin:</strong> superadmin@system.com / Admin@123
          </p>
          <p style={demoText}>
            <strong>Tenant Admin:</strong> admin@demo.com / Demo@123 (demo)
          </p>
          <p style={demoText}>
            <strong>User:</strong> user1@demo.com / User@123 (demo)
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const shell = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #eef2ff, #f8fafc)',
  padding: 16
};

const authCard = {
  width: '100%',
  maxWidth: 420,
  background: '#ffffff',
  padding: 28,
  borderRadius: 20,
  boxShadow: '0 20px 45px rgba(0,0,0,0.08)',
  border: '1px solid #e5e7eb'
};

const title = {
  textAlign: 'center',
  marginBottom: 20,
  color: '#3730a3',
  fontWeight: 800
};

const formGrid = {
  display: 'grid',
  gap: 16
};

const formGroup = {
  display: 'flex',
  flexDirection: 'column'
};

const label = {
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 6,
  color: '#1f2937'
};

const input = {
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: 14,
  outline: 'none'
};

const btnPrimary = {
  marginTop: 10,
  padding: '12px',
  borderRadius: 12,
  border: 'none',
  background: 'linear-gradient(90deg, #4f46e5, #6366f1)',
  color: '#ffffff',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 15
};

const alertError = {
  background: '#fee2e2',
  color: '#991b1b',
  padding: 12,
  borderRadius: 10,
  marginBottom: 14,
  fontWeight: 600
};

const linkMuted = {
  marginTop: 14,
  textAlign: 'center',
  fontSize: 14,
  color: '#6b7280'
};

const link = {
  color: '#4f46e5',
  fontWeight: 600,
  textDecoration: 'none'
};

const demoCard = {
  marginTop: 20,
  padding: 16,
  borderRadius: 14,
  background: '#eef2ff',
  border: '1px solid #c7d2fe'
};

const demoText = {
  margin: '4px 0',
  fontSize: 13,
  color: '#1f2937'
};
