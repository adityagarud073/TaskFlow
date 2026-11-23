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

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateForm, setShowCreateForm] = useState(false);

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
    } catch {
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
      setShowCreateForm(false);
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
    } catch {
      setError('Could not update task status.');
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t.taskId !== taskId));
    } catch {
      setError('Could not delete task.');
    }
  };

  const getUserName = (userId: number) => {
    const found = users.find((u) => u.userId === userId);
    return found ? found.fullName : `User #${userId}`;
  };

  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'InProgress').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === 'All' || task.status === statusFilter;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            {isAdmin ? 'Admin Dashboard' : 'My Tasks'}
          </h2>
          <p className="text-muted small mb-0">
            {isAdmin
              ? 'Monitor team progress and assign tasks'
              : 'View your assigned tasks and update progress'}
          </p>
        </div>

        {isAdmin && (
          <button
            className={`btn rounded-pill px-4 fw-semibold shadow-sm ${
              showCreateForm ? 'btn-outline-secondary' : 'btn-primary'
            }`}
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Close Form' : '+ New Task'}
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger py-2 rounded-3">{error}</div>
      )}

      {/* KPI Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 border-start border-4 border-primary h-100 p-3">
            <div className="text-muted small fw-semibold">Total Tasks</div>
            <div className="fs-2 fw-bold text-primary">{totalCount}</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 border-start border-4 border-secondary h-100 p-3">
            <div className="text-muted small fw-semibold">Pending</div>
            <div className="fs-2 fw-bold text-secondary">{pendingCount}</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 border-start border-4 border-warning h-100 p-3">
            <div className="text-muted small fw-semibold">In Progress</div>
            <div className="fs-2 fw-bold text-warning">{inProgressCount}</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 border-start border-4 border-success h-100 p-3">
            <div className="text-muted small fw-semibold">Completed</div>
            <div className="fs-2 fw-bold text-success">{completedCount}</div>
          </div>
        </div>
      </div>

      {/* Admin Create Task Form */}
      {isAdmin && showCreateForm && (
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <h5 className="fw-bold mb-3">Create & Assign New Task</h5>
          <form onSubmit={handleCreateTask} className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">Title</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="e.g. Prepare Monthly Report"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold">Priority</label>
              <select
                className="form-select rounded-3"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold">Assign To</label>
              <select
                className="form-select rounded-3"
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
            <div className="col-12 col-md-8">
              <label className="form-label small fw-semibold">Description</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="Short task details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Due Date</label>
              <input
                type="date"
                className="form-control rounded-3"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="col-12 d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-primary rounded-pill px-4 fw-semibold"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <input
              type="text"
              className="form-control rounded-pill px-3"
              placeholder="Search tasks by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-6 d-flex flex-wrap gap-2 justify-content-md-end">
            {['All', 'Pending', 'InProgress', 'Completed'].map((status) => (
              <button
                key={status}
                className={`btn btn-sm rounded-pill px-3 ${
                  statusFilter === status
                    ? 'btn-dark'
                    : 'btn-outline-secondary'
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task Cards Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted mt-2 small">Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <h5 className="text-muted fw-bold mb-1">No tasks found</h5>
          <p className="text-secondary small mb-0">
            Try changing your search filter or create a new task.
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredTasks.map((task) => (
            <div key={task.taskId} className="col-12 col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm rounded-4 h-100 p-3 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                    <span
                      className={`badge rounded-pill ${
                        task.priority === 'High'
                          ? 'bg-danger-subtle text-danger'
                          : task.priority === 'Medium'
                          ? 'bg-warning-subtle text-warning-emphasis'
                          : 'bg-secondary-subtle text-secondary'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                    <span
                      className={`badge rounded-pill ${
                        task.status === 'Completed'
                          ? 'text-bg-success'
                          : task.status === 'InProgress'
                          ? 'text-bg-warning'
                          : 'text-bg-secondary'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-1">{task.title}</h5>
                  <p className="text-muted small mb-3">
                    {task.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  <div className="bg-light rounded-3 p-2 mb-3 d-flex justify-content-between text-secondary small">
                    <span>
                      Assigned: <strong>{getUserName(task.userId)}</strong>
                    </span>
                    <span>
                      Due:{' '}
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : 'No date'}
                    </span>
                  </div>

                  <div className="d-flex gap-2 align-items-center">
                    <select
                      className="form-select form-select-sm rounded-3"
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task.taskId, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="InProgress">InProgress</option>
                      <option value="Completed">Completed</option>
                    </select>

                    {isAdmin && (
                      <button
                        className="btn btn-sm btn-outline-danger rounded-3 px-3"
                        onClick={() => handleDelete(task.taskId)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;