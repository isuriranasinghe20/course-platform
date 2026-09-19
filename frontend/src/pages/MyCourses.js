import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import {
  BookOpenText,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Sparkles,
  Star,
} from 'lucide-react';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/enrollments/my');
        setEnrollments(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  if (loading) {
    return (
      <div className="my-courses-page">
        <div className="my-courses-shell empty-state-box">Loading courses...</div>
      </div>
    );
  }

  const summaryStats = [
    {
      label: 'Active Tracks',
      value: Math.min(enrollments.length || 0, 2),
      icon: <BookOpenText size={16} />,
    },
    {
      label: 'Overall Completion',
      value: `${enrollments.length ? 48 : 0}%`,
      icon: <GraduationCap size={16} />,
    },
    {
      label: 'Next Milestone',
      value: enrollments[0]?.course?.title || 'No milestone',
      short: '1/5 modules',
      icon: <Clock3 size={16} />,
    },
    {
      label: 'AI Mentor Status',
      value: 'Ready',
      short: 'Recommendations synced',
      icon: <Sparkles size={16} />,
    },
  ];

  return (
    <div className="my-courses-page">
      <div className="my-courses-shell">
        <div className="student-breadcrumbs">
          Academic Portal <span>›</span> Student Hub <span>›</span> Enrolled Courses
        </div>

        <div className="student-header-row">
          <div>
            <div className="student-kicker">
              <span className="dot-red" /> Active matriculation &amp; tracks
            </div>
            <h1>My Enrolled Courses</h1>
            <p>
              Track your enrolled curriculum tracks, interactive coding labs,
              and AI-powered recommendations.
            </p>
          </div>

          <div className="student-header-actions">
            <button type="button" className="student-soft-btn">
              <CalendarDays size={15} /> Schedule &amp; Deadlines
            </button>
            <button type="button" className="student-soft-btn accent">
              <GraduationCap size={15} /> Academic Transcript
            </button>
          </div>
        </div>

        <div className="summary-grid">
          {summaryStats.map((item) => (
            <div key={item.label} className="summary-card">
              <div className="summary-card-top">
                <span className="summary-label">{item.label}</span>
                <span className="summary-icon">{item.icon}</span>
              </div>
              <div className="summary-body">
                <strong>{item.value}</strong>
                {item.short && <span>{item.short}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="student-filter-row">
          <button type="button" className="filter-pill active">
            All Enrolled ({enrollments.length || 0})
          </button>
          <button type="button" className="filter-pill">
            In Progress (0)
          </button>
          <button type="button" className="filter-pill">
            Completed (0)
          </button>
          <button type="button" className="filter-pill">
            Archived (0)
          </button>
        </div>

        {enrollments.length === 0 ? (
          <div className="empty-state-box">
            <p>You haven’t enrolled in any courses yet.</p>
            <Link to="/courses" className="browse-link">
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="enrolled-course-grid">
            {enrollments.map((entry, index) => {
              const course = entry.course || {};
              const progress = index % 2 === 0 ? 35 : 65;
              const accent = index % 2 === 0 ? 'blue' : 'orange';

              return (
                <article key={entry._id} className="enrolled-course-card">
                  <div className={`course-banner ${accent}`}>
                    <div className="banner-topline">
                      <span className="banner-badge">{course.category || 'Course'}</span>
                      <span className="banner-status">Status: Enrolled</span>
                    </div>
                    <div className="banner-meta-row">
                      <span>{course.level || 'Beginner'}</span>
                      <span>{course.instructor?.username || 'Instructor'}</span>
                    </div>
                  </div>

                  <div className="course-card-body">
                    <div className="course-title-row">
                      <h2>{course.title}</h2>
                      <span className="rating-badge">
                        <Star size={14} fill="currentColor" /> {index % 2 === 0 ? '4.9' : '5.0'}
                      </span>
                    </div>

                    <div className="mini-meta-row">
                      <span>
                        <BookOpenText size={14} /> Instructor: {course.instructor?.username || 'Instructor'}
                      </span>
                      <span>
                        <CheckCircle2 size={14} /> Department: {course.category || 'General'}
                      </span>
                    </div>

                    <p className="course-summary">{course.description}</p>

                    <div className="progress-block">
                      <div className="progress-label-row">
                        <span>Course Progress</span>
                        <strong>{progress}% Completed</strong>
                      </div>
                      <div className="progress-bar">
                        <span style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <div className="curriculum-box">
                      <ul>
                        <li>Module 1: Foundations</li>
                        <li>Module 2: Practical Lab</li>
                        <li>Module 3: AI-supported review</li>
                      </ul>
                    </div>

                    <div className="card-actions-row">
                      <Link to={`/courses/${course._id}`} className="primary-action">
                        Continue Learning
                      </Link>
                      <Link to={`/courses/${course._id}`} className="secondary-action">
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="promo-bar">
          <div className="promo-icon">
            <Sparkles size={18} />
          </div>
          <div className="promo-content">
            <strong>GPT-3 Academic Recommendation</strong>
            <p>
              Because your curriculum blend and project history match your pace,
              we recommend a focused track that improves your learning flow.
            </p>
          </div>
          <div className="promo-buttons">
            <button type="button" className="promo-button muted">
              View Syllabus
            </button>
            <button type="button" className="promo-button accent">
              Enroll in Track
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;