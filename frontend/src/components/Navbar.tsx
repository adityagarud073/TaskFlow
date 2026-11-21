import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  title: string;
}

function Navbar({ title }: NavbarProps) {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-4">
      <span className="navbar-brand fw-bold">{title}</span>
      {user && (
        <div className="d-flex align-items-center gap-3 text-white">
          <span>
            {user.fullName}{' '}
            <span className="badge bg-info text-dark">{user.role}</span>
          </span>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;