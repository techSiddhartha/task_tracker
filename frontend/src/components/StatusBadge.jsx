import { getPriorityColor, getStatusColor } from "../utils/helpers";

const StatusBadge = ({ value, type = "status" }) => {
  const classes = type === "priority" ? getPriorityColor(value) : getStatusColor(value);

  return <span className={`badge ${classes}`}>{value}</span>;
};

export default StatusBadge;
