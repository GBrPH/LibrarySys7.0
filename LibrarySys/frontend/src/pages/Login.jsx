import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

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
        <div className="container mt-5">
            <h2>Login</h2>
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
                <button type="submit" className="btn btn-primary">Login</button>
            </form>
            {message && <p className="mt-3">{message}</p>}
        </div>
    );
}

export default Login;
