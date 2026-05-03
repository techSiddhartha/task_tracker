import { useEffect, useState } from "react";

import api from "../api/client";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  description: "",
  members: []
};

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";

  const loadProjects = async () => {
    try {
      const [projectsResponse, usersResponse] = await Promise.all([
        api.get("/projects"),
        isAdmin ? api.get("/users") : Promise.resolve({ data: { users: [] } })
      ]);

      setProjects(projectsResponse.data.projects);
      setUsers(usersResponse.data.users);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleChange = (event) => {
    const { name, value, options } = event.target;

    if (name === "members") {
      const selectedValues = Array.from(options).filter((option) => option.selected).map((option) => option.value);
      setForm((current) => ({ ...current, members: selectedValues }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    setForm({
      name: project.name,
      description: project.description,
      members: project.members.map((member) => member._id)
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, form);
      } else {
        await api.post("/projects", form);
      }

      resetForm();
      await loadProjects();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await api.delete(`/projects/${projectId}`);
      await loadProjects();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to delete project.");
    }
  };

  if (loading) {
    return <Loader label="Loading projects" />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="card p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Projects</h2>
          <p className="text-sm text-slate-400">Track ownership, descriptions, and member assignment.</p>
        </div>

        {error && <p className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

        {isAdmin ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label" htmlFor="name">Project Name</label>
              <input id="name" name="name" className="input" value={form.name} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="description">Description</label>
              <textarea id="description" name="description" rows="4" className="input" value={form.description} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="members">Assign Members</label>
              <select id="members" name="members" multiple className="input min-h-36" value={form.members} onChange={handleChange}>
                {users.map((member) => (
                  <option key={member._id} value={member._id}>{member.name} ({member.role})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : editingId ? "Update Project" : "Create Project"}</button>
              {editingId && <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        ) : (
          <EmptyState title="Member access" description="Members can review project membership here. Admins handle project creation and assignment." />
        )}
      </section>

      <section className="space-y-4">
        {projects.length === 0 ? (
          <EmptyState title="No projects yet" description="Create your first project to begin assigning tasks." />
        ) : (
          projects.map((project) => (
            <article key={project._id} className="card p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{project.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{project.description || "No description provided."}</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-3">
                    <button type="button" className="btn-secondary" onClick={() => handleEdit(project)}>Edit</button>
                    <button type="button" className="btn-secondary" onClick={() => handleDelete(project._id)}>Delete</button>
                  </div>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.members.map((member) => (
                  <span key={member._id} className="badge bg-slate-800 text-slate-200">
                    {member.name} • {member.role}
                  </span>
                ))}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};

export default ProjectsPage;
