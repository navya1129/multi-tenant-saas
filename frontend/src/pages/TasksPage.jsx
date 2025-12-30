import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export function TasksPage() {
  const { user, token, logout, loading: authLoading, selectedTenantId } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId,
    priority: 'medium',
    status: 'todo'
  });
  const [submitError, setSubmitError] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  const [hasUserSelectedProject, setHasUserSelectedProject] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      const effectiveTenantId = user?.tenantId || selectedTenantId;
      if (token && user && effectiveTenantId) {
        fetchData();
      } else if (!token) {
        setLoading(false);
        setError('Not authenticated');
      } else if (token && user && !effectiveTenantId) {
        setLoading(false);
        setError('Please select a tenant to manage tasks');
      }
    }
  }, [authLoading, token, user, selectedTenantId, selectedProjectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const effectiveTenantId = user?.tenantId || selectedTenantId;

      const projectsList = await apiService.listProjects(token, effectiveTenantId);
      const projectsData = Array.isArray(projectsList)
        ? projectsList
        : (projectsList.projects || []);
      setProjects(projectsData);

      let projectToLoad = selectedProjectId;
      if (!projectToLoad && projectsData.length > 0 && user?.role === 'super_admin' && !hasUserSelectedProject) {
        projectToLoad = projectsData[0].id;
        setSelectedProjectId(projectToLoad);
        setHasUserSelectedProject(true);
      }

      if (projectToLoad) {
        const tasksList = await apiService.listTasks(token, projectToLoad);
        const tasksData = Array.isArray(tasksList) ? tasksList : (tasksList.tasks || []);
        setTasks(tasksData);
      } else {
        const allTasks = [];
        for (const p of projectsData) {
          try {
            const tasksList = await apiService.listTasks(token, p.id);
            const tasksData = Array.isArray(tasksList) ? tasksList : (tasksList.tasks || []);
            allTasks.push(...tasksData);
          } catch {}
        }
        allTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTasks(allTasks);
      }
    } catch (err) {
      setError('Failed to load data');
      setTasks([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      if (!formData.projectId) {
        setSubmitError('Please select a project');
        return;
      }
      await apiService.createTask(
        token,
        formData.title,
        formData.description,
        formData.projectId,
        formData.priority,
        formData.status
      );
      setFormData({
        title: '',
        description: '',
        projectId: selectedProjectId,
        priority: 'medium',
        status: 'todo'
      });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setSubmitError(err.message || 'Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await apiService.deleteTask(token, taskId);
      fetchData();
    } catch {
      alert('Failed to delete task');
    }
  };

  const handleUpdateStatus = async (taskId, status) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      await apiService.updateTask(
        token,
        taskId,
        task.title,
        task.description,
        status,
        task.priority
      );
      fetchData();
    } catch {
      alert('Failed to update task');
    }
  };

  return (
    <div style={page}>
      {/* Topbar */}
      <nav style={topbar}>
        <h1>{user?.role === 'super_admin' ? 'View Tasks' : 'Tasks'}</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} style={btnSecondary}>Dashboard</button>
          <button onClick={() => { logout(); navigate('/login'); }} style={btnSecondary}>Logout</button>
        </div>
      </nav>

      {/* Filter */}
      <div style={filterCard}>
        <label style={{ fontWeight: 700 }}>Filter by Project</label>
        <select
          style={input}
          value={selectedProjectId}
          onChange={(e) => {
            setSelectedProjectId(e.target.value);
            setHasUserSelectedProject(true);
          }}
        >
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {user?.role === 'super_admin' && (
        <div style={infoAlert}>
          📊 Read-only view — Super Admin cannot modify tasks
        </div>
      )}

      {!showForm && user?.role !== 'super_admin' && (
        <button onClick={() => setShowForm(true)} style={{ ...btnPrimary, marginBottom: 20 }}>
          + Create Task
        </button>
      )}

      {user?.role !== 'super_admin' && showForm && (
        <form onSubmit={handleCreateTask} style={card}>
          {submitError && <div style={errorAlert}>{submitError}</div>}

          <div style={formGroup}>
            <label style={label}>Project</label>
            <select
              style={input}
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            >
              <option value="">Select project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div style={formGroup}>
            <label style={label}>Title</label>
            <input
              style={input}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div style={formGroup}>
            <label style={label}>Description</label>
            <textarea
              style={{ ...input, minHeight: 70 }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={twoCol}>
            <div>
              <label style={label}>Priority</label>
              <select
                style={input}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option>low</option>
                <option>medium</option>
                <option>high</option>
              </select>
            </div>
            <div>
              <label style={label}>Status</label>
              <select
                style={input}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option>todo</option>
                <option>in_progress</option>
                <option>completed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="submit" style={btnPrimary}>Create</button>
            <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>Cancel</button>
          </div>
        </form>
      )}

      {error && <div style={errorAlert}>{error}</div>}

      {loading ? <p>Loading...</p> : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Priority</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{projects.find(p => p.id === task.projectId)?.name || 'N/A'}</td>
                  <td><span style={badge}>{task.priority}</span></td>
                  <td>
                    {user?.role !== 'super_admin' ? (
                      <select
                        style={input}
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                      >
                        <option>todo</option>
                        <option>in_progress</option>
                        <option>completed</option>
                      </select>
                    ) : (
                      <span style={badge}>{task.status}</span>
                    )}
                  </td>
                  <td>
                    {user?.role !== 'super_admin' && (
                      <button onClick={() => handleDeleteTask(task.id)} style={btnDanger}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const page = {
  minHeight: '100vh',
  padding: 24,
  background: 'linear-gradient(135deg,#f8fafc,#eef2ff)'
};

const topbar = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  background: 'linear-gradient(90deg,#4f46e5,#6366f1)',
  color: '#fff',
  borderRadius: 16,
  marginBottom: 24
};

const card = {
  background: '#fff',
  padding: 20,
  borderRadius: 16,
  border: '1px solid #e5e7eb',
  boxShadow: '0 12px 30px rgba(0,0,0,.06)',
  marginBottom: 20
};

const filterCard = {
  ...card,
  display: 'flex',
  gap: 12,
  alignItems: 'center'
};

const formGroup = { marginBottom: 12 };
const twoCol = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };

const label = { fontWeight: 600, marginBottom: 6, display: 'block' };

const input = {
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #d1d5db'
};

const btnPrimary = {
  padding: '10px 18px',
  borderRadius: 10,
  border: 'none',
  background: 'linear-gradient(90deg,#4f46e5,#6366f1)',
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
  padding: '8px 14px',
  borderRadius: 10,
  border: 'none',
  background: '#fee2e2',
  color: '#991b1b',
  fontWeight: 600
};

const badge = {
  padding: '4px 10px',
  borderRadius: 999,
  background: '#e0e7ff',
  color: '#3730a3',
  fontWeight: 600,
  fontSize: 12
};

const tableWrap = {
  overflowX: 'auto',
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 12px 30px rgba(0,0,0,.06)'
};

const table = {
  width: '100%',
  borderCollapse: 'collapse'
};

const errorAlert = {
  background: '#fee2e2',
  color: '#991b1b',
  padding: 14,
  borderRadius: 12,
  marginBottom: 16
};

const infoAlert = {
  background: '#ecfeff',
  color: '#0369a1',
  border: '1px solid #bae6fd',
  padding: 14,
  borderRadius: 12,
  marginBottom: 16
};
