import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/enrollments/my');
        setEnrollments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>My Enrolled Courses</h1>
      {enrollments.length === 0 ? (
        <p className="muted">
          You haven't enrolled in any courses yet.{' '}
          <Link to="/courses">Browse courses</Link>
        </p>
      ) : (
        <div className="grid">
          {enrollments.map((e) => (
            <div className="card" key={e._id}>
              <h3>{e.course?.title}</h3>
              <p className="muted">
                Instructor: {e.course?.instructor?.username}
              </p>
              <p>{e.course?.description}</p>
              <p className="badge">Status: {e.status}</p>
              <p className="muted small">
                Enrolled on {new Date(e.enrolledAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;