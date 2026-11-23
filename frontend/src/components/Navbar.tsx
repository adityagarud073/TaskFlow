import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavbarProps {
  title: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

function Navbar({ title, theme, onToggleTheme }: NavbarProps) {
  const navigate = useNavigate();
  useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark bg-gradient shadow-sm sticky-top py-2">
      <div className="container">
        <span className="navbar-brand fw-bold d-flex align-items-center gap-2 fs-5">
          <span className="badge bg-primary rounded-3 px-2 py-1">TF</span>
          <span>{title}</span>
        </span>

        <div className="d-flex align-items-center gap-2 order-md-last ms-auto ms-md-3">
          <button
            className="btn btn-sm btn-outline-light rounded-pill px-3"
            onClick={onToggleTheme}
            type="button"
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>

          {user && (
            <button
              className="navbar-toggler border-0"
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          )}
        </div>

        {user && (
          <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
            <div className="ms-auto d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2 gap-md-3 pt-3 pt-md-0">
              <div className="d-flex align-items-center gap-2 text-white small bg-secondary bg-opacity-25 px-3 py-1 rounded-pill">
                <span className="fw-semibold">{user.fullName}</span>
                <span
                  className={`badge rounded-pill ${
                    user.role === 'Admin' ? 'text-bg-warning' : 'text-bg-info'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <button
                className="btn btn-sm btn-outline-danger rounded-pill px-3"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;