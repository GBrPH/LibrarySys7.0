import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Dashboard() {
    const [stats, setStats] = useState({ books: 0, users: 0, borrowed: 0, overdue: 0 });
    const [recentLogs, setRecentLogs] = useState([]);
    const [filters, setFilters] = useState({ status: "All" });

    useEffect(() => {
        Promise.all([
            axios.get(`${process.env.REACT_APP_API_URL}/Book/GetAllBooks`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            }),
            axios.get(`${process.env.REACT_APP_API_URL}/User/GetAll`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            }),
            axios.get(`${process.env.REACT_APP_API_URL}/BorrowingLog/GetAllLog`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            })
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
        return true;
    });

    return (
        <div className="container-fluid">
            {/* Original Top Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">LibrarySys</Link>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item"><Link className="nav-link" to="/">Dashboard</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/books">Books</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/users">Users</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/borrowing-log">Borrowing Log</Link></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="row">
                {/* Filter Sidebar */}
                <div className="col-md-3 col-lg-2 bg-light border-end vh-100 p-3">
                    <h5>Filters</h5>
                    <div className="mb-3">
                        <label className="form-label">Status</label>
                        <select
                            className="form-select"
                            value={filters.status}
                            onChange={e => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option>All</option>
                            <option>Active</option>
                            <option>Returned</option>
                            <option>Overdue</option>
                        </select>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-md-9 col-lg-10 p-4">
                    <h2 className="mb-4">Dashboard</h2>

                    {/* Stats Cards */}
                    <div className="row mb-4">
                        {/* Cards same as before */}
                    </div>

                    {/* Recent Borrowing Table */}
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5>Recent Borrowing</h5>
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>User</th><th>Book</th><th>Borrow Date</th><th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map(log => (
                                        <tr key={log.id}>
                                            <td>{log.userName}</td>
                                            <td>{log.bookTitle}</td>
                                            <td>{new Date(log.borrowDate).toLocaleDateString()}</td>
                                            <td>
                                                {log.returnDate
                                                    ? <span className={`badge ${log.isOverdue ? "bg-danger" : "bg-secondary"}`}>
                                                        {log.isOverdue ? "Returned (Overdue)" : "Returned"}
                                                    </span>
                                                    : <span className="badge bg-success">Active</span>}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLogs.length === 0 && (
                                        <tr><td colSpan="4" className="text-center text-muted">No records match filters</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
