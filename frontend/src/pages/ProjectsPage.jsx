import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export function ProjectsPage() {
  const { user, token, logout, loading: authLoading, selectedTenantId } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      const effectiveTenantId = user?.tenantId || selectedTenantId;
      if (token && user && effectiveTenantId) {
        fetchProjects();
      } else if (!token) {
        setLoading(false);
        setError('Not authenticated');
      } else if (token && user && !effectiveTenantId) {
        setLoading(false);
        setError('Please select a tenant to manage projects (Dashboard > Select Tenant)');
      }
    }
  }, [authLoading, token, user, selectedTenantId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const effectiveTenantId = user?.tenantId || selectedTenantId;
      const response = await apiService.listProjects(token, effectiveTenantId);
      const projectsList = Array.isArray(response) ? response : (response.projects || []);
      setProjects(projectsList);
    } catch (err) {
      setError('Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      const effectiveTenantId = user?.tenantId || selectedTenantId;
      await apiService.createProject(token, formData.name, formData.description, 'active', effectiveTenantId);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      setSubmitError(err.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await apiService.deleteProject(token, projectId);
      fetchProjects();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const handleUpdateStatus = async (projectId, status) => {
    try {
      const proj = projects.find((p) => p.id === projectId);
      await apiService.updateProject(token, projectId, proj.name, proj.description, status);
      fetchProjects();
    } catch (err) {
      alert('Failed to update project');
    }
  };

  return (
    <div style={page}>
      {/* Topbar */}
      <nav style={topbar}>
        <h1>{user?.role === 'super_admin' ? 'View Projects' : 'Projects'}</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} style={btnSecondary}>Dashboard</button>
          <button onClick={() => { logout(); navigate('/login'); }} style={btnSecondary}>Logout</button>
        </div>
      </nav>

      {user?.role === 'super_admin' && (
        <div style={infoAlert}>
          📊 Read-only view — Super Admin cannot modify projects
        </div>
      )}

      {user?.role !== 'super_admin' && showForm && (
        <form onSubmit={handleCreateProject} style={card}>
          {submitError && <div style={errorAlert}>{submitError}</div>}

          <div style={formGroup}>
            <label style={label}>Project Name</label>
            <input
              style={input}
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={formGroup}>
            <label style={label}>Description</label>
            <textarea
              style={{ ...input, minHeight: 80 }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" style={btnPrimary}>Create</button>
            <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>Cancel</button>
          </div>
        </form>
      )}

      {!showForm && user?.role !== 'super_admin' && (
        <button onClick={() => setShowForm(true)} style={{ ...btnPrimary, marginBottom: 20 }}>
          + Create Project
        </button>
      )}

      {error && <div style={errorAlert}>{error}</div>}

      {loading ? <p>Loading...</p> : (
        <div style={grid}>
          {projects.map((proj) => (
            <div key={proj.id} style={card}>
              <h3 style={{ marginTop: 0 }}>{proj.name}</h3>
              <p style={{ minHeight: 40 }}>{proj.description}</p>

              <p>
                <strong>Status:</strong>{' '}
                <span style={badge}>{proj.status}</span>
              </p>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                <button onClick={() => navigate(`/tasks?projectId=${proj.id}`)} style={btnPrimary}>
                  View Tasks
                </button>

                {user?.role !== 'super_admin' && (
                  <>
                    <select
                      value={proj.status}
                      onChange={(e) => handleUpdateStatus(proj.id, e.target.value)}
                      style={input}
                    >
                      <option>active</option>
                      <option>archived</option>
                    </select>

                    <button onClick={() => handleDeleteProject(proj.id)} style={btnDanger}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const page = {
  minHeight: '100vh',
  padding: 24,
  background: 'linear-gradient(135deg, #f8fafc, #eef2ff)'
};

const topbar = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'linear-gradient(90deg, #4f46e5, #6366f1)',
  padding: '16px 24px',
  borderRadius: 16,
  color: '#fff',
  marginBottom: 24,
  boxShadow: '0 10px 25px rgba(79,70,229,.3)'
};

const card = {
  background: '#ffffff',
  padding: 20,
  borderRadius: 16,
  border: '1px solid #e5e7eb',
  boxShadow: '0 12px 30px rgba(0,0,0,.06)'
};

const grid = {
  display: 'grid',
  gap: 20,
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
};

const formGroup = { marginBottom: 12 };

const label = { fontWeight: 600, marginBottom: 6, display: 'block' };

const input = {
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: 14
};

const btnPrimary = {
  padding: '10px 18px',
  borderRadius: 10,
  border: 'none',
  background: 'linear-gradient(90deg, #4f46e5, #6366f1)',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer'
};

const btnSecondary = {
  ...btnPrimary,
  background: '#e0e7ff',
  color: '#3730a3',
  marginRight: 10
};

const btnDanger = {
  padding: '10px 16px',
  borderRadius: 10,
  border: 'none',
  background: '#fee2e2',
  color: '#991b1b',
  fontWeight: 600,
  cursor: 'pointer'
};

const badge = {
  padding: '4px 10px',
  borderRadius: 999,
  background: '#e0e7ff',
  color: '#3730a3',
  fontSize: 12,
  fontWeight: 600
};

const errorAlert = {
  background: '#fee2e2',
  color: '#991b1b',
  padding: 14,
  borderRadius: 12,
  marginBottom: 16,
  fontWeight: 600
};

const infoAlert = {
  background: '#ecfeff',
  color: '#0369a1',
  border: '1px solid #bae6fd',
  padding: 14,
  borderRadius: 12,
  marginBottom: 20,
  fontWeight: 600
};
