import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Dashboard() {
    const [stats, setStats] = useState({ books: 0, users: 0, borrowed: 0, overdue: 0 });
    const [recentLogs, setRecentLogs] = useState([]);
    const [filters, setFilters] = useState({ status: "All", search: "" });

    useEffect(() => {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        Promise.all([
            axios.get(`${process.env.REACT_APP_API_URL}/api/Book/GetAllBooks`, { headers }),
            axios.get(`${process.env.REACT_APP_API_URL}/api/User/GetAllUsers`, { headers }),
            axios.get(`${process.env.REACT_APP_API_URL}/api/BorrowingLog/GetAllLog`, { headers })
        ]).then(([booksRes, usersRes, logsRes]) => {
            const books = booksRes.data || [];
            const users = usersRes.data || [];
            const logs = logsRes.data || [];

            setStats({
                books: books.length,
                users: users.length,
                borrowed: logs.filter(l => !l.returnDate).length,
                overdue: logs.filter(l => l.isOverdue).length
            });

            setRecentLogs(logs.slice(0, 10));
        }).catch(err => console.error("Error fetching dashboard data:", err));
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
            {/* Top Navbar (Original Layout) */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm px-3">
                <div className="container-fluid">
                    <Link className="navbar-brand fw-bold" to="/">LibrarySys</Link>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item"><Link className="nav-link active" to="/">Dashboard</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/books">Books</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/users">Users</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/borrowing-log">Borrowing Log</Link></li>
                        </ul>
                        <div className="d-flex ms-auto">
                            <Link className="btn btn-outline-light me-3" to="/login">Login</Link>
                            <Link className="btn btn-primary" to="/signup">Sign Up</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="row g-0">
                {/* Filter Sidebar (Original Layout & Controls) */}
                <div className="col-md-3 col-lg-2 bg-white border-end vh-100 p-3 shadow-sm">
                    <h5 className="fw-bold mb-3">Filters</h5>
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

                    <button
                        className="btn btn-outline-secondary w-100 mt-2"
                        onClick={() => setFilters({ status: "All", search: "" })}
                    >
                        Reset Filters
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="col-md-9 col-lg-10 p-4">
                    <h2 className="fw-bold mb-4">Dashboard</h2>

                    {/* Top Control Bar: Search + Action Icons */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="input-group w-50">
                            <input
                                type="text"
                                className="form-control shadow-none"
                                placeholder="Search books or borrowers..."
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

                    {/* Modern Card Statistics (New Styled Cards) */}
                    <div className="row g-3 mb-4">
                        {/* Blue Highlight Card */}
                        <div className="col-md-3">
                            <div className="card border-0 text-white p-3 shadow-sm"
                                style={{ background: "linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)", borderRadius: "16px" }}>
                                <small className="text-white-50 text-uppercase fw-bold">Total Books</small>
                                <h2 className="fw-bold my-2">{stats.books}</h2>
                                <small className="text-white-50">Items in Library</small>
                            </div>
                        </div>

                        {/* Registered Users */}
                        <div className="col-md-3">
                            <div className="card border-0 bg-white p-3 shadow-sm" style={{ borderRadius: "16px" }}>
                                <small className="text-muted text-uppercase fw-bold">Total Users</small>
                                <h2 className="fw-bold my-2 text-dark">{stats.users}</h2>
                                <small className="text-success fw-bold">Active Members</small>
                            </div>
                        </div>

                        {/* Currently Borrowed */}
                        <div className="col-md-3">
                            <div className="card border-0 bg-white p-3 shadow-sm" style={{ borderRadius: "16px" }}>
                                <small className="text-muted text-uppercase fw-bold">Borrowed</small>
                                <h2 className="fw-bold my-2 text-warning">{stats.borrowed}</h2>
                                <small className="text-muted">Out for Reading</small>
                            </div>
                        </div>

                        {/* Overdue Items */}
                        <div className="col-md-3">
                            <div className="card border-0 bg-white p-3 shadow-sm" style={{ borderRadius: "16px" }}>
                                <small className="text-muted text-uppercase fw-bold">Overdue</small>
                                <h2 className="fw-bold my-2 text-danger">{stats.overdue}</h2>
                                <small className="text-danger fw-bold">Action Needed</small>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Split Layout: Inventory Report + Recent Activity */}
                    <div className="row g-4">
                        {/* Donut Style Breakdown */}
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

                        {/* Table (Original + Modern Avatars) */}
                        <div className="col-lg-8">
                            <div className="card border-0 bg-white p-4 shadow-sm h-100" style={{ borderRadius: "16px" }}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fw-bold text-dark mb-0">Recent Borrowing Activity</h5>
                                    <Link to="/borrowing-log" className="btn btn-sm btn-outline-secondary rounded-pill px-3">View All</Link>
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
                                            {filteredLogs.map(log => (
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
                                            ))}
                                            {filteredLogs.length === 0 && (
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