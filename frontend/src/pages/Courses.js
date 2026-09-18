import { useEffect, useState } from 'react';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchCourses();
    if (user?.role === 'student') fetchMyEnrollments();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEnrollments = async () => {
    try {
      const { data } = await api.get('/enrollments/my');
      setEnrolledIds(data.map((e) => e.course?._id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const { data } = await api.post(`/enrollments/${courseId}`);
      setEnrolledIds((prev) => [...prev, courseId]);
      setMessage({ type: 'success', text: data.message });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Enrollment failed',
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) return <div className="container">Loading courses...</div>;

  return (
    <div className="container">
      <h1>Available Courses</h1>
      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}
      {courses.length === 0 ? (
        <p className="muted">No courses available yet.</p>
      ) : (
        <div className="grid">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onEnroll={user?.role === 'student' ? handleEnroll : null}
              enrolled={enrolledIds.includes(course._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;