import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

function BorrowingLog() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [viewMode, setViewMode] = useState("list");
    const [filters, setFilters] = useState({
        status: "All",
        username: "",
        bookTitle: "",
        search: ""
    });

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const fetchLogs = useCallback(() => {
        const token = (localStorage.getItem("token") || sessionStorage.getItem("token"))?.trim();
        if (!token) {
            navigate("/login");
            return;
        }

        const baseUrl = process.env.REACT_APP_API_URL || "";

        axios.get(`${baseUrl}/api/BorrowingLog/GetAllLog`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                console.log("Logs API response:", res.data);
                if (Array.isArray(res.data)) {
                    setLogs(res.data);
                } else if (res.data && typeof res.data === "object") {
                    const firstArray = Object.values(res.data).find(val => Array.isArray(val));
                    setLogs(firstArray || []);
                } else {
                    setLogs([]);
                }
            })
            .catch(err => console.error("Error fetching borrowing logs:", err));
    }, [navigate]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const filteredLogs = logs.filter(log => {
        const returnDateVal = log.returnDate || log.ReturnDate;
        const isReturned = returnDateVal && !String(returnDateVal).startsWith("0001");
        const borrowDate = log.borrowDate || log.BorrowDate;
        const dueDate = log.dueDate || log.DueDate;
        const isOverdueVal = log.isOverdue ?? log.IsOverdue ?? false;

        let dueDateObj = null;
        if (dueDate && !String(dueDate).startsWith("0001")) {
            dueDateObj = new Date(dueDate);
        } else if (borrowDate) {
            dueDateObj = new Date(borrowDate);
            dueDateObj.setDate(dueDateObj.getDate() + 14);
        }

        const today = new Date().setHours(0, 0, 0, 0);
        const dueTime = dueDateObj ? new Date(dueDateObj).setHours(0, 0, 0, 0) : null;
        const isCurrentlyOverdue = dueTime && today > dueTime && !isReturned;

        if (filters.status !== "All") {
            const targetStatus = filters.status.toLowerCase();
            if (targetStatus === "active" && (isReturned || isCurrentlyOverdue || isOverdueVal)) return false;
            if (targetStatus === "returned" && !isReturned) return false;
            if (targetStatus === "overdue" && !isOverdueVal && !isCurrentlyOverdue) return false;
        }

        const uName = String(log.username || log.Username || "");
        const bTitle = String(log.bookTitle || log.BookTitle || "");

        if (filters.username && !uName.toLowerCase().includes(filters.username.toLowerCase())) return false;
        if (filters.bookTitle && !bTitle.toLowerCase().includes(filters.bookTitle.toLowerCase())) return false;

        if (filters.search) {
            const s = filters.search.toLowerCase();
            if (!uName.toLowerCase().includes(s) && !bTitle.toLowerCase().includes(s)) return false;
        }

        return true;
    });

    const totalPages = Math.ceil(filteredLogs.length / pageSize);
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="p-0 min-vh-100">
            <Navbar activePage="logs" />

            <div className="container-fluid py-4 px-4">
                <div className="row g-4 align-items-start">
                    <div className="col-md-3 col-lg-2">
                        <div className="p-4 glass-panel filter-sidebar border-0 shadow">
                            <h5 className="fw-bold mb-3">Log Filters</h5>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">STATUS</label>
                                <select className="form-select shadow-none" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                                    <option>All</option>
                                    <option>Active</option>
                                    <option>Returned</option>
                                    <option>Overdue</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">BORROWER</label>
                                <input type="text" className="form-control shadow-none" placeholder="Filter by Borrower" value={filters.username} onChange={e => setFilters({ ...filters, username: e.target.value })} />
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">BOOK TITLE</label>
                                <input type="text" className="form-control shadow-none" placeholder="Filter by Book Title" value={filters.bookTitle} onChange={e => setFilters({ ...filters, bookTitle: e.target.value })} />
                            </div>

                            <button className="btn btn-primary w-100 mt-2" onClick={() => setFilters({ status: "All", username: "", bookTitle: "", search: "" })}>
                                Reset Filters
                            </button>
                        </div>
                    </div>

                    <div className="col-md-9 col-lg-10 d-flex flex-column">
                        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                            <div className="d-flex align-items-center flex-grow-1 gap-3">
                                <div style={{ minWidth: "220px" }}>
                                    <h5 className="fw-bold mb-0 text-nowrap text-white">
                                        Borrowing Logs <span className="text-white-50 fw-normal">({filteredLogs.length} total)</span>
                                    </h5>
                                </div>
                                <div className="input-group" style={{ maxWidth: "400px" }}>
                                    <input type="text" className="form-control shadow-none bg-white text-dark border-0" placeholder="Search by borrower or book title..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
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
                                <Link to="/settings" className="btn btn-outline-light" title="Settings">
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
                                                        const logId = log.id || log.Id;
                                                        const username = log.username || log.Username;
                                                        const bookTitle = log.bookTitle || log.BookTitle;
                                                        const borrowDate = log.borrowDate || log.BorrowDate;
                                                        const dueDate = log.dueDate || log.DueDate;
                                                        const returnDate = log.returnDate || log.ReturnDate;
                                                        const isOverdue = log.isOverdue ?? log.IsOverdue ?? false;

                                                        const isReturned = returnDate && !String(returnDate).startsWith("0001");
                                                        let dueDateObj = null;
                                                        if (dueDate && !String(dueDate).startsWith("0001")) {
                                                            dueDateObj = new Date(dueDate);
                                                        } else if (borrowDate) {
                                                            dueDateObj = new Date(borrowDate);
                                                            dueDateObj.setDate(dueDateObj.getDate() + 14);
                                                        }

                                                        const today = new Date().setHours(0, 0, 0, 0);
                                                        const dueTime = dueDateObj ? new Date(dueDateObj).setHours(0, 0, 0, 0) : null;
                                                        const isCurrentlyOverdue = dueTime && today > dueTime && !isReturned;

                                                        return (
                                                            <tr key={logId}>
                                                                <td className="fw-semibold">{logId}</td>
                                                                <td>
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: "30px", height: "30px", fontSize: "0.8rem" }}>
                                                                            {username ? username.charAt(0).toUpperCase() : "U"}
                                                                        </div>
                                                                        <span className="fw-bold">{username}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="fw-semibold">{bookTitle}</td>
                                                                <td>{borrowDate ? new Date(borrowDate).toLocaleDateString() : "-"}</td>
                                                                <td>
                                                                    <span className={`fw-semibold ${isCurrentlyOverdue ? "text-danger" : ""}`}>
                                                                        {dueDateObj ? dueDateObj.toLocaleDateString() : "-"}
                                                                    </span>
                                                                </td>
                                                                <td>{isReturned ? new Date(returnDate).toLocaleDateString() : "-"}</td>
                                                                <td>
                                                                    {isReturned ? (
                                                                        <span className={`badge ${isOverdue ? "bg-danger" : "bg-secondary"}`}>
                                                                            {isOverdue ? "Returned Late" : "Returned"}
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
                                <div className="row g-4">
                                    {paginatedLogs.map(log => {
                                        const logId = log.id || log.Id;
                                        const username = log.username || log.Username;
                                        const bookTitle = log.bookTitle || log.BookTitle;
                                        const borrowDate = log.borrowDate || log.BorrowDate;
                                        const dueDate = log.dueDate || log.DueDate;
                                        const returnDate = log.returnDate || log.ReturnDate;
                                        const isOverdue = log.isOverdue ?? log.IsOverdue ?? false;

                                        const isReturned = returnDate && !String(returnDate).startsWith("0001");
                                        let dueDateObj = null;
                                        if (dueDate && !String(dueDate).startsWith("0001")) {
                                            dueDateObj = new Date(dueDate);
                                        } else if (borrowDate) {
                                            dueDateObj = new Date(borrowDate);
                                            dueDateObj.setDate(dueDateObj.getDate() + 14);
                                        }

                                        const today = new Date().setHours(0, 0, 0, 0);
                                        const dueTime = dueDateObj ? new Date(dueDateObj).setHours(0, 0, 0, 0) : null;
                                        const isCurrentlyOverdue = dueTime && today > dueTime && !isReturned;

                                        return (
                                            <div className="col-12 col-md-6 col-xl-4 d-flex" key={logId}>
                                                <div className="card h-100 w-100 border-0 shadow-sm p-3 glass-panel d-flex flex-column justify-content-between">
                                                    <div>
                                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                                            <div className="d-flex align-items-center">
                                                                <div className="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: "40px", height: "40px", fontSize: "1rem" }}>
                                                                    {username ? username.charAt(0).toUpperCase() : "U"}
                                                                </div>
                                                                <div>
                                                                    <h6 className="fw-bold mb-0 text-truncate" style={{ maxWidth: "150px" }} title={username}>{username}</h6>
                                                                    <small className="opacity-75">ID: {logId}</small>
                                                                </div>
                                                            </div>
                                                            {isReturned ? (
                                                                <span className={`badge ${isOverdue ? "bg-danger" : "bg-secondary"}`}>
                                                                    {isOverdue ? "Returned (Late)" : "Returned"}
                                                                </span>
                                                            ) : isCurrentlyOverdue ? (
                                                                <span className="badge bg-danger">Overdue</span>
                                                            ) : (
                                                                <span className="badge bg-success">Active</span>
                                                            )}
                                                        </div>
                                                        <h5 className="fw-bold mb-3 mt-1 text-truncate" title={bookTitle}>{bookTitle}</h5>
                                                    </div>
                                                    <div className="d-flex flex-column gap-2 mt-auto pt-3 border-top" style={{ borderColor: "rgba(30, 41, 59, 0.15)" }}>
                                                        <div className="d-flex justify-content-between small">
                                                            <span className="fw-bold opacity-75">Borrowed:</span>
                                                            <span className="fw-semibold">{borrowDate ? new Date(borrowDate).toLocaleDateString() : "-"}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between small">
                                                            <span className="fw-bold opacity-75">Due Date:</span>
                                                            <span className="fw-semibold">{dueDateObj ? dueDateObj.toLocaleDateString() : "-"}</span>
                                                        </div>
                                                        {isReturned && (
                                                            <div className="d-flex justify-content-between small">
                                                                <span className="fw-bold opacity-75">Returned:</span>
                                                                <span className="fw-semibold">{new Date(returnDate).toLocaleDateString()}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {filteredLogs.length === 0 && <div className="col-12 text-center text-white py-5">No logs found.</div>}
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

export default BorrowingLog;