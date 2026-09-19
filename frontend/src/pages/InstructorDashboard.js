import { useEffect, useState } from 'react';
import {
  BookOpen,
  ChartNoAxesCombined,
  LayoutDashboard,
  Users,
  PenLine,
  Trash2,
  Eye,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  title: '',
  description: '',
  content: '',
  category: 'General',
  level: 'beginner',
};

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [studentsMap, setStudentsMap] = useState({});
  const [viewingStudents, setViewingStudents] = useState(null);
  const [enrollmentCounts, setEnrollmentCounts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMyCourses();

    const handleCourseSearch = (event) => {
      setSearchTerm(event.detail || '');
    };

    const handleNewCourseRequest = () => {
      setEditingId(null);
      setForm(emptyForm);
      setTimeout(() => {
        const formField = document.querySelector('.course-form input');
        if (formField) {
          formField.focus();
        }
      }, 200);
    };

    window.addEventListener('course-search', handleCourseSearch);
    window.addEventListener('new-course-request', handleNewCourseRequest);
    return () => {
      window.removeEventListener('course-search', handleCourseSearch);
      window.removeEventListener('new-course-request', handleNewCourseRequest);
    };
  }, []);

  useEffect(() => {
    const normalized = searchTerm.trim().toLowerCase();

    if (!normalized) {
      setFilteredCourses(courses);
      return;
    }

    const visible = courses.filter((course) => {
      const haystack = `${course.title || ''} ${course.category || ''} ${course.description || ''}`.toLowerCase();
      return haystack.includes(normalized);
    });

    setFilteredCourses(visible);
  }, [courses, searchTerm]);

  const fetchMyCourses = async () => {
    try {
      const { data } = await api.get('/courses/instructor/mine');
      const courseList = data || [];
      setCourses(courseList);
      setFilteredCourses(courseList);

      const counts = {};
      for (const course of courseList) {
        try {
          const { data: enrollmentData } = await api.get(
            `/enrollments/course/${course._id}`
          );
          counts[course._id] = enrollmentData.length;
        } catch {
          counts[course._id] = 0;
        }
      }
      setEnrollmentCounts(counts);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load courses',
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, form);
        setMessage({ type: 'success', text: 'Course updated' });
      } else {
        await api.post('/courses', form);
        setMessage({ type: 'success', text: 'Course created' });
      }
      setForm(emptyForm);
      setEditingId(null);
      await fetchMyCourses();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Action failed',
      });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleEdit = (course) => {
    setForm({
      title: course.title,
      description: course.description,
      content: course.content || '',
      category: course.category || 'General',
      level: course.level || 'beginner',
    });
    setEditingId(course._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      setMessage({ type: 'success', text: 'Course deleted' });
      await fetchMyCourses();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Delete failed',
      });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const viewStudents = async (courseId) => {
    try {
      const { data } = await api.get(`/enrollments/course/${courseId}`);
      setStudentsMap((prev) => ({ ...prev, [courseId]: data }));
      setViewingStudents((current) => (current === courseId ? null : courseId));
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load students',
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const totalEnrollments = Object.values(enrollmentCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const totalProgress =
    courses.length > 0
      ? Math.round(
          courses.reduce((sum, course) => sum + (course.progress || 0), 0) /
            courses.length
        )
      : 0;

  return (
    <div className="dashboard-shell">
      <div className="dashboard-header">
        <div className="dashboard-kicker">
          INSTRUCTOR PORTAL • TERM FALL 2026
        </div>
        <div className="dashboard-title-row">
          <h1>Instructor Dashboard</h1>
          <div className="dashboard-actions">
            <button type="button" className="soft-btn">
              Curriculum History
            </button>
            <button type="button" className="soft-btn highlight">
              Sync LMS
            </button>
          </div>
        </div>
        <p className="dashboard-subtitle">
          Welcome back, <strong>{user?.username || 'Instructor'}</strong>. Manage
          your active courses, track milestones, and publish production
          curricula.
        </p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <LayoutDashboard size={18} />
          </div>
          <div className="stat-meta">
            <span>Active Courses</span>
            <strong>{courses.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Users size={18} />
          </div>
          <div className="stat-meta">
            <span>Enrolled Students</span>
            <strong>{totalEnrollments}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <ChartNoAxesCombined size={18} />
          </div>
          <div className="stat-meta">
            <span>Course Progress</span>
            <strong>{totalProgress}%</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <GraduationCap size={18} />
          </div>
          <div className="stat-meta">
            <span>Instructor Rating</span>
            <strong>5.0</strong>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <section className="form-panel">
          <div className="panel-label-row">
            <span className="panel-label">Curriculum</span>
            <span className="mini-status">{editingId ? 'Editing' : 'Draft'}</span>
          </div>

          <h2>{editingId ? 'Edit Course' : 'Add New Course'}</h2>

          <form className="course-form" onSubmit={handleSubmit}>
            <label>
              <span>Course Title</span>
              <input
                type="text"
                placeholder="Distributed Systems & MERN Stack Mastery"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </label>

            <div className="field-row">
              <label>
                <span>Category</span>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </label>

              <label>
                <span>Difficulty Level</span>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
            </div>

            <label>
              <span>Course Description</span>
              <textarea
                rows="5"
                placeholder="A comprehensive hands-on curriculum guiding engineers from zero to deployment of reactive full stack systems using modern MongoDB, Express, React, and Node.js microservices."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
            </label>

            <label>
              <span>Course Content</span>
              <textarea
                rows="4"
                placeholder="Modules, lessons, assignments, and milestone information"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </label>

            <div className="form-actions">
              <button type="button" className="secondary-btn">
                Save Draft
              </button>
              <button type="submit" className="primary-btn">
                {editingId ? 'Update Course' : 'Publish Course'}
              </button>
            </div>

            {editingId && (
              <button
                type="button"
                className="text-btn"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel editing
              </button>
            )}
          </form>
        </section>

        <section className="courses-panel">
          <div className="panel-header-row">
            <h3>My Courses</h3>
            <span className="course-count">{courses.length}</span>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={18} />
              <p>No matching courses found.</p>
            </div>
          ) : (
            <div className="course-list">
              {filteredCourses.map((course) => {
                const totalStudents =
                  enrollmentCounts[course._id] ??
                  studentsMap[course._id]?.length ??
                  course.enrolledStudents?.length ??
                  0;

                return (
                  <article className="course-item" key={course._id}>
                    <div className="course-cover">
                      <span className="cover-badge">Live</span>
                    </div>

                    <div className="course-body">
                      <div className="course-badges">
                        <span className="chip dark">{course.category}</span>
                        <span className="chip light">{course.level}</span>
                      </div>
                      <h4>{course.title}</h4>
                      <p>{course.description}</p>

                      <div className="course-meta">
                        <span>
                          <CheckCircle2 size={14} /> {course.modules || 0} modules
                        </span>
                        <span>
                          <Users size={14} /> {totalStudents} learners
                        </span>
                      </div>

                      <div className="course-actions">
                        <button
                          type="button"
                          className="icon-action primary"
                          onClick={() => handleEdit(course)}
                          title="Edit course"
                        >
                          <PenLine size={15} />
                        </button>
                        <button
                          type="button"
                          className="icon-action danger"
                          onClick={() => handleDelete(course._id)}
                          title="Delete course"
                        >
                          <Trash2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="view-students-btn"
                          onClick={() => viewStudents(course._id)}
                        >
                          <Eye size={15} />
                          {viewingStudents === course._id ? 'Hide' : 'View Students'}
                        </button>
                      </div>

                      {viewingStudents === course._id && (
                        <div className="student-panel">
                          <h5>Enrolled Students</h5>
                          {studentsMap[course._id]?.length ? (
                            studentsMap[course._id].map((enrollment) => (
                              <div className="student-row" key={enrollment._id}>
                                <div className="student-avatar">
                                  {enrollment.student?.username?.charAt(0).toUpperCase() || 'S'}
                                </div>
                                <div className="student-info">
                                  <strong>{enrollment.student?.username}</strong>
                                  <span>{enrollment.student?.role || 'student'}</span>
                                </div>
                                <div className="student-date">
                                  {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="no-students">No students enrolled yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default InstructorDashboard;