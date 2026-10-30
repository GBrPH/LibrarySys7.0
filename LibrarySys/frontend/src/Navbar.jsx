import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Navbar({ activePage }) {
    const navigate = useNavigate();

    const username = localStorage.getItem("username") || sessionStorage.getItem("username") || "User";
    const userInitial = username.charAt(0).toUpperCase();

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const roleString = (localStorage.getItem("role") || sessionStorage.getItem("role"))?.toUpperCase() || "";
    const usernameString = (localStorage.getItem("username") || sessionStorage.getItem("username"))?.toUpperCase() || "";

    const isPrivilegedUser = roleString.includes("LIBRARIAN") || roleString.includes("ADMIN") || usernameString === "HMIR";

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear(); 
        navigate("/login");
    };

    return (
        <nav className="curved-navbar">
            {/* Brand Logo */}
            <div className="navbar-brand-container">
                <Link
                    className="text-white fw-bold fs-4 text-decoration-none"
                    to="/"
                    style={{ caretColor: "transparent", userSelect: "none", outline: "none" }}> LibrarySys </Link>
            </div>

            <ul className="nav-links mx-auto">
                <li className={activePage === "dashboard" ? "active" : ""}>
                    <Link to="/dashboard">Dashboard</Link>
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
                    <div className="d-flex align-items-center gap-3">
                        <button onClick={handleLogout} className="btn btn-danger fw-semibold px-4 shadow-sm">
                            Logout
                        </button>

                        <div
                            className="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                            style={{ width: "40px", height: "40px", fontSize: "1.2rem" }}
                            title={username}
                        >
                            {userInitial}
                        </div>

                    </div>
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