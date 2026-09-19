import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';

const Courses = () => {
  const { user } = useAuth();
  const isInstructor = user?.role === 'instructor';
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [courseCounts, setCourseCounts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchCourses();
    if (user?.role === 'student') {
      fetchMyEnrollments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    const handleCourseSearch = (event) => {
      setSearchTerm(event.detail || '');
    };

    window.addEventListener('course-search', handleCourseSearch);
    return () => window.removeEventListener('course-search', handleCourseSearch);
  }, []);

  const fetchCourses = async () => {
    try {
      const endpoint = isInstructor ? '/courses/instructor/mine' : '/courses';
      const { data } = await api.get(endpoint);
      setCourses(data);

      const counts = {};
      for (const course of data) {
        try {
          const { data: countData } = await api.get(`/enrollments/count/${course._id}`);
          counts[course._id] = countData.count || 0;
        } catch {
          counts[course._id] = 0;
        }
      }
      setCourseCounts(counts);
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

  const filteredCourses = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    if (!normalized) {
      return courses;
    }

    return courses.filter((course) => {
      const haystack = [
        course.title,
        course.category,
        course.description,
        course.instructor?.username,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [courses, searchTerm]);

  const handleEnroll = async (courseId) => {
    try {
      const { data } = await api.post(`/enrollments/${courseId}`);
      setEnrolledIds((prev) => [...prev, courseId]);
      setCourseCounts((prev) => ({
        ...prev,
        [courseId]: (prev[courseId] || 0) + 1,
      }));
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

  const pageTitle = isInstructor ? 'My Courses' : 'Available Courses';

  return (
    <div className="catalog-shell">
      <div className="catalog-header">
        <div>
          <p className="catalog-eyebrow">Learning Hub</p>
          <h1>{pageTitle}</h1>
        </div>
        <div className="catalog-count-pill">{filteredCourses.length} Courses</div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {filteredCourses.length === 0 ? (
        <div className="empty-state">
          <p>No courses match your search yet.</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onEnroll={user?.role === 'student' ? handleEnroll : null}
              enrolled={enrolledIds.includes(course._id)}
              learnerCount={courseCounts[course._id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;