import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

function Users() {
    const [users, setUsers] = useState([]);
    const [viewMode, setViewMode] = useState("list");
    const currentUsername = localStorage.getItem("username");

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
        const token = localStorage.getItem("token");
        if (!token) return;

        axios.get(`${process.env.REACT_APP_API_URL}/api/User/GetAllUsers`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setUsers(res.data || []))
            .catch(err => console.error("Error fetching users:", err));
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const isUserOnline = (user) => {
        if (!user) return false;
        return (
            user.isLoggedIn ||
            (currentUsername && user.username?.toLowerCase() === currentUsername.toLowerCase())
        );
    };

    const filteredUsers = users.filter(user => {
        if (filters.role !== "All" && user.role !== filters.role) return false;
        if (filters.active === "Active" && !user.isActive) return false;
        if (filters.active === "Inactive" && user.isActive) return false;

        const online = isUserOnline(user);
        if (filters.loggedIn === "Online" && !online) return false;
        if (filters.loggedIn === "Offline" && online) return false;

        if (filters.username && !user.username.toLowerCase().includes(filters.username.toLowerCase())) return false;
        if (filters.fullName && !user.fullName.toLowerCase().includes(filters.fullName.toLowerCase())) return false;

        if (filters.search && !(
            (user.fullName && user.fullName.toLowerCase().includes(filters.search.toLowerCase())) ||
            (user.username && user.username.toLowerCase().includes(filters.search.toLowerCase()))
        )) return false;

        return true;
    });

    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="p-0 min-vh-100">
            <Navbar activePage="users" />

            <div className="container-fluid py-4 px-4">
                <div className="row g-4">
                    {/* Sidebar Filters - Frosted Glass Panel */}
                    <div className="col-md-3 col-lg-2">
                        <div className="p-4 glass-panel border-0 shadow" style={{ minHeight: "calc(100vh - 120px)" }}>
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

                    {/* Main Content Area */}
                    <div className="col-md-9 col-lg-10 d-flex flex-column">
                        {/* Top Control Bar */}
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div className="d-flex align-items-center flex-grow-1">
                                <div style={{ minWidth: "220px" }}>
                                    <h5 className="fw-bold mb-0 text-nowrap text-white">
                                        Users <span className="text-white-50 fw-normal">({filteredUsers.length} total)</span>
                                    </h5>
                                </div>

                                <div className="input-group" style={{ width: "500px" }}>
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

                        {/* DYNAMIC RENDERING BLOCK */}
                        <div className="flex-grow-1 d-flex flex-column">
                            {viewMode === "list" ? (
                                <div className="card border-0 shadow flex-grow-1 glass-panel">
                                    <div className="card-body p-4">
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
                                                    const online = isUserOnline(user);
                                                    return (
                                                        <tr key={user.id}>
                                                            <td className="fw-semibold">{user.id}</td>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    <div className="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: "30px", height: "30px", fontSize: "0.8rem" }}>
                                                                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                                                                    </div>
                                                                    <span className="text-truncate d-inline-block fw-bold" style={{ maxWidth: "200px" }}>
                                                                        {user.fullName}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td>{user.username}</td>
                                                            <td>
                                                                <span className="badge bg-light text-dark border px-2 py-1">
                                                                    {user.role}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${user.isActive ? "bg-success" : "bg-secondary"}`}>
                                                                    {user.isActive ? "Active" : "Inactive"}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${online ? "bg-success" : "bg-secondary"}`}>
                                                                    {online ? "Online" : "Offline"}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <Link to={`/users/update/${user.id}`} className="btn btn-warning btn-sm me-2">Update</Link>
                                                                <Link to={`/users/delete/${user.id}`} className="btn btn-danger btn-sm">Delete</Link>
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
                            ) : (
                                <div className="row g-4 align-content-start flex-grow-1">
                                    {paginatedUsers.map(user => {
                                        const online = isUserOnline(user);
                                        return (
                                            <div className="col-12 col-md-6 col-xl-4" key={user.id}>
                                                <div className="card h-100 border-0 shadow-sm p-3 glass-panel">
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <div className="d-flex align-items-center">
                                                            <div className="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "50px", height: "50px", fontSize: "1.2rem" }}>
                                                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                                                            </div>
                                                            <div>
                                                                <h5 className="fw-bold mb-0 text-truncate" style={{ maxWidth: "150px" }} title={user.fullName}>{user.fullName}</h5>
                                                                <p className="small mb-0 opacity-75">@{user.username}</p>
                                                            </div>
                                                        </div>
                                                        <span className="badge bg-light text-dark border">{user.role}</span>
                                                    </div>

                                                    <div className="d-flex gap-2 mb-4">
                                                        <span className={`badge ${user.isActive ? "bg-success" : "bg-secondary"}`}>
                                                            {user.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                        <span className={`badge ${online ? "bg-success" : "bg-secondary"}`}>
                                                            {online ? "Online" : "Offline"}
                                                        </span>
                                                    </div>

                                                    <div className="d-flex justify-content-end align-items-center mt-auto pt-3 border-top" style={{ borderColor: "rgba(30, 41, 59, 0.15) !important" }}>
                                                        <div className="d-flex gap-2">
                                                            <Link to={`/users/update/${user.id}`} className="btn btn-warning btn-sm">✎</Link>
                                                            <Link to={`/users/delete/${user.id}`} className="btn btn-danger btn-sm">🗑</Link>
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

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-auto pt-4 mb-2">
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