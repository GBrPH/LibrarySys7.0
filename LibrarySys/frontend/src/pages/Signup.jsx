import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function SignUp() {
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/User/BorrowBookforUser`, {
                id: 0,
                username: username,
                password: password,
                fullName: fullName,
                role: "Borrower",
                isActive: true,
                isLoggedIn: false
            });
            setMessage("Account created! Redirecting to login...");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            console.error("Sign up failed:", err);
            setMessage("Failed to register. Try another username.");
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card border-0 shadow-lg p-4" style={{ maxWidth: "400px", width: "100%", borderRadius: "16px" }}>
                <h2 className="text-center mb-4 text-primary fw-bold">Sign Up</h2>
                <form onSubmit={handleSignUp}>
                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">FULL NAME</label>
                        <input
                            type="text"
                            className="form-control"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">USERNAME</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">PASSWORD</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-semibold">Register</button>
                </form>
                {message && <p className="mt-3 text-center text-info mb-0">{message}</p>}
                <div className="text-center mt-3">
                    <span className="text-muted small">Already have an account? </span>
                    <Link to="/login" className="text-decoration-none fw-bold">Login</Link>
                </div>
            </div>
        </div>
    );
}

export default SignUp;