import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function UpdateUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("Student");
    const [isActive, setIsActive] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/User/GetUserById/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(res => {
                setFullName(res.data.fullName);
                setUsername(res.data.username);
                setRole(res.data.role);
                setIsActive(res.data.isActive);
            })
            .catch(err => console.error("Error fetching user:", err));
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/User/UpdateUser/${id}`, {
                id: parseInt(id),
                fullName,
                username,
                role,
                isActive
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setMessage("User updated successfully!");
            navigate("/users");
        } catch (err) {
            console.error("Error updating user:", err);
            setMessage("Failed to update user.");
        }
    };

    return (
        <div className="container-fluid p-0 bg-light min-vh-100">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm px-3">
                <div className="container-fluid">
                    <Link className="navbar-brand fw-bold" to="/">LibrarySys</Link>
                </div>
            </nav>

            <div className="row g-0">
                <div className="col-md-3 col-lg-2 bg-white border-end vh-100 p-3 shadow-sm">
                    <Link to="/users" className="btn btn-secondary w-100">Back to Users</Link>
                </div>
                <div className="col-md-9 col-lg-10 p-4">
                    <h2 className="fw-bold mb-4">Update User</h2>
                    <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">FULL NAME</label>
                                    <input type="text" className="form-control" value={fullName}
                                        onChange={e => setFullName(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">USERNAME</label>
                                    <input type="text" className="form-control" value={username}
                                        onChange={e => setUsername(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">ROLE</label>
                                    <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                                        <option>Librarian</option>
                                        <option>Faculty</option>
                                        <option>Student</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">ACTIVE STATUS</label>
                                    <select className="form-select"
                                        value={isActive ? "Active" : "Inactive"}
                                        onChange={e => setIsActive(e.target.value === "Active")}>
                                        <option>Active</option>
                                        <option>Inactive</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-warning fw-semibold text-white">Update User</button>
                            </form>
                            {message && <p className="mt-3 text-info">{message}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UpdateUser;