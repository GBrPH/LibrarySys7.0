import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Navbar({ activePage }) {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const roleString = localStorage.getItem("role")?.toUpperCase() || "";
    const usernameString = localStorage.getItem("username")?.toUpperCase() || "";

    // Look for Librarian role, Admin role, OR the explicit HMIR username
    const isPrivilegedUser = roleString.includes("LIBRARIAN") || roleString.includes("ADMIN") || usernameString === "HMIR";

    const handleLogout = () => {
        localStorage.clear(); // Clears everything
        navigate("/login");
    };

    return (
        <nav className="curved-navbar">
            <div className="navbar-brand-container">
                <Link className="text-white fw-bold fs-4 text-decoration-none" to="/">
                    LibrarySys
                </Link>
            </div>

            <ul className="nav-links mx-auto">
                <li className={activePage === "dashboard" ? "active" : ""}>
                    <Link to="/">Dashboard</Link>
                </li>
                <li className={activePage === "books" ? "active" : ""}>
                    <Link to="/books">Books</Link>
                </li>

                {isPrivilegedUser && (
                    <li className={activePage === "users" ? "active" : ""}>
                        <Link to="/users">Users</Link>
                    </li>
                )}

                <li className={activePage === "borrow" ? "active" : ""}>
                    <Link to="/borrow">Borrow</Link>
                </li>

                {isPrivilegedUser && (
                    <li className={activePage === "borrowing-log" || activePage === "logs" ? "active" : ""}>
                        <Link to="/borrowing-log">Logs</Link>
                    </li>
                )}
            </ul>

            <div className="auth-buttons ms-auto pe-3">
                {token ? (
                    <button onClick={handleLogout} className="btn btn-danger fw-semibold px-4 shadow-sm">
                        Logout
                    </button>
                ) : (
                    <>
                        <Link className="btn btn-outline-primary me-3" to="/login">Login</Link>
                        <Link className="btn btn-primary shadow-sm" to="/signup">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;