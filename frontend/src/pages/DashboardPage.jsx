import { useEffect, useState } from "react";

import api from "../api/client";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import { formatDate, isOverdue } from "../utils/helpers";

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await api.get("/tasks");
        setTasks(data.tasks);
        setSummary(data.statusSummary);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <Loader label="Loading dashboard" />;
  }

  if (error) {
    return <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total Tasks", value: summary?.total ?? 0 },
          { label: "To Do", value: summary?.todo ?? 0 },
          { label: "In Progress", value: summary?.inProgress ?? 0 },
          { label: "Done", value: summary?.done ?? 0 },
          { label: "Overdue", value: summary?.overdue ?? 0 }
        ].map((item) => (
          <div key={item.label} className="card p-5">
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-3 text-3xl font-extrabold text-white">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Task Overview</h2>
            <p className="text-sm text-slate-400">Recent work across your projects and assignments.</p>
          </div>
        </div>

        {tasks.length === 0 ? (
          <EmptyState title="No tasks yet" description="Create a task to populate the dashboard summary." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-3 font-medium">Task</th>
                  <th className="pb-3 font-medium">Project</th>
                  <th className="pb-3 font-medium">Assignee</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Priority</th>
                  <th className="pb-3 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id} className="border-b border-slate-900/80 align-top">
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-white">{task.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{task.description || "No description"}</p>
                    </td>
                    <td className="py-4 pr-4">{task.projectId?.name}</td>
                    <td className="py-4 pr-4">{task.assignedTo?.name}</td>
                    <td className="py-4 pr-4"><StatusBadge value={task.status} /></td>
                    <td className="py-4 pr-4"><StatusBadge value={task.priority} type="priority" /></td>
                    <td className="py-4 pr-4">
                      <span className={isOverdue(task) ? "font-semibold text-rose-300" : "text-slate-300"}>
                        {formatDate(task.dueDate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
