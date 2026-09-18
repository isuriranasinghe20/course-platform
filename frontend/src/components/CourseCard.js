import { Link } from 'react-router-dom';

const CourseCard = ({ course, onEnroll, enrolled }) => {
  return (
    <div className="card">
      <h3>{course.title}</h3>
      <p className="muted">
        By {course.instructor?.username || 'Unknown'} • {course.category} •{' '}
        {course.level}
      </p>
      <p>{course.description}</p>
      <div className="card-actions">
        <Link to={`/courses/${course._id}`} className="btn btn-secondary">
          View Details
        </Link>
        {onEnroll && (
          <button
            className="btn btn-primary"
            onClick={() => onEnroll(course._id)}
            disabled={enrolled}
          >
            {enrolled ? 'Enrolled ✓' : 'Enroll'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;