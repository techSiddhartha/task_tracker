import { useEffect, useMemo, useState } from "react";

import api from "../api/client";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { TASK_PRIORITIES, TASK_STATUSES } from "../utils/constants";
import { formatDate, isOverdue } from "../utils/helpers";

const initialTaskForm = {
  title: "",
  description: "",
  status: "To Do",
  priority: "Medium",
  dueDate: "",
  assignedTo: "",
  projectId: ""
};

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialTaskForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";

  const loadData = async () => {
    try {
      const requests = [api.get("/tasks"), api.get("/projects")];
      if (isAdmin) {
        requests.push(api.get("/users"));
      }

      const [tasksResponse, projectsResponse, usersResponse] = await Promise.all(requests);
      setTasks(tasksResponse.data.tasks);
      setProjects(projectsResponse.data.projects);
      setUsers(usersResponse?.data?.users || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableMembers = useMemo(() => {
    const selectedProject = projects.find((project) => project._id === form.projectId);
    return selectedProject?.members || [];
  }, [projects, form.projectId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleTaskCreate = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.projectId || !form.assignedTo) {
      setError("Title, project, and assignee are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await api.post("/tasks", form);
      setForm(initialTaskForm);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to create task.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, isAdmin ? { status } : { status });
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update task status.");
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to delete task.");
    }
  };

  if (loading) {
    return <Loader label="Loading tasks" />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="card p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Tasks</h2>
          <p className="text-sm text-slate-400">Create work items, assign owners, and keep status current.</p>
        </div>

        {error && <p className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

        {isAdmin ? (
          <form className="space-y-4" onSubmit={handleTaskCreate}>
            <div>
              <label className="label" htmlFor="title">Task Title</label>
              <input id="title" name="title" className="input" value={form.title} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="description">Description</label>
              <textarea id="description" name="description" rows="4" className="input" value={form.description} onChange={handleChange} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label" htmlFor="projectId">Project</label>
                <select id="projectId" name="projectId" className="input" value={form.projectId} onChange={handleChange}>
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="assignedTo">Assign To</label>
                <select id="assignedTo" name="assignedTo" className="input" value={form.assignedTo} onChange={handleChange}>
                  <option value="">Select member</option>
                  {availableMembers.map((member) => (
                    <option key={member._id} value={member._id}>{member.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="label" htmlFor="status">Status</label>
                <select id="status" name="status" className="input" value={form.status} onChange={handleChange}>
                  {TASK_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="priority">Priority</label>
                <select id="priority" name="priority" className="input" value={form.priority} onChange={handleChange}>
                  {TASK_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="dueDate">Due Date</label>
                <input id="dueDate" name="dueDate" type="date" className="input" value={form.dueDate} onChange={handleChange} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Creating..." : "Create Task"}</button>
          </form>
        ) : (
          <EmptyState title="Member workflow" description="Members can review assigned tasks and update status from the list on the right." />
        )}
      </section>

      <section className="space-y-4">
        {tasks.length === 0 ? (
          <EmptyState title="No tasks available" description="Create a task to get started." />
        ) : (
          tasks.map((task) => (
            <article key={task._id} className="card p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{task.title}</h3>
                    {isOverdue(task) && <span className="badge bg-rose-500/15 text-rose-300">Overdue</span>}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{task.description || "No description provided."}</p>
                </div>
                {isAdmin && (
                  <button type="button" className="btn-secondary" onClick={() => handleDelete(task._id)}>
                    Delete
                  </button>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <StatusBadge value={task.status} />
                <StatusBadge value={task.priority} type="priority" />
                <span className="badge bg-slate-800 text-slate-200">{task.projectId?.name}</span>
                <span className="badge bg-slate-800 text-slate-200">{task.assignedTo?.name}</span>
                <span className="badge bg-slate-800 text-slate-200">Due {formatDate(task.dueDate)}</span>
              </div>

              {(isAdmin || task.assignedTo?._id === user?._id) && (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <label className="text-sm text-slate-400" htmlFor={task._id}>Update Status</label>
                  <select
                    id={task._id}
                    className="input max-w-52"
                    value={task.status}
                    onChange={(event) => handleStatusChange(task._id, event.target.value)}
                  >
                    {TASK_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  );
};

export default TasksPage;
