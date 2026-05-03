const EmptyState = ({ title, description }) => {
  return (
    <div className="card border-dashed p-8 text-center">
      <p className="text-lg font-semibold text-slate-100">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
};

export default EmptyState;
