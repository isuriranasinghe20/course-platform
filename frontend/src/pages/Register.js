import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form.username, form.password, form.role);
      navigate(user.role === 'instructor' ? '/instructor' : '/courses');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel-card auth-panel-card-compact">
        <h2>Create Account</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-role-group">
            <label className={`auth-role-option ${form.role === 'student' ? 'active' : ''}`}>
              <input
                type="radio"
                value="student"
                checked={form.role === 'student'}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
              <span>Student</span>
            </label>
            <label className={`auth-role-option ${form.role === 'instructor' ? 'active' : ''}`}>
              <input
                type="radio"
                value="instructor"
                checked={form.role === 'instructor'}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
              <span>Instructor</span>
            </label>
          </div>

          <input
            className="auth-input"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />

          <div className="password-wrap">
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <span className="password-eye">◌</span>
          </div>

          <button className="auth-submit-btn" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'REGISTER'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;