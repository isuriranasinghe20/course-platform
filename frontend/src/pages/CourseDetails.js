import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    try {
      const { data } = await api.post(`/enrollments/${id}`);
      setMessage({ type: 'success', text: data.message });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Enrollment failed',
      });
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!course) return <div className="container">Course not found</div>;

  return (
    <div className="container">
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="details-card">
        <h1>{course.title}</h1>
        <p className="muted">
          By {course.instructor?.username} • {course.category} • {course.level}
        </p>
        <h3>Description</h3>
        <p>{course.description}</p>
        {course.content && (
          <>
            <h3>Content</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{course.content}</p>
          </>
        )}
        {message && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}
        {user?.role === 'student' && (
          <button className="btn btn-primary" onClick={handleEnroll}>
            Enroll in this course
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;