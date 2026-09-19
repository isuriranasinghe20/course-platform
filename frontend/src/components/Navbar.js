import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, UserRound, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    window.dispatchEvent(
      new CustomEvent('course-search', { detail: value.trim().toLowerCase() })
    );
  };

  const isInstructor = user?.role === 'instructor';
  const isStudent = user?.role === 'student';

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand-wrap">
          <img
            src="/logo.png"
            alt="EduGuide logo"
            className="brand-logo"
          />
          <div className="brand-text">
            <span className="brand-name">EduGuide</span>
            <span className="brand-role">
              {user ? user.role.toUpperCase() : 'PORTAL'}
            </span>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          {isStudent && (
            <>
              <Link className="nav-link active" to="/courses">
                Dashboard
              </Link>
              <Link className="nav-link" to="/my-courses">
                My Courses
              </Link>
              <Link className="nav-link" to="/recommend">
                Recommendations
              </Link>
            </>
          )}

          {isInstructor && (
            <>
              <Link className="nav-link active" to="/instructor">
                Dashboard
              </Link>
              <Link className="nav-link" to="/courses">
                My Courses
              </Link>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              {isInstructor && (
                <div className="nav-search">
                  <Search size={14} />
                  <input
                    type="text"
                    value={searchText}
                    onChange={handleSearchChange}
                    placeholder="Search courses..."
                    aria-label="Search courses"
                  />
                </div>
              )}
              <button className="icon-btn" type="button" aria-label="Notifications">
                <Bell size={15} />
              </button>
              {isInstructor && (
                <button
                  type="button"
                  className="new-course-btn"
                  onClick={() => {
                    const formSection = document.querySelector('.form-panel');
                    if (formSection) {
                      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    window.dispatchEvent(new CustomEvent('new-course-request'));
                  }}
                >
                  <Plus size={15} />
                  New Course
                </button>
              )}
              <button
                className="avatar-btn"
                type="button"
                aria-label="Profile and logout"
                title={user.username}
                onClick={handleLogout}
              >
                <UserRound size={15} />
                <span>{user.username}</span>
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <Link className="nav-login-btn" to="/login">
                Login
              </Link>
              <Link className="nav-register-btn" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;