import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function SignUp() {
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);

        try {
            // Updated to use the environment variable to match Login.jsx
            // Verify if your backend route is /api/User/Register or /api/Auth/Register
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/User/Register`,
                {
                    id: 0,
                    username: username,
                    password: password,
                    fullName: fullName,
                    role: "Borrower",
                    isActive: true,
                    isLoggedIn: false,
                }
            );
            setIsSuccess(true);
            setMessage("Account created! Redirecting to login...");
            setTimeout(() => navigate("/login"), 1500);

        } catch (err) {
            console.error("Sign up failed:", err);
            setIsSuccess(false);

            if (err.response && err.response.status === 400) {
                setMessage(err.response.data);
            } else {
                setMessage("Failed to register. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container d-flex align-items-center justify-content-center min-vh-100">
            <div className="row justify-content-center w-100">
                <div className="col-md-5 col-lg-4">
                    <div className="card shadow-lg p-4 border-0 glass-panel">
                        <h2 className="text-center mb-4 fw-bold text-dark">Sign Up</h2>

                        <form onSubmit={handleSignUp}>
                            <div className="mb-3">
                                <label className="form-label text-dark fw-semibold small">Name (What should we call you?)</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg fs-6 shadow-none"
                                    value={fullName}
                                    maxLength={50}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>

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

                            <div className="mb-4">
                                <label className="form-label text-dark fw-semibold small">Password</label>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control form-control-lg fs-6 shadow-none border-end-0"
                                        value={password}
                                        minLength={6}
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

                            <button type="submit" className="btn btn-primary w-100 btn-lg fs-6 shadow-sm" disabled={isLoading}>
                                {isLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : "Register"}
                            </button>
                        </form>

                        {message && (
                            <p className={`mt-3 text-center mb-0 fw-semibold ${isSuccess ? "text-success" : "text-danger"}`}>
                                {message}
                            </p>
                        )}

                        <div className="text-center mt-4">
                            <span className="text-dark opacity-75 small">Already have an account? </span>
                            <Link to="/login" className="text-decoration-none fw-semibold text-primary">Login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;