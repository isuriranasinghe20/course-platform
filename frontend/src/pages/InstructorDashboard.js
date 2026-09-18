import { useEffect, useState } from 'react';
import api from '../api/axios';

const emptyForm = {
  title: '',
  description: '',
  content: '',
  category: 'General',
  level: 'beginner',
};

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [studentsMap, setStudentsMap] = useState({}); // courseId -> [enrollments]
  const [viewingStudents, setViewingStudents] = useState(null);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    const { data } = await api.get('/courses/instructor/mine');
    setCourses(data);
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
      fetchMyCourses();
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
      fetchMyCourses();
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
      setViewingStudents(courseId);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load students',
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="container">
      <h1>Instructor Dashboard</h1>
      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <form className="form-card" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit Course' : 'Add New Course'}</h2>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          rows="3"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <textarea
          placeholder="Content (modules, lessons, etc.)"
          rows="4"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <div className="row">
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="row">
          <button className="btn btn-primary" type="submit">
            {editingId ? 'Update Course' : 'Create Course'}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2>My Courses ({courses.length})</h2>
      {courses.length === 0 ? (
        <p className="muted">You haven't created any courses yet.</p>
      ) : (
        <div className="grid">
          {courses.map((c) => (
            <div className="card" key={c._id}>
              <h3>{c.title}</h3>
              <p className="muted">
                {c.category} • {c.level}
              </p>
              <p>{c.description}</p>
              <div className="card-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => handleEdit(c)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(c._id)}
                >
                  Delete
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => viewStudents(c._id)}
                >
                  View Students
                </button>
              </div>

              {viewingStudents === c._id && (
                <div className="students-table">
                  <h4>Enrolled Students</h4>
                  {studentsMap[c._id]?.length ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Role</th>
                          <th>Enrolled On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsMap[c._id].map((e) => (
                          <tr key={e._id}>
                            <td>{e.student?.username}</td>
                            <td>{e.student?.role}</td>
                            <td>
                              {new Date(e.enrolledAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="muted">No students enrolled yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;