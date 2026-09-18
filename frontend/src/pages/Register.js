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
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <label className="radio-group">
          <span>I am a:</span>
          <label>
            <input
              type="radio"
              value="student"
              checked={form.role === 'student'}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
            Student
          </label>
          <label>
            <input
              type="radio"
              value="instructor"
              checked={form.role === 'instructor'}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
            Instructor
          </label>
        </label>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Register'}
        </button>
        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;