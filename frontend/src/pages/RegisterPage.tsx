import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', { fullName, email, password, role });
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center align-items-center py-4">
      <div className="col-12 col-sm-9 col-md-7 col-lg-5">
        <div className="card border-0 shadow rounded-4 p-4">
          <div className="text-center mb-4">
            <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2 mb-2">
              Get Started
            </span>
            <h3 className="fw-bold mb-1">Create Account</h3>
            <p className="text-muted small mb-0">
              Join TaskFlow to track work effortlessly
            </p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small rounded-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control rounded-3"
                id="regName"
                placeholder="Aditya Garud"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <label htmlFor="regName">Full Name</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control rounded-3"
                id="regEmail"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="regEmail">Email Address</label>
            </div>

            <div className="row g-2 mb-4">
              <div className="col-12 col-sm-7">
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control rounded-3"
                    id="regPassword"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <label htmlFor="regPassword">Password (Min 6)</label>
                </div>
              </div>
              <div className="col-12 col-sm-5">
                <div className="form-floating">
                  <select
                    className="form-select rounded-3"
                    id="regRole"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <label htmlFor="regRole">Role</label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-success btn-lg w-100 rounded-3 fw-semibold fs-6 shadow-sm"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-muted small mt-4 mb-0">
            Already have an account?{' '}
            <Link to="/login" className="text-decoration-none fw-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;