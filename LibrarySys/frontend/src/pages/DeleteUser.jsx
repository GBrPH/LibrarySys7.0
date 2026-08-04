import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function DeleteUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/User/GetUserById/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(res => setUser(res.data))
            .catch(err => console.error("Error fetching user:", err));
    }, [id]);

    const handleDelete = async () => {
        try {
            axios.delete(`${process.env.REACT_APP_API_URL}/api/User/DeleteUser/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setMessage("User deleted successfully!");
            navigate("/users");
        } catch (err) {
            console.error("Error deleting user:", err);
            setMessage("Failed to delete user.");
        }
    };

    return (
        <div className="container-fluid">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">LibrarySys</Link>
                </div>
            </nav>

            <div className="row">
                <div className="col-md-3 col-lg-2 bg-light border-end vh-100 p-3">
                    <Link to="/users" className="btn btn-secondary w-100">Back to Users</Link>
                </div>
                <div className="col-md-9 col-lg-10 p-4">
                    <h2 className="mb-4">Delete User</h2>
                    <div className="card shadow-sm">
                        <div className="card-body">
                            {user ? (
                                <>
                                    <p>Are you sure you want to delete <strong>{user.fullName}</strong> ({user.username})?</p>
                                    <p>Role: {user.role} | Status: {user.isActive ? "Active" : "Inactive"}</p>
                                    <button onClick={handleDelete} className="btn btn-danger">Confirm Delete</button>
                                </>
                            ) : (
                                <p>Loading user details...</p>
                            )}
                            {message && <p className="mt-3 text-info">{message}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeleteUser;
