export const formatDate = (date) => {
  if (!date) {
    return "No due date";
  }

  return new Date(date).toLocaleDateString();
};

export const isOverdue = (task) => {
  if (!task?.dueDate || task?.status === "Done") {
    return false;
  }

  return new Date(task.dueDate) < new Date();
};

export const getStatusColor = (status) => {
  if (status === "Done") {
    return "bg-emerald-500/15 text-emerald-300";
  }

  if (status === "In Progress") {
    return "bg-amber-500/15 text-amber-300";
  }

  return "bg-slate-700 text-slate-200";
};

export const getPriorityColor = (priority) => {
  if (priority === "High") {
    return "bg-rose-500/15 text-rose-300";
  }

  if (priority === "Medium") {
    return "bg-orange-500/15 text-orange-300";
  }

  return "bg-sky-500/15 text-sky-300";
};
