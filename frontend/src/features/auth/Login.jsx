import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

const Login = () => {

    const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");

const login = useAuthStore((state) => state.login);
const loading = useAuthStore((state) => state.isLoading);

const navigate = useNavigate();

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
    <form onSubmit={handleSubmit}>
  <input
    type="email"
    value={email}
    onChange={(event) => setEmail(event.target.value)}
    placeholder="Email"
    required
  />

  <input
    type="password"
    value={password}
    onChange={(event) => setPassword(event.target.value)}
    placeholder="Password"
    required
  />

  {error && <p role="alert">{error}</p>}

  <button type="submit" disabled={loading}>
    {loading ? "Logging in..." : "Log in"}
  </button>
</form>
  )
}

export default Login
