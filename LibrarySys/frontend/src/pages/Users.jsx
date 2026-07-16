import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/theme.css";

function Users() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/User/GetAll`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(res => setUsers(res.data))
            .catch(err => console.error("Error fetching users:", err));
    };

    const handleSave = () => {
        if (selectedUser.id) {
            axios.put(`${process.env.REACT_APP_API_URL}/User/UpdateUser/${selectedUser.id}`, selectedUser)
                .then(fetchUsers);
        } else {
            axios.post(`${process.env.REACT_APP_API_URL}/User/RegisterUser`, selectedUser)
                .then(fetchUsers);
        }
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleDelete = id => {
        axios.delete(`${process.env.REACT_APP_API_URL}/User/DeleteUser/${id}`)
            .then(fetchUsers);
    };

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <h2>Users</h2>
            <div className="d-flex mb-3">
                <input className="form-control me-2" placeholder="Search by name or username..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                <button className="btn btn-success"
                    onClick={() => { setSelectedUser({}); setShowModal(true); }}>
                    Add User
                </button>
            </div>
            <table className="table table-striped">
                <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td>{user.fullName}</td>
                            <td>{user.username}</td>
                            <td>
                                <span className={`badge ${user.role === "Librarian" ? "bg-primary" :
                                        user.role === "Faculty" ? "bg-warning" :
                                            user.role === "Student" ? "bg-secondary" : "bg-info"
                                    }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td>
                                <span className={`badge ${user.isActive ? "bg-success" : "bg-danger"}`}>
                                    {user.isActive ? "Active" : "Inactive"}
                                </span>
                            </td>
                            <td>
                                <button className="btn btn-sm btn-primary me-2"
                                    onClick={() => { setSelectedUser(user); setShowModal(true); }}>Edit</button>
                                <button className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(user.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal show d-block">
                    <div className="modal-dialog"><div className="modal-content">
                        <div className="modal-header">
                            <h5>{selectedUser.id ? "Edit User" : "Add User"}</h5>
                            <button className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <input className="form-control mb-2" placeholder="Full Name"
                                value={selectedUser.fullName || ""}
                                onChange={e => setSelectedUser({ ...selectedUser, fullName: e.target.value })} />
                            <input className="form-control mb-2" placeholder="Username"
                                value={selectedUser.username || ""}
                                onChange={e => setSelectedUser({ ...selectedUser, username: e.target.value })} />
                            <select className="form-select mb-2"
                                value={selectedUser.role || "Borrower"}
                                onChange={e => setSelectedUser({ ...selectedUser, role: e.target.value })}>
                                <option value="Borrower">Borrower</option>
                                <option value="Librarian">Librarian</option>
                                <option value="Faculty">Faculty</option>
                                <option value="Student">Student</option>
                            </select>
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input"
                                    checked={selectedUser.isActive || false}
                                    onChange={e => setSelectedUser({ ...selectedUser, isActive: e.target.checked })} />
                                <label className="form-check-label">Active</label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Save</button>
                        </div>
                    </div></div>
                </div>
            )}
        </div>
    );
}

export default Users;
