import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const initialValues = {
  name: "",
  email: "",
  password: "",
  role: "member"
};

const AuthPage = ({ mode = "login" }) => {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, isAuthenticated } = useAuth();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(() => (isSignup ? "Create your workspace account" : "Welcome back"), [isSignup]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const validate = () => {
    if (isSignup && !values.name.trim()) {
      return "Name is required.";
    }

    if (!values.email.trim()) {
      return "Email is required.";
    }

    if (values.password.trim().length < 6) {
      return "Password must be at least 6 characters.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      if (isSignup) {
        await signup(values);
      } else {
        await login({ email: values.email, password: values.password });
      }

      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <section className="card p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">
            {isSignup ? "Sign Up" : "Login"}
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white">{title}</h2>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {isSignup && (
              <div>
                <label className="label" htmlFor="name">Name</label>
                <input id="name" name="name" className="input" value={values.name} onChange={handleChange} />
              </div>
            )}

            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="input" value={values.email} onChange={handleChange} />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className="input" value={values.password} onChange={handleChange} />
            </div>

            {isSignup && (
              <div>
                <label className="label" htmlFor="role">Role</label>
                <select id="role" name="role" className="input" value={values.role} onChange={handleChange}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            {error && <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? <Loader label={isSignup ? "Creating account" : "Signing in"} /> : isSignup ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            {isSignup ? "Already have an account?" : "Need an account?"}{" "}
            <Link className="font-semibold text-brand-100" to={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Log in" : "Sign up"}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default AuthPage;
