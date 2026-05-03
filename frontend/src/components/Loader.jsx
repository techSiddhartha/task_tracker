const Loader = ({ label = "Loading" }) => {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <span className="h-3 w-3 animate-pulse rounded-full bg-brand-500" />
      <span>{label}...</span>
    </div>
  );
};

export default Loader;
