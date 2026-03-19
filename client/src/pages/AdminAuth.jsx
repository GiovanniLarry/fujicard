import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

const AdminAuth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Connects to the backend admin-login endpoint we are about to create
      const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;
      const response = await axios.post(`${API_URL}/auth/admin-login`, {
        username,
        password
      });

      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        navigate('/secret-fuji-admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-card glass-panel">
        <div className="admin-auth-header">
          <h1 className="admin-title">Classified Access</h1>
          <p className="admin-subtitle">Fuji Card Market System</p>
        </div>

        {error && <div className="admin-alert error">{error}</div>}

        <form onSubmit={handleLogin} className="admin-form">
          <div className="form-group-admin">
            <label>Admin ID</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your administrative ID"
              required 
            />
          </div>
          
          <div className="form-group-admin">
            <label>Passcode</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="admin-btn-primary"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Initialize Override'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuth;
