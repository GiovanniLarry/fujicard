import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Debug: Log API URL being used
  useEffect(() => {
    const apiUrl = window.location.hostname === 'localhost' 
      ? `http://${window.location.hostname}:5000/api` 
      : `http://${window.location.hostname}:5000/api`;
    console.log('Login component - API URL:', apiUrl);
    console.log('Login component - Current hostname:', window.location.hostname);
  }, []);

  const redirect = searchParams.get('redirect') || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Login form submitted with data:', { email: formData.email, password: '***' });
    
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login...');
      const result = await login(formData.email, formData.password);
      console.log('Login successful, result:', result);
      navigate(redirect);
    } catch (err) {
      console.error('Login error in Login component:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Login</h1>
          <p className="auth-subtitle">Welcome back! Please sign in to continue.</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to={`/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`}>Register</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
