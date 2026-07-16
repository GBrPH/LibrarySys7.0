import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Users() {
    const [users, setUsers] = useState([]);
    const [filters, setFilters] = useState({ status: "All" });

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/User/GetAll`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(res => setUsers(res.data || []))
            .catch(err => console.error("Error fetching users:", err));
    }, []);

    const filteredUsers = users.filter(user => {
        if (filters.status === "Active" && !user.isActive) return false;
        if (filters.status === "Inactive" && user.isActive) return false;
        return true;
    });

    return (
        <div className="container-fluid">
            {/* Top Navbar (same as Dashboard) */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">LibrarySys</Link>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item"><Link className="nav-link" to="/">Dashboard</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/books">Books</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/users">Users</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/borrowing-log">Borrowing Log</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/reports">Reports</Link></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="row">
                {/* Sidebar filter */}
                <div className="col-md-3 col-lg-2 bg-light border-end vh-100 p-3">
                    <h5>Filters</h5>
                    <div className="mb-3">
                        <label className="form-label">Status</label>
                        <select
                            className="form-select"
                            value={filters.status}
                            onChange={e => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option>All</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Main content */}
                <div className="col-md-9 col-lg-10 p-4">
                    <h2 className="mb-4">Users</h2>

                    {/* Manage Users section */}
                    <div className="mb-4">
                        <h5>Manage Users</h5>
                        <div className="d-flex gap-2">
                            <button className="btn btn-primary">Add User</button>
                            <button className="btn btn-warning">Update User</button>
                            <button className="btn btn-danger">Delete User</button>
                        </div>
                    </div>

                    {/* All Users table */}
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5>All Users</h5>
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th><th>Name</th><th>Email</th><th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{user.fullName}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`badge ${user.isActive ? "bg-success" : "bg-secondary"}`}>
                                                    {user.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr><td colSpan="4" className="text-center text-muted">No records match filters</td></tr>
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
