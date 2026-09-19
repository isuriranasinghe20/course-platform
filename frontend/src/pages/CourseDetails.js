import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpenText,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Star,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const defaultModules = [
  'Environment setup and Expo CLI introduction',
  'Component architecture & Responsive layouts',
  'State management with Redux Toolkit & local persistence',
  'GPT-3 AI recommendation integration',
  'Navigation stacks & dynamic routing',
  'Authentication and deployment checklist',
];

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data);

        if (user?.role === 'student') {
          const { data: enrollments } = await api.get('/enrollments/my');
          const enrolled = enrollments.some(
            (entry) => entry.course?._id === id || entry.course === id
          );
          setAlreadyEnrolled(enrolled);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, user?.role]);

  const handleEnroll = async () => {
    try {
      const { data } = await api.post(`/enrollments/${id}`);
      setMessage({ type: 'success', text: data.message });
      setAlreadyEnrolled(true);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Enrollment failed',
      });
    }
  };

  const syllabusModules = useMemo(() => {
    if (!course?.content) return defaultModules;

    return course.content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 8);
  }, [course?.content]);

  if (loading) return <div className="course-detail-page"><div className="course-detail-shell empty-state-box">Loading course...</div></div>;
  if (!course) return <div className="course-detail-page"><div className="course-detail-shell empty-state-box">Course not found</div></div>;

  return (
    <div className="course-detail-page">
      <div className="course-detail-shell">
        <div className="course-crumb-bar">
          <button type="button" className="back-link" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back to Courses
          </button>
          <span className="crumb-middle">Academic Portal</span>
          <span className="crumb-separator">/</span>
          <span>Available Courses</span>
          <span className="crumb-separator">/</span>
          <span className="crumb-current">{course.title}</span>
        </div>

        <div className="course-detail-layout">
          <main className="course-main-panel">
            <div className="detail-badges">
              <span className="detail-badge muted">General</span>
              <span className="detail-badge highlight">{course.level || 'Intermediate'}</span>
              <span className="detail-badge success">AI-Connected</span>
              <span className="detail-badge neutral">Mobile Systems</span>
            </div>

            <h1>{course.title}</h1>

            <div className="detail-meta-row">
              <span>
                <BookOpenText size={14} />
                By {course.instructor?.username || 'Instructor'}
              </span>
              <span>
                <Star size={14} fill="currentColor" />
                4.9 (128 reviews)
              </span>
              <span>
                <CheckCircle2 size={14} />
                Accredited Module
              </span>
            </div>

            <div className="detail-metrics">
              <div className="metric-box">
                <span className="metric-label">Duration</span>
                <strong>14 Hours</strong>
              </div>
              <div className="metric-box">
                <span className="metric-label">Curriculum</span>
                <strong>8 Modules</strong>
              </div>
              <div className="metric-box">
                <span className="metric-label">Format</span>
                <strong>3 Labs</strong>
              </div>
              <div className="metric-box">
                <span className="metric-label">Credential</span>
                <strong>Honors Cert</strong>
              </div>
            </div>

            <section className="detail-section">
              <div className="section-header-row">
                <h2>Course Overview</h2>
              </div>
              <p className="lead-copy">
                {course.description}
              </p>
            </section>

            <section className="detail-section feature-boxes">
              <div className="mini-feature">
                <span className="mini-feature-icon"><Sparkles size={15} /></span>
                <div>
                  <h3>AI assisted learning</h3>
                  <p>Adaptive content and live recommendations reduce friction.</p>
                </div>
              </div>
              <div className="mini-feature">
                <span className="mini-feature-icon"><GraduationCap size={15} /></span>
                <div>
                  <h3>Portfolio-ready outcomes</h3>
                  <p>Build deployable, real-world product features and prototypes.</p>
                </div>
              </div>
            </section>

            {course.content && (
              <section className="detail-section document-box">
                <div className="section-header-row">
                  <h2>Content &amp; Project Documentation</h2>
                  <span className="pill-soft">Capstone deliverables</span>
                </div>
                <div className="documentation-list">
                  {syllabusModules.map((item, index) => (
                    <div key={`${item}-${index}`} className="doc-item">
                      <CheckCircle2 size={15} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="detail-section syllabus-box">
              <div className="section-header-row">
                <h2>Curriculum Syllabus</h2>
                <span className="pill-soft">8 Modules • 22 Lessons</span>
              </div>

              <div className="syllabus-list">
                {defaultModules.map((module, index) => (
                  <div key={module} className="syllabus-row">
                    <div className="syllabus-index">0{index + 1}</div>
                    <div className="syllabus-text">
                      <strong>{module}</strong>
                    </div>
                    <div className="syllabus-duration">{1.5 + index * 0.5} hrs</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-section tech-stack-box">
              <div className="section-header-row">
                <h2>Technologies &amp; Prerequisites</h2>
              </div>
              <div className="tag-list">
                <span>React Native 0.74</span>
                <span>TypeScript 5.x</span>
                <span>OpenAI GPT-3.5</span>
                <span>Node.js 20 LTS</span>
              </div>
              <p className="prereq-copy">
                Prerequisite knowledge: Solid proficiency in modern JavaScript and a
                working understanding of application architecture.
              </p>
            </section>
          </main>

          <aside className="course-side-panel">
            <div className="side-card premium-card">
              <div className="side-header-row">
                <span className="side-pill">AI + Specialization</span>
              </div>

              <div className="side-status-row">
                <span className="status-tag">Cohort 4 Active</span>
                <span className="status-tag success">Fall Term Quad II</span>
              </div>

              <div className="side-block">
                <div className="side-label">Tuition Status</div>
                <div className="side-value">Included in Track</div>
              </div>

              {user?.role === 'student' && (
                <button
                  type="button"
                  className="enroll-side-button"
                  onClick={handleEnroll}
                  disabled={alreadyEnrolled}
                >
                  {alreadyEnrolled ? 'Enrolled' : 'Enroll in this course'}
                </button>
              )}

              {message && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
              )}
            </div>

            <div className="side-card included-card">
              <h3>What’s included in this course</h3>
              <ul>
                <li>AI-powered project brief generation</li>
                <li>Full project documentation checklist</li>
                <li>Interview prep and code review notes</li>
                <li>Mentor feedback and discussion resources</li>
              </ul>
            </div>

            <div className="side-card instructor-card">
              <div className="instructor-avatar">I1</div>
              <div className="instructor-info">
                <strong>{course.instructor?.username || 'Instructor'}</strong>
                <span>Instructor • {course.category || 'General'}</span>
              </div>
              <p>
                Expert educator with a focus on applied frameworks, AI tools, and
                learning systems design for modern mobile and web products.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;