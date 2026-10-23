
import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate } from "react-router-dom";


function Signup() {
    const navigate = useNavigate();
    const signup = useAuthStore((state) => state.signup);

    const loading = useAuthStore((state) => state.isLoading);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

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
        console.log("Signup successful");
        navigate("/");
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to create your account."
            );
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                required
            />

            <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
            />

            <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                minLength={8}
                required
            />

            {error && <p role="alert">{error}</p>}

            <button type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
            </button>
        </form>
    );
}

export default Signup;
