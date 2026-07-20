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
            .then(res => {
                console.log("Users API response:", res.data);
                setUsers(res.data || []);
            })
            .catch(err => {
                console.error("Error fetching users:", err.response || err);
                alert(`Failed to fetch users: ${err.response?.status} ${err.response?.statusText}`);
            });
    }, []);

    const filteredUsers = users.filter(user => {
        if (filters.role !== "All" && user.role !== filters.role) return false;
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
                    </div>
                </div>
            </nav>

            <div className="row">
                {/* Sidebar filter */}
                <div className="col-md-3 col-lg-2 bg-light border-end vh-100 p-3">
                    <h5>Filters</h5>
                    <label className="form-label">Role</label>
                    <select
                        className="form-select"
                        value={filters.role}
                        onChange={e => setFilters({ ...filters, role: e.target.value })}
                    >
                        <option>All</option>
                        <option>Librarian</option>
                        <option>Faculty</option>
                        <option>Borrower</option>
                    </select>
                </div>

                {/* Main content */}
                <div className="col-md-9 col-lg-10 p-4">
                    <h2 className="mb-4">Users</h2>

                    {/* Manage Users */}
                    <div className="mb-4">
                        <h5>Manage Users</h5>
                        <div className="d-flex gap-2">
                            <button className="btn btn-primary">Add User</button>
                            <button className="btn btn-warning">Update User</button>
                            <button className="btn btn-danger">Delete User</button>
                        </div>
                    </div>

                    {/* Users table */}
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5>All Users</h5>
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th><th>Full Name</th><th>Username</th><th>Role</th><th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{user.fullName}</td>
                                            <td>{user.username}</td>
                                            <td>
                                                <span className={`badge ${user.role === "Librarian" ? "bg-primary" : "bg-secondary"}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${user.isActive ? "bg-success" : "bg-danger"}`}>
                                                    {user.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr><td colSpan="5" className="text-center text-muted">No records match filters</td></tr>
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
