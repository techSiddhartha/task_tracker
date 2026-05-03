import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/projects", label: "Projects" },
  { to: "/tasks", label: "Tasks" }
];

const AppLayout = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-grid bg-[size:42px_42px]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="card mb-6 flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link to="/dashboard" className="text-2xl font-extrabold tracking-tight text-white">
              Team Task Manager
            </Link>
            <p className="mt-2 text-sm text-slate-400">
              Shared visibility for projects, tasks, deadlines, and team ownership.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "rounded-2xl px-4 py-2 text-sm font-semibold transition",
                      isActive || pathname === item.to
                        ? "bg-brand-500 text-slate-950"
                        : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-2">
                <p className="font-semibold text-white">{user?.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-100">{user?.role}</p>
              </div>
              <button type="button" onClick={logout} className="btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
