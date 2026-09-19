import { Link } from 'react-router-dom';

const CourseCard = ({ course, onEnroll, enrolled, learnerCount = 0 }) => {
  return (
    <div className="catalog-card">
      <div className="catalog-card-header">
        <div>
          <span className="catalog-tag">{course.category || 'General'}</span>
          <h3>{course.title}</h3>
        </div>
        <span className="learner-pill">{learnerCount} learners</span>
      </div>

      <p className="catalog-meta">
        By {course.instructor?.username || 'Unknown'} • {course.level || 'Beginner'}
      </p>
      <p className="catalog-description">{course.description}</p>

      <div className="catalog-card-footer">
        <Link to={`/courses/${course._id}`} className="catalog-link">
          View details
        </Link>
        {onEnroll && (
          <button
            className="catalog-enroll-btn"
            onClick={() => onEnroll(course._id)}
            disabled={enrolled}
          >
            {enrolled ? 'Enrolled' : 'Enroll'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;