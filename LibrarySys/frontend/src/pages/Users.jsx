import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

function Users() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/User/GetAll`)
            .then(res => setUsers(res.data))
            .catch(err => console.error("Error fetching users:", err));
    }, []);

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <h2>Users</h2>
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search by name or username..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td>{user.fullName}</td>
                            <td>{user.username}</td>
                            <td>{user.role}</td>
                            <td>{user.isActive ? "Active" : "Inactive"}</td>
                            <td>
                                <Link to={`/borrowing-log/${user.id}`} className="btn btn-sm btn-info">
                                    View Log
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Users;