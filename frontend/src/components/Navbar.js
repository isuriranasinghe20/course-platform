import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">📚 CoursePlatform</Link>
      </div>
      <div className="navbar-links">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {user?.role === 'student' && (
          <>
            <Link to="/courses">Courses</Link>
            <Link to="/my-courses">My Courses</Link>
            <Link to="/recommend">🤖 Recommend</Link>
          </>
        )}

        {user?.role === 'instructor' && (
          <>
            <Link to="/instructor">Dashboard</Link>
            <Link to="/courses">All Courses</Link>
          </>
        )}

        {user && (
          <>
            <span className="navbar-user">
              {user.username} ({user.role})
            </span>
            <button className="btn-link" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;