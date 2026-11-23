import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center align-items-center py-4 py-md-5">
      <div className="col-12 col-sm-9 col-md-6 col-lg-4">
        <div className="card border-0 shadow rounded-4 p-4">
          <div className="text-center mb-4">
            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 mb-2">
              TaskFlow Workspace
            </span>
            <h3 className="fw-bold mb-1">Welcome Back</h3>
            <p className="text-muted small mb-0">Sign in to manage your tasks</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small rounded-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control rounded-3"
                id="loginEmail"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="loginEmail">Email Address</label>
            </div>

            <div className="form-floating mb-4">
              <input
                type="password"
                className="form-control rounded-3"
                id="loginPassword"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="loginPassword">Password</label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 rounded-3 fw-semibold fs-6 shadow-sm"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-muted small mt-4 mb-0">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-decoration-none fw-semibold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;