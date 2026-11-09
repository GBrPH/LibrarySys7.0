import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/Auth/Login`, credentials);

            // Extract token and persist user details
            const token = response.data.token || response.data;
            localStorage.setItem("token", token);

            if (response.data.username) {
                localStorage.setItem("username", response.data.username);
            } else {
                localStorage.setItem("username", credentials.username);
            }

            navigate("/dashboard");
        } catch (err) {
            console.error("Login error:", err);
            setError(err.response?.data?.message || "Invalid username or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex align-items-center justify-content-center min-vh-100">
            <div className="row justify-content-center w-100">
                <div className="col-md-5 col-lg-4">
                    {/* Glassmorphism panel matching the Midnight Slate theme */}
                    <div className="card border-0 shadow-lg p-4 glass-panel">
                        <div className="text-center mb-4">
                            <h3 className="fw-bold text-dark">LibrarySys</h3>
                            <p className="text-muted small mb-0">Sign in to your account</p>
                        </div>

                        {error && (
                            <div className="alert alert-danger py-2 small" role="alert">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin}>
                            <div className="mb-3">
                                <label className="form-label text-dark small fw-bold">USERNAME</label>
                                <input
                                    type="text"
                                    name="username"
                                    className="form-control shadow-none"
                                    placeholder="Enter your username"
                                    value={credentials.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label text-dark small fw-bold">PASSWORD</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control shadow-none"
                                    placeholder="Enter your password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100 py-2 fw-semibold shadow-sm"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>

                        <div className="text-center mt-4 pt-3 border-top" style={{ borderColor: "rgba(30, 41, 59, 0.15) !important" }}>
                            <small className="text-muted">
                                Don't have an account? <Link to="/signup" className="text-primary fw-semibold text-decoration-none">Sign up</Link>
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;