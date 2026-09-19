import { useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { BrainCircuit, Sparkles, Target } from 'lucide-react';

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
    <div className="recommend-page">
      <div className="recommend-shell">
        <div className="recommend-breadcrumbs">
          Academic Portal <span>›</span> Student Hub <span>›</span> AI Recommendations
        </div>

        <div className="recommend-header-row">
          <div>
            <div className="recommend-kicker">
              <Sparkles size={12} /> GPT-4 &amp; AI-powered
            </div>
            <h1>AI Course Recommendations</h1>
            <p>
              Tell us your goal — e.g. “I want to become a software engineer, what
              courses should I follow?”
            </p>
          </div>

          <div className="recommend-badge">
            <span className="mini-pill">AI Model</span>
            <strong>EduGuide Core v4.2</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="recommend-form-card">
          <div className="form-header-row">
            <div className="form-title-group">
              <Target size={16} />
              <span>Career Goal &amp; Learning Aspirations</span>
            </div>
            <button type="button" className="link-btn" onClick={() => setPrompt('')}>
              Clear
            </button>
          </div>

          <textarea
            rows="4"
            placeholder="Describe your current skills, preferred stack, and learning goals..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
            
          />

          <div className="recommend-fields-row">
            <div className="mini-field">
              <label>Timeline</label>
              <select defaultValue="6Months">
                <option value="6Months">6 Months</option>
                <option value="12Months">12 Months</option>
              </select>
            </div>
            <div className="mini-field">
              <label>Weekly capacity</label>
              <select defaultValue="10-20">
                <option value="10-20">10–20 Hours</option>
                <option value="20-30">20–30 Hours</option>
              </select>
            </div>
            <div className="mini-field">
              <label>Current level</label>
              <select defaultValue="Intermediate">
                <option value="Intermediate">Intermediate</option>
                <option value="Beginner">Beginner</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="recommend-actions">
            <button className="primary-recommend-btn" disabled={loading}>
              {loading ? 'Thinking...' : 'Generate Pathway'}
            </button>
          </div>
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        {recommendations.length > 0 && (
          <section className="recommend-results">
            <div className="results-header-row">
              <h2>Personalized Pathway: Fullstack Mobile &amp; Distributed Systems Engineer</h2>
              <div className="score-box">
                <span>98.5%</span>
                <small>AI Match</small>
              </div>
            </div>

            <div className="recommend-result-grid">
              {recommendations.map((course) => (
                <article key={course._id} className="recommended-card">
                  <div className="card-visual">
                    <span className="course-tag">{course.category || 'Course'}</span>
                    <strong>{course.title}</strong>
                  </div>

                  <div className="card-body">
                    <div className="mini-meta-line">
                      <span>{course.level || 'Intermediate'}</span>
                      <span>{course.category || 'General'}</span>
                    </div>

                    <p>{course.description}</p>

                    <div className="card-footer-row">
                      <Link to={`/courses/${course._id}`} className="detail-link">
                        View details
                      </Link>
                      <button type="button" className="outline-btn">
                        Enroll
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {usage && (
          <div className="usage-row">
            <BrainCircuit size={14} />
            <span>
              GPT requests used: {usage.totalRequestsMade} / {usage.maxRequests}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommend;