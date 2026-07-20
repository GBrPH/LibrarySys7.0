import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function BorrowingLog() {
    const [logs, setLogs] = useState([]);
    const [filters, setFilters] = useState({ status: "All" });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        axios.get(`${process.env.REACT_APP_API_URL}/api/BorrowingLog/GetAllLog`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                // ✅ check if backend wraps data
                const data = Array.isArray(res.data) ? res.data : res.data.data;
                setLogs(data || []);
            })
            .catch(err => console.error("Error fetching logs:", err));
    }, [navigate]);

    // ✅ derive status from DTO fields
    const filteredLogs = logs.filter(log => {
        const status = log.returnDate
            ? "Returned"
            : log.isOverdue
                ? "Overdue"
                : "Active";

        if (filters.status === "Active" && status !== "Active") return false;
        if (filters.status === "Returned" && status !== "Returned") return false;
        if (filters.status === "Overdue" && status !== "Overdue") return false;
        return true;
    });

    return (
        <div className="container-fluid">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">LibrarySys</Link>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item"><Link className="nav-link" to="/">Dashboard</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/books">Books</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/users">Users</Link></li>
                            <li className="nav-item"><Link className="nav-link active" to="/borrowing-log">Borrowing Log</Link></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="row">
                {/* Sidebar filter */}
                <div className="col-md-3 col-lg-2 bg-light border-end vh-100 p-3">
                    <h5>Filters</h5>
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

                {/* Main content */}
                <div className="col-md-9 col-lg-10 p-4">
                    <h2 className="mb-4">Borrowing Log</h2>

                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5>All Logs</h5>
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>User</th>
                                        <th>Book</th>
                                        <th>Borrow Date</th>
                                        <th>Return Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map(log => {
                                        const status = log.returnDate
                                            ? "Returned"
                                            : log.isOverdue
                                                ? "Overdue"
                                                : "Active";

                                        return (
                                            <tr key={log.id}>
                                                <td>{log.id}</td>
                                                <td>{log.username}</td>
                                                <td>{log.bookTitle}</td>
                                                <td>{new Date(log.borrowDate).toLocaleDateString()}</td>
                                                <td>{log.returnDate ? new Date(log.returnDate).toLocaleDateString() : "-"}</td>
                                                <td>
                                                    <span className={`badge ${status === "Returned" ? "bg-success" :
                                                            status === "Overdue" ? "bg-danger" : "bg-info"
                                                        }`}>
                                                        {status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredLogs.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted">
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
    );
}

export default BorrowingLog;
