import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/Auth/Login`,
                { username, password, rememberMe }
            );

            console.log("Server Response:", res.data);

            const token = res.data?.token
                || res.data?.Token
                || res.data?.accessToken
                || (typeof res.data === 'string' ? res.data : null);

            if (!token) {
                setMessage("Login failed: Backend response did not contain a token.");
                return;
            }

            const storage = rememberMe ? localStorage : sessionStorage;

            (rememberMe ? sessionStorage : localStorage).clear();

            storage.setItem("token", token);
            storage.setItem("username", username);

            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const decodedToken = JSON.parse(jsonPayload);
                const userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
                    || decodedToken.role
                    || decodedToken.Role
                    || "Borrower";

                storage.setItem("role", userRole);
            } catch (decodeError) {
                console.error("Failed to decode token role, defaulting to Borrower:", decodeError);
                storage.setItem("role", "Borrower");
            }

            setMessage("Login successful!");
            navigate("/dashboard");

        } catch (err) {
            console.error("Login API Error:", err.response || err);
            const errorMsg = err.response?.data?.message || err.response?.data || "Login failed. Check your credentials.";
            setMessage(typeof errorMsg === 'string' ? errorMsg : "Login failed. Check your credentials.");
        }
    };

    return (
        <div className="container d-flex align-items-center justify-content-center min-vh-100">
            <div className="row justify-content-center w-100">
                <div className="col-md-5 col-lg-4">
                    <div className="card shadow-lg p-4 border-0 glass-panel">
                        <h2 className="text-center mb-4 fw-bold text-dark">Login</h2>

                        <form onSubmit={handleLogin}>
                            <div className="mb-3">
                                <label className="form-label text-dark fw-semibold small">Username</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg fs-6 shadow-none"
                                    value={username}
                                    maxLength={20}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-2">
                                <label className="form-label text-dark fw-semibold small">Password</label>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control form-control-lg fs-6 shadow-none border-end-0"
                                        value={password}
                                        maxLength={50}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary bg-white border-start-0"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? "⚿" : "🔒︎"}
                                    </button>
                                </div>
                            </div>

                            <div className="form-check mb-4 mt-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label className="form-check-label text-dark small" htmlFor="rememberMe">
                                    Remember Me
                                </label>
                            </div>

                            <button type="submit" className="btn btn-primary w-100 btn-lg fs-6 shadow-sm">
                                Login
                            </button>
                        </form>

                        {message && <p className={`mt-3 text-center mb-0 fw-semibold ${message.includes("failed") ? "text-danger" : "text-success"}`}>{message}</p>}

                        <div className="text-center mt-4">
                            <span className="text-dark opacity-75 small">Don’t have an account? </span>
                            <Link to="/signup" className="text-decoration-none fw-semibold text-primary">Sign Up</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;