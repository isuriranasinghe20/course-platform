import { useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const Recommend = () => {
  const [prompt, setPrompt] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setRecommendations([]);
    try {
      const { data } = await api.post('/gpt/recommend', { prompt });
      setRecommendations(data.recommendations || []);
      setUsage({
        totalRequestsMade: data.totalRequestsMade,
        maxRequests: data.maxRequests,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to get recommendations. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🤖 AI Course Recommendations</h1>
      <p className="muted">
        Tell us your goal — e.g. "I want to be a software engineer, what courses
        should I follow?"
      </p>

      <form onSubmit={handleSubmit} className="form-card">
        <textarea
          rows="3"
          placeholder="Describe your learning goal..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        />
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Thinking...' : 'Get Recommendations'}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {recommendations.length > 0 && (
        <>
          <h2>Recommended for You</h2>
          <div className="grid">
            {recommendations.map((c) => (
              <div className="card" key={c._id}>
                <h3>{c.title}</h3>
                <p className="muted">
                  {c.category} • {c.level}
                </p>
                <p>{c.description}</p>
                {c.reason && (
                  <p className="reason">
                    <strong>Why:</strong> {c.reason}
                  </p>
                )}
                <Link to={`/courses/${c._id}`} className="btn btn-secondary">
                  View Course
                </Link>
              </div>
            ))}
          </div>
        </>
      )}

      {usage && (
        <p className="muted small" style={{ marginTop: 20 }}>
          GPT requests used: {usage.totalRequestsMade} / {usage.maxRequests}
        </p>
      )}
    </div>
  );
};

export default Recommend;