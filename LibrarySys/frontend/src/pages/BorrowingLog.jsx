import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

function BorrowLog() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [viewMode, setViewMode] = useState("list");
    const [filters, setFilters] = useState({
        status: "All",
        username: "",
        bookTitle: "",
        search: ""
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const fetchLogs = useCallback(() => {
        const token = localStorage.getItem("token")?.trim();
        if (!token) {
            navigate("/login");
            return;
        }

        axios.get(`${process.env.REACT_APP_API_URL}/api/BorrowingLog/GetAllLog`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setLogs(res.data || []))
            .catch(err => console.error("Error fetching borrowing logs:", err));
    }, [navigate]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Reset to page 1 whenever a filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const filteredLogs = logs.filter(log => {
        const isReturned = log.returnDate && !log.returnDate.startsWith("0001");

        if (filters.status === "Active" && isReturned) return false;
        if (filters.status === "Returned" && !isReturned) return false;
        if (filters.status === "Overdue" && !log.isOverdue) return false;

        if (filters.username && !(log.username || "").toLowerCase().includes(filters.username.toLowerCase())) return false;
        if (filters.bookTitle && !(log.bookTitle || "").toLowerCase().includes(filters.bookTitle.toLowerCase())) return false;

        if (filters.search && !(
            (log.username || "").toLowerCase().includes(filters.search.toLowerCase()) ||
            (log.bookTitle || "").toLowerCase().includes(filters.search.toLowerCase())
        )) return false;

        return true;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredLogs.length / pageSize);
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="container-fluid p-0 bg-light min-vh-100">
            <Navbar activePage="logs" />

            <div className="row g-0">
                {/* Sidebar Filters */}
                <div className="col-md-3 col-lg-2 bg-white border-end vh-100 p-3 shadow-sm">
                    <h5 className="fw-bold mb-3">Log Filters</h5>

                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">STATUS</label>
                        <select className="form-select shadow-none" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                            <option>All</option>
                            <option>Active</option>
                            <option>Returned</option>
                            <option>Overdue</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">BORROWER</label>
                        <input type="text" className="form-control shadow-none" placeholder="Filter by Borrower" value={filters.username} onChange={e => setFilters({ ...filters, username: e.target.value })} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">BOOK TITLE</label>
                        <input type="text" className="form-control shadow-none" placeholder="Filter by Book Title" value={filters.bookTitle} onChange={e => setFilters({ ...filters, bookTitle: e.target.value })} />
                    </div>

                    <button className="btn btn-outline-secondary w-100 mt-2" onClick={() => setFilters({ status: "All", username: "", bookTitle: "", search: "" })}>
                        Reset Filters
                    </button>
                </div>

                {/* Main Content Area - Added d-flex flex-column here */}
                <div className="col-md-9 col-lg-10 p-4 d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                        <div className="d-flex align-items-center flex-grow-1 gap-3">
                            <div style={{ minWidth: "220px" }}>
                                <h5 className="fw-bold mb-0 text-nowrap">
                                    Borrowing Logs <span className="text-muted fw-normal">({filteredLogs.length} total)</span>
                                </h5>
                            </div>
                            <div className="input-group" style={{ maxWidth: "400px" }}>
                                <input type="text" className="form-control shadow-none" placeholder="Search by borrower or book title..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <div className="btn-group" role="group">
                                <button className={`btn ${viewMode === "grid" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setViewMode("grid")} title="Grid View">
                                    <span>&#9632;</span>
                                </button>
                                <button className={`btn ${viewMode === "list" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setViewMode("list")} title="List View">
                                    <span>&#9776;</span>
                                </button>
                            </div>
                            <Link to="/settings" className="btn btn-outline-secondary" title="Settings">
                                <span>&#9881;</span>
                            </Link>
                        </div>
                    </div>

                    {/* DYNAMIC RENDERING BLOCK WRAPPER */}
                    <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: "650px" }}>
                        {viewMode === "list" ? (
                            <div className="card border-0 shadow-sm flex-grow-1" style={{ borderRadius: "16px" }}>
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
                                                {paginatedLogs.map(log => {
                                                    const isReturned = log.returnDate && !log.returnDate.startsWith("0001");
                                                    let dueDateObj = null;
                                                    if (log.dueDate && !log.dueDate.startsWith("0001")) {
                                                        dueDateObj = new Date(log.dueDate);
                                                    } else if (log.borrowDate) {
                                                        dueDateObj = new Date(log.borrowDate);
                                                        dueDateObj.setDate(dueDateObj.getDate() + 14);
                                                    }

                                                    const today = new Date().setHours(0, 0, 0, 0);
                                                    const dueTime = dueDateObj ? new Date(dueDateObj).setHours(0, 0, 0, 0) : null;
                                                    const isCurrentlyOverdue = dueTime && today > dueTime && !isReturned;

                                                    return (
                                                        <tr key={log.id}>
                                                            <td className="fw-semibold">{log.id}</td>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    <div className="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: "30px", height: "30px", fontSize: "0.8rem" }}>
                                                                        {log.username ? log.username.charAt(0).toUpperCase() : "U"}
                                                                    </div>
                                                                    <span className="fw-bold text-dark">{log.username}</span>
                                                                </div>
                                                            </td>
                                                            <td className="fw-semibold">{log.bookTitle}</td>
                                                            <td>{log.borrowDate ? new Date(log.borrowDate).toLocaleDateString() : "-"}</td>
                                                            <td>
                                                                <span className={`fw-semibold ${isCurrentlyOverdue ? "text-danger" : ""}`}>
                                                                    {dueDateObj ? dueDateObj.toLocaleDateString() : "-"}
                                                                </span>
                                                            </td>
                                                            <td>{isReturned ? new Date(log.returnDate).toLocaleDateString() : "-"}</td>
                                                            <td>
                                                                {isReturned ? (
                                                                    <span className={`badge ${log.isOverdue ? "bg-danger" : "bg-secondary"}`}>
                                                                        {log.isOverdue ? "Returned Late" : "Returned"}
                                                                    </span>
                                                                ) : isCurrentlyOverdue ? (
                                                                    <span className="badge bg-danger shadow-sm">Overdue</span>
                                                                ) : (
                                                                    <span className="badge bg-success">Active</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}

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
                        ) : (
                            <div className="row g-4 align-content-start flex-grow-1">
                                {paginatedLogs.map(log => {
                                    const isReturned = log.returnDate && !log.returnDate.startsWith("0001");
                                    let dueDateObj = null;
                                    if (log.dueDate && !log.dueDate.startsWith("0001")) {
                                        dueDateObj = new Date(log.dueDate);
                                    } else if (log.borrowDate) {
                                        dueDateObj = new Date(log.borrowDate);
                                        dueDateObj.setDate(dueDateObj.getDate() + 14);
                                    }

                                    const today = new Date().setHours(0, 0, 0, 0);
                                    const dueTime = dueDateObj ? new Date(dueDateObj).setHours(0, 0, 0, 0) : null;
                                    const isCurrentlyOverdue = dueTime && today > dueTime && !isReturned;

                                    return (
                                        <div className="col-12 col-md-6 col-xl-4" key={log.id}>
                                            <div className="card h-100 border-0 shadow-sm p-3" style={{ borderRadius: "16px" }}>
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: "40px", height: "40px", fontSize: "1rem" }}>
                                                            {log.username ? log.username.charAt(0).toUpperCase() : "U"}
                                                        </div>
                                                        <div>
                                                            <h6 className="fw-bold text-dark mb-0 text-truncate" style={{ maxWidth: "150px" }} title={log.username}>{log.username}</h6>
                                                            <small className="text-muted">ID: {log.id}</small>
                                                        </div>
                                                    </div>
                                                    {isReturned ? (
                                                        <span className={`badge ${log.isOverdue ? "bg-danger" : "bg-secondary"}`}>
                                                            {log.isOverdue ? "Returned (Late)" : "Returned"}
                                                        </span>
                                                    ) : isCurrentlyOverdue ? (
                                                        <span className="badge bg-danger">Overdue</span>
                                                    ) : (
                                                        <span className="badge bg-success">Active</span>
                                                    )}
                                                </div>
                                                <h5 className="fw-bold text-dark mb-3 mt-1">{log.bookTitle}</h5>
                                                <div className="d-flex flex-column gap-2 mt-auto pt-3 border-top">
                                                    <div className="d-flex justify-content-between small">
                                                        <span className="text-muted fw-bold">Borrowed:</span>
                                                        <span className="fw-semibold">{log.borrowDate ? new Date(log.borrowDate).toLocaleDateString() : "-"}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between small">
                                                        <span className="text-muted fw-bold">Due Date:</span>
                                                        <span className="fw-semibold">{dueDateObj ? dueDateObj.toLocaleDateString() : "-"}</span>
                                                    </div>
                                                    {isReturned && (
                                                        <div className="d-flex justify-content-between small">
                                                            <span className="text-muted fw-bold">Returned:</span>
                                                            <span className="fw-semibold">{new Date(log.returnDate).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredLogs.length === 0 && <div className="col-12 text-center text-muted py-5">No logs found.</div>}
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls - mt-auto keeps it at the bottom */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-auto pt-4 mb-2">
                            <nav>
                                <ul className="pagination shadow-sm mb-0">
                                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        >
                                            Previous
                                        </button>
                                    </li>
                                    <li className="page-item disabled">
                                        <span className="page-link text-dark fw-semibold px-4">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                    </li>
                                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                        <button
                                            className="page-link"
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
    );
}

export default BorrowLog;