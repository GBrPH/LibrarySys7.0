import React, { useState } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

function Settings() {
    const [fullName, setFullName] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);

    const currentUsername = localStorage.getItem("username")?.trim() || "User";
    const roleString = localStorage.getItem("role")?.toUpperCase() || "MEMBER";

    const handleUpdateName = async (e) => {
        e.preventDefault();

        if (!fullName.trim()) {
            setMessage({ text: "Please enter a valid name.", type: "warning" });
            return;
        }

        setLoading(true);
        setMessage({ text: "", type: "" });

        const token = localStorage.getItem("token")?.trim();
        const storedUsername = localStorage.getItem("username")?.trim();

        if (!token || !storedUsername) {
            setMessage({ text: "Session missing. Please log in again.", type: "danger" });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/User/UpdateFullName`,
                {
                    username: storedUsername,
                    fullName: fullName.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            setMessage({ text: response.data.message || "Profile updated successfully!", type: "success" });
            setFullName("");

        } catch (err) {
            console.error("Profile update error:", err);
            const errorText = err.response?.data?.message || "Failed to update profile.";
            setMessage({ text: errorText, type: "danger" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid bg-light min-vh-100 p-0">
            <Navbar activePage="settings" />

            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">

                        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "16px", background: "linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)" }}>
                            <div className="card-body p-4 text-center text-white">
                                <div className="bg-white text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow"
                                    style={{ width: "70px", height: "70px", fontSize: "1.8rem" }}>
                                    {currentUsername.charAt(0).toUpperCase()}
                                </div>
                                <h4 className="fw-bold mb-1">{currentUsername}</h4>
                                <span className="badge bg-light text-primary px-3 py-2 rounded-pill shadow-sm">
                                    {roleString}
                                </span>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: "16px" }}>
                            <h4 className="fw-bold text-dark mb-1">Account Settings</h4>
                            <p className="text-muted small mb-4">Manage your personal profile information.</p>

                            {message.text && (
                                <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                                    {message.text}
                                    <button type="button" className="btn-close" onClick={() => setMessage({ text: "", type: "" })}></button>
                                </div>
                            )}

                            <form onSubmit={handleUpdateName}>
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark small">NEW FULL NAME</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg shadow-none"
                                        placeholder="Enter your real name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                    <div className="form-text mt-2 text-muted">
                                        This name will be used for your official library records.
                                    </div>
                                </div>

                                <hr className="text-muted my-4" />

                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary btn-lg fw-bold shadow-sm" disabled={loading}>
                                        {loading ? "Saving Changes..." : "Update Full Name"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;