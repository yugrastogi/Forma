
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import AuthLayout from "./AuthLayout";

function Signup() {
  const navigate = useNavigate();

  const signup = useAuthStore((state) => state.signup);
  const loading = useAuthStore((state) => state.isLoading);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const inputClasses =
    "w-full border border-neutral-300 bg-white px-4 py-3.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await signup(formData);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to create your account."
      );
    }
  };

  return (
    <AuthLayout
      title="Make room"
      accent="for ideas."
      description="Create your Forma account and bring your team into one shared space to think, sketch, and build together."
      navText="Already have an account?"
      navLabel="Sign in"
      navHref="/login"
      visualTitle="START WITH AN IDEA"
      visualDescription={<>MAKE IT<br />REAL.</>}
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-xs font-medium text-neutral-800"
          >
            Full name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            autoComplete="name"
            minLength={3}
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-xs font-medium text-neutral-800"
          >
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
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
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
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

          <p className="mt-2 text-[11px] text-neutral-400">
            Use at least 8 characters.
          </p>
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
          {loading ? "Creating account..." : "Create account"}
          {!loading && <span aria-hidden="true">↗</span>}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Signup;
