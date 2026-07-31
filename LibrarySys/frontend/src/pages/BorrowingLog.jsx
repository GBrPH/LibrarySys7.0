import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function BorrowLog() {
    const [logs, setLogs] = useState([]);
    const [filters, setFilters] = useState({
        status: "All",
        username: "",
        bookTitle: "",
        search: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) return;

        // Uses explicit /api/ path matching your standardized setup
        axios.get(`${process.env.REACT_APP_API_URL}/api/BorrowingLog/GetAllLog`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setLogs(res.data || []))
            .catch(err => console.error("Error fetching borrowing logs:", err));
    }, []);

    const filteredLogs = logs.filter(log => {
        // Status Filter
        if (filters.status === "Active" && log.returnDate) return false;
        if (filters.status === "Returned" && !log.returnDate) return false;
        if (filters.status === "Overdue" && !log.isOverdue) return false;

        // Specific Field Filters
        if (filters.username && !log.username?.toLowerCase().includes(filters.username.toLowerCase())) return false;
        if (filters.bookTitle && !log.bookTitle?.toLowerCase().includes(filters.bookTitle.toLowerCase())) return false;

        // Top Search Bar Filter (Username or Book Title)
        if (filters.search && !(
            (log.username && log.username.toLowerCase().includes(filters.search.toLowerCase())) ||
            (log.bookTitle && log.bookTitle.toLowerCase().includes(filters.search.toLowerCase()))
        )) return false;

        return true;
    });

    return (
        <div className="container-fluid p-0 bg-light min-vh-100">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm px-3">
                <div className="container-fluid">
                    <Link className="navbar-brand fw-bold" to="/">LibrarySys</Link>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item"><Link className="nav-link" to="/">Dashboard</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/books">Books</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/users">Users</Link></li>
                            <li className="nav-item"><Link className="nav-link active" to="/borrowing-log">Borrowing Log</Link></li>
                        </ul>
                        <div className="d-flex ms-auto">
                            <Link className="btn btn-outline-light me-3" to="/login">Login</Link>
                            <Link className="btn btn-primary" to="/signup">Sign Up</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="row g-0">
                {/* Sidebar Filters */}
                <div className="col-md-3 col-lg-2 bg-white border-end vh-100 p-3 shadow-sm">
                    <h5 className="fw-bold mb-3">Log Filters</h5>

                    {/* Status Filter */}
                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">STATUS</label>
                        <select
                            className="form-select shadow-none"
                            value={filters.status}
                            onChange={e => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option>All</option>
                            <option>Active</option>
                            <option>Returned</option>
                            <option>Overdue</option>
                        </select>
                    </div>

                    {/* Username Filter */}
                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">BORROWER</label>
                        <input
                            type="text"
                            className="form-control shadow-none"
                            placeholder="Filter by Borrower"
                            value={filters.username}
                            onChange={e => setFilters({ ...filters, username: e.target.value })}
                        />
                    </div>

                    {/* Book Title Filter */}
                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">BOOK TITLE</label>
                        <input
                            type="text"
                            className="form-control shadow-none"
                            placeholder="Filter by Book Title"
                            value={filters.bookTitle}
                            onChange={e => setFilters({ ...filters, bookTitle: e.target.value })}
                        />
                    </div>

                    {/* Reset Button */}
                    <button
                        className="btn btn-outline-secondary w-100 mt-2"
                        onClick={() => setFilters({ status: "All", username: "", bookTitle: "", search: "" })}
                    >
                        Reset Filters
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="col-md-9 col-lg-10 p-4">
                    {/* Top Control Bar */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h5 className="fw-bold mb-0">
                            Borrowing Logs <span className="text-muted fw-normal">({filteredLogs.length} total)</span>
                        </h5>

                        <div className="input-group w-50">
                            <input
                                type="text"
                                className="form-control shadow-none"
                                placeholder="Search by borrower or book title..."
                                value={filters.search}
                                onChange={e => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>

                        <div className="d-flex align-items-center">
                            <div className="btn-group me-2" role="group">
                                <button className="btn btn-outline-secondary" title="Grid View">
                                    <span>&#9632;</span>
                                </button>
                                <button className="btn btn-outline-secondary" title="List View">
                                    <span>&#9776;</span>
                                </button>
                            </div>
                            <Link to="/settings" className="btn btn-outline-secondary" title="Settings">
                                <span>&#9881;</span>
                            </Link>
                        </div>
                    </div>

                    {/* Logs Table Card */}
                    <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
                        <div className="card-body p-4">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead>
                                        <tr className="text-muted small">
                                            <th>ID</th>
                                            <th>BORROWER</th>
                                            <th>BOOK TITLE</th>
                                            <th>BORROW DATE</th>
                                            <th>DUE DATE</th>
                                            <th>RETURN DATE</th>
                                            <th>STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.map(log => (
                                            <tr key={log.id}>
                                                <td className="fw-semibold">{log.id}</td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center me-2"
                                                            style={{ width: "30px", height: "30px", fontSize: "0.8rem" }}>
                                                            {log.username ? log.username.charAt(0).toUpperCase() : "U"}
                                                        </div>
                                                        <span className="fw-bold text-dark">{log.username}</span>
                                                    </div>
                                                </td>
                                                <td className="fw-semibold">{log.bookTitle}</td>
                                                <td>{new Date(log.borrowDate).toLocaleDateString()}</td>
                                                <td>{log.dueDate ? new Date(log.dueDate).toLocaleDateString() : "-"}</td>
                                                <td>{log.returnDate ? new Date(log.returnDate).toLocaleDateString() : "-"}</td>
                                                <td>
                                                    {log.returnDate ? (
                                                        <span className={`badge ${log.isOverdue ? "bg-danger" : "bg-secondary"}`}>
                                                            {log.isOverdue ? "Returned (Overdue)" : "Returned"}
                                                        </span>
                                                    ) : log.isOverdue ? (
                                                        <span className="badge bg-danger">Overdue</span>
                                                    ) : (
                                                        <span className="badge bg-success">Active</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredLogs.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="text-center text-muted py-4">No records match filters</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BorrowLog;