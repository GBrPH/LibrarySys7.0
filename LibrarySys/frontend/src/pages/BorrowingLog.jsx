import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
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

        axios.get(`${process.env.REACT_APP_API_URL}/api/BorrowingLog/GetAllLog`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setLogs(res.data || []))
            .catch(err => console.error("Error fetching borrowing logs:", err));
    }, []);

    const filteredLogs = logs.filter(log => {
        if (filters.status === "Active" && log.returnDate) return false;
        if (filters.status === "Returned" && !log.returnDate) return false;
        if (filters.status === "Overdue" && !log.isOverdue) return false;

        if (filters.username && !log.username?.toLowerCase().includes(filters.username.toLowerCase())) return false;
        if (filters.bookTitle && !log.bookTitle?.toLowerCase().includes(filters.bookTitle.toLowerCase())) return false;

        if (filters.search && !(
            (log.username && log.username.toLowerCase().includes(filters.search.toLowerCase())) ||
            (log.bookTitle && log.bookTitle.toLowerCase().includes(filters.search.toLowerCase()))
        )) return false;

        return true;
    });

    return (
        <div className="container-fluid p-0 bg-light min-vh-100">
            {/* Dynamic Reusable Navbar */}
            <Navbar activePage="logs" />

            <div className="row g-0">
                {/* Sidebar Filters */}
                <div className="col-md-3 col-lg-2 bg-white border-end vh-100 p-3 shadow-sm">
                    <h5 className="fw-bold mb-3">Log Filters</h5>

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

                    <button
                        className="btn btn-outline-secondary w-100 mt-2"
                        onClick={() => setFilters({ status: "All", username: "", bookTitle: "", search: "" })}
                    >
                        Reset Filters
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="col-md-9 col-lg-10 p-4">
                    {/* Replace your current BorrowingLog header with this: */}

                    <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">

                        {/* Left Side: Title and Search locked together */}
                        <div className="d-flex align-items-center flex-grow-1 gap-3">
                            <div style={{ minWidth: "220px" }}>
                                <h5 className="fw-bold mb-0 text-nowrap">
                                    Borrowing Logs <span className="text-muted fw-normal">({logs.length} total)</span>
                                </h5>
                            </div>

                            <div className="input-group" style={{ maxWidth: "400px" }}>
                                <input
                                    type="text"
                                    className="form-control shadow-none"
                                    placeholder="Search by borrower or book title..."
                                    value={filters.search}
                                    onChange={e => setFilters(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Right Side: View Controls & Settings */}
                        <div className="d-flex align-items-center gap-2">
                            <div className="btn-group" role="group">
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