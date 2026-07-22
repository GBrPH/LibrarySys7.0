import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/Auth/Login`, {
                username,
                password
            });
            localStorage.setItem("token", res.data.token);
            setMessage("Login successful!");
            navigate("/");
        } catch (err) {
            console.error("Login failed:", err.response || err);
            setMessage("Login failed. Check your credentials.");
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
                <h2 className="text-center mb-4 text-primary">Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>
                {message && <p className="mt-3 text-center">{message}</p>}
                <div className="text-center mt-3">
                    <span>Don’t have an account? </span>
                    {/* Sign Up link not functional */}
                    <Link to="/signup" className="text-decoration-none text-secondary">Sign Up</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
