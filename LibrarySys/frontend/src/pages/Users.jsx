import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

function Users() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [viewMode, setViewMode] = useState("list");
    const currentUsername = (localStorage.getItem("username") || sessionStorage.getItem("username"))?.trim();

    const [filters, setFilters] = useState({
        role: "All",
        active: "All",
        loggedIn: "All",
        username: "",
        fullName: "",
        search: ""
    });

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        const token = (localStorage.getItem("token") || sessionStorage.getItem("token"))?.trim();
        if (!token) {
            navigate("/login");
            return;
        }

        axios.get(`${process.env.REACT_APP_API_URL}/api/User/GetAllUsers`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                const rawData = Array.isArray(res.data)
                    ? res.data
                    : (res.data?.$values || res.data?.users || res.data?.data || []);
                setUsers(rawData);
            })
            .catch(err => console.error("Error fetching users:", err));
    }, [navigate]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const isUserOnline = (user) => {
        if (!user) return false;
        const isLoggedIn = user.isLoggedIn ?? user.IsLoggedIn ?? false;
        const uName = String(user.username || user.Username || "");
        return (
            isLoggedIn ||
            (currentUsername && uName.toLowerCase() === currentUsername.toLowerCase())
        );
    };

    const filteredUsers = users.filter(user => {
        const uRole = String(user.role || user.Role || "");
        const uActive = user.isActive ?? user.IsActive ?? true;
        const uName = String(user.username || user.Username || "");
        const fName = String(user.fullName || user.FullName || "");

        if (filters.role !== "All" && uRole.toLowerCase() !== filters.role.toLowerCase()) return false;
        if (filters.active === "Active" && !uActive) return false;
        if (filters.active === "Inactive" && uActive) return false;

        const online = isUserOnline(user);
        if (filters.loggedIn === "Online" && !online) return false;
        if (filters.loggedIn === "Offline" && online) return false;

        if (filters.username && !uName.toLowerCase().includes(filters.username.toLowerCase())) return false;
        if (filters.fullName && !fName.toLowerCase().includes(filters.fullName.toLowerCase())) return false;

        if (filters.search) {
            const s = filters.search.toLowerCase();
            if (!fName.toLowerCase().includes(s) && !uName.toLowerCase().includes(s)) return false;
        }

        return true;
    });

    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="p-0 min-vh-100">
            <Navbar activePage="users" />

            <div className="container-fluid py-4 px-4">
                <div className="row g-4 align-items-start">
                    <div className="col-md-3 col-lg-2">
                        <div className="p-4 glass-panel filter-sidebar border-0 shadow">
                            <h5 className="fw-bold mb-3">Filters</h5>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">ROLE</label>
                                <select className="form-select shadow-none" value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })}>
                                    <option>All</option>
                                    <option>Librarian</option>
                                    <option>Faculty</option>
                                    <option>Student</option>
                                    <option>Borrower</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">ACTIVE STATUS</label>
                                <select className="form-select shadow-none" value={filters.active} onChange={e => setFilters({ ...filters, active: e.target.value })}>
                                    <option>All</option>
                                    <option>Active</option>
                                    <option>Inactive</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">LOGGED IN</label>
                                <select className="form-select shadow-none" value={filters.loggedIn} onChange={e => setFilters({ ...filters, loggedIn: e.target.value })}>
                                    <option>All</option>
                                    <option>Online</option>
                                    <option>Offline</option>
                                </select>
                            </div>

                            <button className="btn btn-primary w-100 mt-2" onClick={() => setFilters({ role: "All", active: "All", loggedIn: "All", username: "", fullName: "", search: "" })}>
                                Reset Filters
                            </button>
                        </div>
                    </div>

                    <div className="col-md-9 col-lg-10 d-flex flex-column">
                        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                            <div className="d-flex align-items-center flex-grow-1 gap-3">
                                <div style={{ minWidth: "220px" }}>
                                    <h5 className="fw-bold mb-0 text-nowrap text-white">
                                        Users <span className="text-white-50 fw-normal">({filteredUsers.length} total)</span>
                                    </h5>
                                </div>

                                <div className="input-group" style={{ maxWidth: "400px" }}>
                                    <input type="text" className="form-control shadow-none bg-white text-dark border-0" placeholder="Search users..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                <div className="btn-group" role="group">
                                    <button className={`btn ${viewMode === "grid" ? "btn-light" : "btn-outline-light"}`} onClick={() => setViewMode("grid")} title="Grid View">
                                        <span>&#9632;</span>
                                    </button>
                                    <button className={`btn ${viewMode === "list" ? "btn-light" : "btn-outline-light"}`} onClick={() => setViewMode("list")} title="List View">
                                        <span>&#9776;</span>
                                    </button>
                                </div>
                                <Link to="/Settings" className="btn btn-outline-light" title="Settings">
                                    <span>&#9881;</span>
                                </Link>
                            </div>
                        </div>

                        <div className="d-flex flex-column">
                            {viewMode === "list" ? (
                                <div className="card border-0 shadow glass-panel">
                                    <div className="card-body p-4">
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead>
                                                    <tr className="small fw-bold">
                                                        <th>ID</th>
                                                        <th>FULL NAME</th>
                                                        <th>USERNAME</th>
                                                        <th>ROLE</th>
                                                        <th>ACTIVE</th>
                                                        <th>LOGGED IN</th>
                                                        <th>ACTIONS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedUsers.map(user => {
                                                        const userId = user.id || user.Id;
                                                        const fullName = user.fullName || user.FullName || "User";
                                                        const username = user.username || user.Username || "";
                                                        const role = user.role || user.Role || "";
                                                        const isActive = user.isActive ?? user.IsActive ?? true;
                                                        const online = isUserOnline(user);

                                                        return (
                                                            <tr key={userId}>
                                                                <td className="fw-semibold">{userId}</td>
                                                                <td>
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: "30px", height: "30px", fontSize: "0.8rem" }}>
                                                                            {fullName.charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <span className="text-truncate d-inline-block fw-bold" style={{ maxWidth: "200px" }}>
                                                                            {fullName}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td>{username}</td>
                                                                <td>
                                                                    <span className="badge bg-light text-dark border px-2 py-1">
                                                                        {role}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className={`badge ${isActive ? "bg-success" : "bg-secondary"}`}>
                                                                        {isActive ? "Active" : "Inactive"}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className={`badge ${online ? "bg-success" : "bg-secondary"}`}>
                                                                        {online ? "Online" : "Offline"}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <Link to={`/users/update/${userId}`} className="btn btn-warning btn-sm me-2">Update</Link>
                                                                    <Link to={`/users/delete/${userId}`} className="btn btn-danger btn-sm">Delete</Link>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    {filteredUsers.length === 0 && (
                                                        <tr>
                                                            <td colSpan="7" className="text-center text-muted py-4">No records match filters</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="row g-4">
                                    {paginatedUsers.map(user => {
                                        const userId = user.id || user.Id;
                                        const fullName = user.fullName || user.FullName || "User";
                                        const username = user.username || user.Username || "";
                                        const role = user.role || user.Role || "";
                                        const isActive = user.isActive ?? user.IsActive ?? true;
                                        const online = isUserOnline(user);

                                        return (
                                            <div className="col-12 col-md-6 col-xl-4 d-flex" key={userId}>
                                                <div className="card h-100 w-100 border-0 shadow-sm p-3 glass-panel d-flex flex-column justify-content-between">
                                                    <div>
                                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                                            <div className="d-flex align-items-center">
                                                                <div className="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: "50px", height: "50px", fontSize: "1.2rem" }}>
                                                                    {fullName.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <h5 className="fw-bold mb-0 text-truncate" style={{ maxWidth: "150px" }} title={fullName}>{fullName}</h5>
                                                                    <p className="small mb-0 opacity-75">@{username}</p>
                                                                </div>
                                                            </div>
                                                            <span className="badge bg-light text-dark border">{role}</span>
                                                        </div>

                                                        <div className="d-flex gap-2 mb-4">
                                                            <span className={`badge ${isActive ? "bg-success" : "bg-secondary"}`}>
                                                                {isActive ? "Active" : "Inactive"}
                                                            </span>
                                                            <span className={`badge ${online ? "bg-success" : "bg-secondary"}`}>
                                                                {online ? "Online" : "Offline"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex justify-content-end align-items-center mt-auto pt-3 border-top" style={{ borderColor: "rgba(30, 41, 59, 0.15)" }}>
                                                        <div className="d-flex gap-2">
                                                            <Link to={`/users/update/${userId}`} className="btn btn-warning btn-sm">✎</Link>
                                                            <Link to={`/users/delete/${userId}`} className="btn btn-danger btn-sm">🗑</Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {filteredUsers.length === 0 && <div className="col-12 text-center text-white py-5">No users found.</div>}
                                </div>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-4 mb-2">
                                <nav>
                                    <ul className="pagination shadow-sm mb-0">
                                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                            <button
                                                className="page-link bg-white text-dark border-0 shadow-sm"
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            >
                                                Previous
                                            </button>
                                        </li>
                                        <li className="page-item disabled">
                                            <span className="page-link text-dark bg-white fw-semibold px-4 border-0 shadow-sm">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                        </li>
                                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                            <button
                                                className="page-link bg-white text-dark border-0 shadow-sm"
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            >
                                                Next
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Users;