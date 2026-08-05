import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // 1. Import useNavigate
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate(); // 2. Initialize navigate

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/Auth/Login`,
                { username, password }
            );

            const token = res.data.token || res.data.Token;

            if (!token) {
                setMessage("Login failed: Server did not return a valid token.");
                return;
            }

            localStorage.setItem("token", token);
            localStorage.setItem("username", username);

            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const decodedToken = JSON.parse(jsonPayload);
                const userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
                    || decodedToken.role || decodedToken.Role || res.data.role || res.data.Role || "Borrower";

                localStorage.setItem("role", userRole);
            } catch (decodeError) {
                console.error("Failed to decode token for role:", decodeError);
                localStorage.setItem("role", "Borrower");
            }

            setMessage("Login successful!");

            // 3. Navigate smoothly without breaking the path or reloading the page
            navigate("/dashboard");

        } catch (err) {
            console.error("Login failed:", err.response || err);
            setMessage("Login failed. Check your credentials.");
        }
    };

    return (
        <div className="position-relative vh-100 w-100 overflow-hidden bg-white d-flex align-items-center justify-content-center">
            {/* Top Waves */}
            <div className="position-absolute top-0 start-0 w-100" style={{ height: "45vh", zIndex: 1 }}>
                <svg viewBox="0 0 1440 320" className="w-100 h-100" preserveAspectRatio="none">
                    <path fill="#8ebafd" d="M0,192L80,181.3C160,171,320,149,480,165.3C640,181,800,235,960,240C1120,245,1280,203,1360,181.3L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
                    <path fill="#2575fc" d="M0,128L60,112C120,96,240,64,360,85.3C480,107,600,181,720,197.3C840,213,960,171,1080,144C1200,117,1320,107,1380,101.3L1440,96L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
                </svg>
            </div>

            {/* Bottom Wave */}
            <div className="position-absolute bottom-0 start-0 w-100" style={{ height: "30vh", zIndex: 1 }}>
                <svg viewBox="0 0 1440 320" className="w-100 h-100" preserveAspectRatio="none">
                    <path fill="#2575fc" d="M0,192L80,202.7C160,213,320,235,480,213.3C640,192,800,128,960,122.7C1120,117,1280,171,1360,197.3L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
                </svg>
            </div>

            {/* Login Card Container */}
            <div className="card shadow-lg p-4 rounded-4 border-0 position-relative" style={{ maxWidth: "420px", width: "90%", zIndex: 2 }}>
                <h2 className="text-center mb-4 fw-bold" style={{ color: "#2575fc" }}>Login</h2>

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label text-secondary fw-semibold">Username</label>
                        <input
                            type="text"
                            className="form-control form-control-lg fs-6 shadow-none"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label text-secondary fw-semibold">Password</label>
                        <input
                            type="password"
                            className="form-control form-control-lg fs-6 shadow-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 btn-lg fs-6 shadow-sm">
                        Login
                    </button>
                </form>

                {message && <p className={`mt-3 text-center mb-0 fw-semibold ${message.includes("failed") ? "text-danger" : "text-success"}`}>{message}</p>}

                <div className="text-center mt-4">
                    <span className="text-muted">Don’t have an account? </span>
                    <Link to="/signup" className="text-decoration-none fw-semibold" style={{ color: "#2575fc" }}>Sign Up</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;