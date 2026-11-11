
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import AuthLayout from "./AuthLayout";

function Login() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const inputClasses =
    "w-full border border-neutral-300 bg-white px-4 py-3.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to log in."
      );
    }
  };

  return (
    <AuthLayout
      title="Ideas don't"
      accent="happen alone."
      description="Sign in to return to your workspace, pick up where you left off, and keep building ideas with your team."
      navText="Don't have an account?"
      navLabel="Create account"
      navHref="/signup"
      visualTitle="GOOD IDEAS"
      visualDescription={<>GROW<br />TOGETHER.</>}
    >
      <form onSubmit={handleSubmit} className="mt-9 space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-xs font-medium text-neutral-800"
          >
            Email address
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-xs font-medium text-neutral-800"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className={`${inputClasses} pr-16`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-4 text-xs font-medium text-neutral-500 hover:text-neutral-950"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="border-l-2 border-[#d9786b] bg-[#d9786b]/10 px-3 py-2 text-xs text-red-800"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-between bg-neutral-950 px-5 py-4 text-sm font-medium text-white transition-colors hover:bg-[#d9786b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
          {!loading && <span aria-hidden="true">↗</span>}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Login;
