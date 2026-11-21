import { useEffect, useState } from 'react';
import api from '../services/api';
import type { TaskItem, UserItem } from '../types/task';

function DashboardPage() {
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isAdmin = currentUser?.role === 'Admin';

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedUserId, setAssignedUserId] = useState<number>(
    currentUser?.userId || 1
  );

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const tasksRes = await api.get('/tasks');
      setTasks(tasksRes.data);

      if (isAdmin) {
        const usersRes = await api.get('/users');
        setUsers(usersRes.data);
        if (usersRes.data.length > 0) {
          setAssignedUserId(usersRes.data[0].userId);
        }
      }
    } catch (err: any) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/tasks', {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        userId: assignedUserId,
      });

      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
      fetchDashboardData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not create task.');
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks(
        tasks.map((t) => (t.taskId === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err: any) {
      setError('Could not update task status.');
    }
  };

  const handleDelete = async (taskId: number) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t.taskId !== taskId));
    } catch (err: any) {
      setError('Could not delete task.');
    }
  };

  return (
    <div className="mt-4 mb-5">
      <h2 className="mb-4">
        {isAdmin ? 'Admin Dashboard' : 'My Tasks Dashboard'}
      </h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {isAdmin && (
        <div className="card shadow-sm p-4 mb-4">
          <h5 className="mb-3">Create & Assign Task</h5>
          <form onSubmit={handleCreateTask} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Assign To</label>
              <select
                className="form-select"
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(Number(e.target.value))}
              >
                {users.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.fullName} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-8">
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary">
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card shadow-sm p-4">
        <h5 className="mb-3">Task List</h5>
        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-muted mb-0">No tasks found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned User ID</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.taskId}>
                    <td>
                      <strong>{task.title}</strong>
                      <div className="text-muted small">{task.description}</div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          task.priority === 'High'
                            ? 'bg-danger'
                            : task.priority === 'Medium'
                            ? 'bg-warning text-dark'
                            : 'bg-secondary'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task.taskId, e.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="InProgress">InProgress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td>User #{task.userId}</td>
                    {isAdmin && (
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(task.taskId)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;