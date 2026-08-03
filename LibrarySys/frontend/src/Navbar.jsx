import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Navbar({ activePage }) {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm px-3">
            <div className="container-fluid">
                <Link className="navbar-brand fw-bold" to="/">LibrarySys</Link>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className={`nav-link ${activePage === "dashboard" ? "active" : ""}`} to="/">Dashboard</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${activePage === "books" ? "active" : ""}`} to="/books">Books</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${activePage === "users" ? "active" : ""}`} to="/users">Users</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${activePage === "logs" ? "active" : ""}`} to="/borrowing-log">Borrowing Log</Link>
                        </li>
                    </ul>
                    <div className="d-flex ms-auto align-items-center">
                        {token ? (
                            <button onClick={handleLogout} className="btn btn-outline-danger fw-semibold px-3">
                                Logout
                            </button>
                        ) : (
                            <>
                                <Link className="btn btn-outline-light me-3" to="/login">Login</Link>
                                <Link className="btn btn-primary" to="/signup">Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;