import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Users() {
    const [users, setUsers] = useState([]);
    const [filters, setFilters] = useState({
        role: "All",
        active: "All",
        loggedIn: "All",
        username: "",
        fullName: "",
        search: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) return;

        axios.get(`${process.env.REACT_APP_API_URL}/api/User/GetAllUsers`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setUsers(res.data || []))
            .catch(err => console.error("Error fetching users:", err));
    }, []);

    const filteredUsers = users.filter(user => {
        if (filters.role !== "All" && user.role !== filters.role) return false;

        if (filters.active === "Active" && !user.isActive) return false;
        if (filters.active === "Inactive" && user.isActive) return false;

        if (filters.loggedIn === "Online" && !user.isLoggedIn) return false;
        if (filters.loggedIn === "Offline" && user.isLoggedIn) return false;

        if (filters.username && !user.username.toLowerCase().includes(filters.username.toLowerCase())) return false;

        if (filters.fullName && !user.fullName.toLowerCase().includes(filters.fullName.toLowerCase())) return false;

        if (filters.search && !(
            user.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
            user.username.toLowerCase().includes(filters.search.toLowerCase())
        )) return false;

        return true;
    });

    return (
        <div className="container-fluid p-0 bg-light min-vh-100">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm px-3">
                <div className="container-fluid">
                    <Link className="navbar-brand fw-bold" to="/">LibrarySys</Link>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item"><Link className="nav-link" to="/">Dashboard</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/books">Books</Link></li>
                            <li className="nav-item"><Link className="nav-link active" to="/users">Users</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/borrowing-log">Borrowing Log</Link></li>
                        </ul>
                        <div className="d-flex ms-auto">
                            <Link className="btn btn-outline-light me-3" to="/login">Login</Link>
                            <Link className="btn btn-primary" to="/signup">Sign Up</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="row g-0">
                {/* Sidebar Filters */}
                <div className="col-md-3 col-lg-2 bg-white border-end vh-100 p-3 shadow-sm">
                    <h5 className="fw-bold mb-3">Filters</h5>

                    {/* Role */}
                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">ROLE</label>
                        <select
                            className="form-select shadow-none"
                            value={filters.role}
                            onChange={e => setFilters({ ...filters, role: e.target.value })}
                        >
                            <option>All</option>
                            <option>Librarian</option>
                            <option>Faculty</option>
                            <option>Student</option>
                        </select>
                    </div>

                    {/* Active Status */}
                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">ACTIVE STATUS</label>
                        <select
                            className="form-select shadow-none"
                            value={filters.active}
                            onChange={e => setFilters({ ...filters, active: e.target.value })}
                        >
                            <option>All</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                    </div>

                    {/* Logged In Status */}
                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">LOGGED IN</label>
                        <select
                            className="form-select shadow-none"
                            value={filters.loggedIn}
                            onChange={e => setFilters({ ...filters, loggedIn: e.target.value })}
                        >
                            <option>All</option>
                            <option>Online</option>
                            <option>Offline</option>
                        </select>
                    </div>

                    {/* Reset Filters */}
                    <button
                        className="btn btn-outline-secondary w-100 mt-2"
                        onClick={() => setFilters({ role: "All", active: "All", loggedIn: "All", username: "", fullName: "", search: "" })}
                    >
                        Reset Filters
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="col-md-9 col-lg-10 p-4">
                    {/* Top Control Bar */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h5 className="fw-bold mb-0">
                            Users <span className="text-muted fw-normal">({filteredUsers.length} total)</span>
                        </h5>

                        <div className="input-group w-50">
                            <input
                                type="text"
                                className="form-control shadow-none"
                                placeholder="Search users..."
                                value={filters.search}
                                onChange={e => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>

                        <div className="d-flex align-items-center">
                            <div className="btn-group me-2" role="group">
                                <button className="btn btn-outline-secondary" title="Grid View">
                                    <span>&#9632;</span>
                                </button>
                                <button className="btn btn-outline-secondary" title="List View">
                                    <span>&#9776;</span>
                                </button>
                            </div>
                            <Link to="/settings" className="btn btn-outline-secondary me-2" title="Settings">
                                <span>&#9881;</span>
                            </Link>
                            <Link to="/users/add" className="btn btn-success fw-semibold">Add User</Link>
                        </div>
                    </div>

                    {/* Users Table Card */}
                    <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
                        <div className="card-body p-4">
                            <table className="table table-hover align-middle mb-0">
                                <thead>
                                    <tr className="text-muted small">
                                        <th>ID</th>
                                        <th>FULL NAME</th>
                                        <th>USERNAME</th>
                                        <th>ROLE</th>
                                        <th>ACTIVE</th>
                                        <th>LOGGED IN</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td className="fw-semibold">{user.id}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center me-2"
                                                        style={{ width: "30px", height: "30px", fontSize: "0.8rem" }}>
                                                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                                                    </div>
                                                    <span className="fw-bold text-dark">{user.fullName}</span>
                                                </div>
                                            </td>
                                            <td>{user.username}</td>
                                            <td>
                                                <span className="badge bg-light text-dark border px-2 py-1">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${user.isActive ? "bg-success" : "bg-secondary"}`}>
                                                    {user.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${user.isLoggedIn ? "bg-info" : "bg-secondary"}`}>
                                                    {user.isLoggedIn ? "Online" : "Offline"}
                                                </span>
                                            </td>
                                            <td>
                                                <Link to={`/users/update/${user.id}`} className="btn btn-warning btn-sm me-2">Update</Link>
                                                <Link to={`/users/delete/${user.id}`} className="btn btn-danger btn-sm">Delete</Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="text-center text-muted py-4">No records match filters</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Users;