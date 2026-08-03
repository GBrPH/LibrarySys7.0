import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

function Dashboard() {
    const [stats, setStats] = useState({ books: 0, users: 0, borrowed: 0, overdue: 0 });
    const [recentLogs, setRecentLogs] = useState([]);
    const [filters, setFilters] = useState({ status: "All", search: "" });

    // Retrieve role to optionally hide restricted UI elements
    const roleString = localStorage.getItem("role")?.toUpperCase() || "";
    const isPrivilegedUser = roleString.includes("LIBRARIAN") || roleString.includes("ADMIN");

    useEffect(() => {
        const token = localStorage.getItem("token")?.trim();
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch each endpoint independently so one failure (like a 403 Forbidden for Borrowers) 
        // doesn't crash the entire dashboard.
        const fetchDashboardData = async () => {
            let books = [];
            let users = [];
            let logs = [];

            // 1. Fetch Books (Usually accessible to everyone)
            try {
                const booksRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/Book/GetAllBooks`, { headers });
                books = booksRes.data || [];
            } catch (err) {
                console.error("Books fetch failed:", err.response?.status);
            }

            // 2. Fetch Users (Likely restricted to Admins/HMIR)
            try {
                const usersRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/User/GetAllUsers`, { headers });
                users = usersRes.data || [];
            } catch (err) {
                console.error("Users fetch failed (likely restricted):", err.response?.status);
            }

            // 3. Fetch Borrowing Logs (Likely restricted to Admins/HMIR)
            try {
                const logsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/BorrowingLog/GetAllLog`, { headers });
                logs = logsRes.data || [];
            } catch (err) {
                console.error("Logs fetch failed (likely restricted):", err.response?.status);
            }

            // Update stats with whatever data successfully loaded
            setStats({
                books: books.length,
                users: users.length,
                borrowed: logs.filter(l => !l.returnDate).length,
                overdue: logs.filter(l => l.isOverdue).length
            });

            setRecentLogs(logs.slice(0, 10));
        };

        fetchDashboardData();
    }, []);

    const filteredLogs = recentLogs.filter(log => {
        if (filters.status === "Active" && log.returnDate) return false;
        if (filters.status === "Returned" && !log.returnDate) return false;
        if (filters.status === "Overdue" && !log.isOverdue) return false;

        if (filters.search && !(
            (log.username && log.username.toLowerCase().includes(filters.search.toLowerCase())) ||
            (log.bookTitle && log.bookTitle.toLowerCase().includes(filters.search.toLowerCase()))
        )) return false;

        return true;
    });

    return (
        <div className="container-fluid bg-light min-vh-100 p-0">
            {/* Dynamic Reusable Navbar */}
            <Navbar activePage="dashboard" />

            <div className="row g-0">
                {/* Filter Sidebar - Only show to Privileged Users if logs are restricted */}
                <div className="col-md-3 col-lg-2 bg-white border-end vh-100 p-3 shadow-sm">
                    <h5 className="fw-bold mb-3">Filters</h5>
                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">STATUS</label>
                        <select
                            className="form-select shadow-none"
                            value={filters.status}
                            onChange={e => setFilters({ ...filters, status: e.target.value })}
                            disabled={!isPrivilegedUser}
                        >
                            <option>All</option>
                            <option>Active</option>
                            <option>Returned</option>
                            <option>Overdue</option>
                        </select>
                    </div>

                    <button
                        className="btn btn-outline-secondary w-100 mt-2"
                        onClick={() => setFilters({ status: "All", search: "" })}
                        disabled={!isPrivilegedUser}
                    >
                        Reset Filters
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="col-md-9 col-lg-10 p-4">
                    {/* Top Control Bar */}
                    <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                        <div className="d-flex align-items-center flex-grow-1">
                            <div style={{ minWidth: "220px" }}>
                                <h2 className="fw-bold mb-0">Dashboard</h2>
                            </div>

                            <div className="input-group" style={{ maxWidth: "500px" }}>
                                <input
                                    type="text"
                                    className="form-control shadow-none"
                                    placeholder="Search books or borrowers..."
                                    value={filters.search}
                                    onChange={e => setFilters({ ...filters, search: e.target.value })}
                                    disabled={!isPrivilegedUser}
                                />
                            </div>
                        </div>

                        {/* Right Side: Action Icons */}
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

                    {/* Card Statistics */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 text-white p-3 shadow-sm h-100"
                                style={{ background: "linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)", borderRadius: "16px" }}>
                                <small className="text-white-50 text-uppercase fw-bold">Total Books</small>
                                <h2 className="fw-bold my-2">{stats.books}</h2>
                                <small className="text-white-50">Items in Library</small>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 bg-white p-3 shadow-sm h-100" style={{ borderRadius: "16px" }}>
                                <small className="text-muted text-uppercase fw-bold">Total Users</small>
                                <h2 className="fw-bold my-2 text-dark">
                                    {isPrivilegedUser ? stats.users : "—"}
                                </h2>
                                <small className="text-success fw-bold">
                                    {isPrivilegedUser ? "Active Members" : "Restricted Access"}
                                </small>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 bg-white p-3 shadow-sm h-100" style={{ borderRadius: "16px" }}>
                                <small className="text-muted text-uppercase fw-bold">Borrowed</small>
                                <h2 className="fw-bold my-2 text-warning">
                                    {isPrivilegedUser ? stats.borrowed : "—"}
                                </h2>
                                <small className="text-muted">Out for Reading</small>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 bg-white p-3 shadow-sm h-100" style={{ borderRadius: "16px" }}>
                                <small className="text-muted text-uppercase fw-bold">Overdue</small>
                                <h2 className="fw-bold my-2 text-danger">
                                    {isPrivilegedUser ? stats.overdue : "—"}
                                </h2>
                                <small className="text-danger fw-bold">Action Needed</small>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Split Layout */}
                    <div className="row g-4">
                        <div className="col-lg-4">
                            <div className="card border-0 bg-white p-4 shadow-sm h-100" style={{ borderRadius: "16px" }}>
                                <h5 className="fw-bold text-dark mb-4">Inventory Breakdown</h5>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="position-relative d-flex align-items-center justify-content-center"
                                        style={{ width: "130px", height: "130px", borderRadius: "50%", background: "conic-gradient(#4361ee 0% 55%, #4cc9f0 55% 85%, #f72585 85% 100%)" }}>
                                        <div className="bg-white rounded-circle d-flex flex-column align-items-center justify-content-center shadow-sm"
                                            style={{ width: "90px", height: "90px" }}>
                                            <h5 className="fw-bold mb-0">55%</h5>
                                            <small className="text-muted" style={{ fontSize: "0.65rem" }}>Books</small>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-column gap-2 flex-grow-1 ms-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="small text-muted"><span className="badge bg-primary rounded-circle me-1">•</span>Books</span>
                                            <span className="fw-bold small">55%</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="small text-muted"><span className="badge bg-info rounded-circle me-1">•</span>eBooks</span>
                                            <span className="fw-bold small">30%</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="small text-muted"><span className="badge bg-danger rounded-circle me-1">•</span>Journals</span>
                                            <span className="fw-bold small">15%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-8">
                            <div className="card border-0 bg-white p-4 shadow-sm h-100" style={{ borderRadius: "16px" }}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fw-bold text-dark mb-0">Recent Borrowing Activity</h5>
                                    {isPrivilegedUser && (
                                        <Link to="/borrowing-log" className="btn btn-sm btn-outline-secondary rounded-pill px-3">View All</Link>
                                    )}
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th>User</th>
                                                <th>Book</th>
                                                <th>Borrow Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isPrivilegedUser ? (
                                                filteredLogs.map(log => (
                                                    <tr key={log.id}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <div className="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center me-2"
                                                                    style={{ width: "30px", height: "30px", fontSize: "0.8rem" }}>
                                                                    {log.username ? log.username.charAt(0).toUpperCase() : "U"}
                                                                </div>
                                                                <span>{log.username}</span>
                                                            </div>
                                                        </td>
                                                        <td>{log.bookTitle}</td>
                                                        <td>{new Date(log.borrowDate).toLocaleDateString()}</td>
                                                        <td>
                                                            {log.returnDate ? (
                                                                <span className={`badge ${log.isOverdue ? "bg-danger" : "bg-secondary"}`}>
                                                                    {log.isOverdue ? "Returned (Overdue)" : "Returned"}
                                                                </span>
                                                            ) : (
                                                                <span className="badge bg-success">Active</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center text-muted py-4">
                                                        <em>Access Restricted. You do not have permission to view global borrowing logs.</em>
                                                    </td>
                                                </tr>
                                            )}

                                            {isPrivilegedUser && filteredLogs.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="text-center text-muted py-3">
                                                        No records match filters
                                                    </td>
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
        </div>
    );
}

export default Dashboard;