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
        if (filters.role === "Librarian" && user.role !== "Librarian") return false;
        if (filters.role === "Faculty" && user.role !== "Faculty") return false;
        if (filters.role === "Student" && user.role !== "Student") return false;
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
                <div className="col-md-3 col-lg-2 bg-light border-end vh-100 p-3">
                    <h5>Filters</h5>
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
                    <div className="d-grid gap-2">
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
