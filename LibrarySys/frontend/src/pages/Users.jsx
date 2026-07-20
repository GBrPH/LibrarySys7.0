import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Users() {
    const [users, setUsers] = useState([]);
    const [filters, setFilters] = useState({ role: "All" });

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/User/GetAllUsers`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(res => setUsers(res.data || []))
            .catch(err => console.error("Error fetching users:", err));
    }, []);

    const filteredUsers = users.filter(user => {
        // Role filter
        if (filters.role !== "All" && user.role !== filters.role) return false;

        // Active filter
        if (filters.active === "Active" && !user.isActive) return false;
        if (filters.active === "Inactive" && user.isActive) return false;

        // Logged In filter
        if (filters.loggedIn === "Online" && !user.isLoggedIn) return false;
        if (filters.loggedIn === "Offline" && user.isLoggedIn) return false;

        // Username filter
        if (filters.username && !user.username.toLowerCase().includes(filters.username.toLowerCase())) return false;

        // Full Name filter
        if (filters.fullName && !user.fullName.toLowerCase().includes(filters.fullName.toLowerCase())) return false;

        return true;
    });


    return (
        <div className="container-fluid">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">LibrarySys</Link>
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

            <div className="row">
                {/* Sidebar */}
                {/* Sidebar */}
                <div className="col-md-3 col-lg-2 bg-light border-end vh-100 p-3">
                    <h5>Filters</h5>

                    {/* Role */}
                    <div className="mb-3">
                        <label className="form-label">Role</label>
                        <select
                            className="form-select"
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
                        <label className="form-label">Active Status</label>
                        <select
                            className="form-select"
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
                        <label className="form-label">Logged In</label>
                        <select
                            className="form-select"
                            value={filters.loggedIn}
                            onChange={e => setFilters({ ...filters, loggedIn: e.target.value })}
                        >
                            <option>All</option>
                            <option>Online</option>
                            <option>Offline</option>
                        </select>
                    </div>

                    {/* Search by Username */}
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by username"
                            value={filters.username || ""}
                            onChange={e => setFilters({ ...filters, username: e.target.value })}
                        />
                    </div>

                    {/* Search by Full Name */}
                    <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by full name"
                            value={filters.fullName || ""}
                            onChange={e => setFilters({ ...filters, fullName: e.target.value })}
                        />
                    </div>

                    {/* Reset Filters */}
                    <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => setFilters({ role: "All", active: "All", loggedIn: "All", username: "", fullName: "" })}
                    >
                        Reset Filters
                    </button>

                    {/* Add User */}
                    <div className="d-grid gap-2 mt-3">
                        <Link to="/users/add" className="btn btn-success">Add User</Link>
                    </div>
                </div>


                {/* Main content */}
                <div className="col-md-9 col-lg-10 p-4">
                    <h2 className="mb-4">Users</h2>
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5>All Users</h5>
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th><th>Full Name</th><th>Username</th><th>Role</th><th>Active</th><th>Logged In</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{user.fullName}</td>
                                            <td>{user.username}</td>
                                            <td>{user.role}</td>
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
                                        <tr><td colSpan="7" className="text-center text-muted">No records match filters</td></tr>
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
