import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

function Dashboard() {
    const [stats, setStats] = useState({ books: 0, users: 0, borrowed: 0, overdue: 0 });
    const [recentLogs, setRecentLogs] = useState([]);
    const [filters, setFilters] = useState({ status: "All", search: "" });
    const [returnMessage, setReturnMessage] = useState({ text: "", type: "" });
    const [processingId, setProcessingId] = useState(null);

    const [inventory, setInventory] = useState({ physical: 0, ebook: 0, journal: 0 });

    const currentUsername = localStorage.getItem("username")?.trim() || "";
    const roleString = localStorage.getItem("role")?.toUpperCase() || "";
    const isPrivilegedUser = roleString.includes("LIBRARIAN") || roleString.includes("ADMIN") || currentUsername.toUpperCase() === "HMIR";

    const fetchDashboardData = async () => {
        const token = localStorage.getItem("token")?.trim();
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };
        let books = [];
        let users = [];
        let logs = [];

        try {
            const booksRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/Book/GetAllBooks`, { headers });
            books = booksRes.data || [];

            let pCount = 0; let eCount = 0; let jCount = 0;
            books.forEach(b => {
                if (b.type === "eBook") eCount++;
                else if (b.type === "Journal") jCount++;
                else pCount++;
            });

            const total = books.length || 1;
            setInventory({
                physical: Math.round((pCount / total) * 100),
                ebook: Math.round((eCount / total) * 100),
                journal: Math.round((jCount / total) * 100)
            });

        } catch (err) { console.error("Books fetch failed:", err); }

        if (isPrivilegedUser) {
            try {
                const usersRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/User/GetAllUsers`, { headers });
                users = usersRes.data || [];
            } catch (err) { console.warn("Users fetch restricted."); }
        }

        try {
            const logsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/BorrowingLog/GetAllLog`, { headers });
            let fetchedLogs = logsRes.data || [];

            if (!isPrivilegedUser) {
                fetchedLogs = fetchedLogs.filter(log => log.username?.toLowerCase() === currentUsername.toLowerCase());
            }
            logs = fetchedLogs.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));
        } catch (err) { console.error("Logs fetch failed:", err); }

        const calculateActiveOverdue = (log) => {
            if (log.returnDate) return log.isOverdue;
            const daysBorrowed = (new Date() - new Date(log.borrowDate)) / (1000 * 60 * 60 * 24);
            return daysBorrowed > 14;
        };

        setStats({
            books: books.length,
            users: users.length,
            borrowed: logs.filter(l => !l.returnDate).length,
            overdue: logs.filter(l => calculateActiveOverdue(l)).length
        });

        setRecentLogs(logs.slice(0, 15));
    };

    useEffect(() => {
        fetchDashboardData();
    }, [currentUsername, isPrivilegedUser]);

    const handleReturn = async (bookId, logUsername) => {
        setProcessingId(bookId);
        setReturnMessage({ text: "", type: "" });
        const token = localStorage.getItem("token")?.trim();

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/Borrow/ReturnBook`,
                { bookId: bookId, username: logUsername },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setReturnMessage({ text: response.data.message, type: "success" });
            fetchDashboardData();
        } catch (err) {
            setReturnMessage({ text: err.response?.data?.message || "Failed to return book.", type: "danger" });
        } finally {
            setProcessingId(null);
        }
    };

    const filteredLogs = recentLogs.filter(log => {
        const isCurrentlyOverdue = !log.returnDate && ((new Date() - new Date(log.borrowDate)) / (1000 * 60 * 60 * 24)) > 14;
        if (filters.status === "Active" && log.returnDate) return false;
        if (filters.status === "Returned" && !log.returnDate) return false;
        if (filters.status === "Overdue" && !log.isOverdue && !isCurrentlyOverdue) return false;
        if (filters.search && !(
            (log.username && log.username.toLowerCase().includes(filters.search.toLowerCase())) ||
            (log.bookTitle && log.bookTitle.toLowerCase().includes(filters.search.toLowerCase()))
        )) return false;
        return true;
    });

    return (
        <div className="container-fluid bg-light min-vh-100 p-0">
            <Navbar activePage="dashboard" />

            <div className="row g-0">
                <div className="col-md-3 col-lg-2 bg-white border-end vh-100 p-3 shadow-sm">
                    <h5 className="fw-bold mb-3">Filters</h5>
                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">STATUS</label>
                        <select className="form-select shadow-none" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                            <option>All</option>
                            <option>Active</option>
                            <option>Returned</option>
                            <option>Overdue</option>
                        </select>
                    </div>
                    <button className="btn btn-outline-secondary w-100 mt-2" onClick={() => setFilters({ status: "All", search: "" })}>
                        Reset Filters
                    </button>
                </div>

                <div className="col-md-9 col-lg-10 p-4">
                    <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                        <div className="d-flex align-items-center flex-grow-1">
                            <div style={{ minWidth: "220px" }}>
                                <h2 className="fw-bold mb-0">{isPrivilegedUser ? "Dashboard" : "My Dashboard"}</h2>
                            </div>
                            <div className="input-group" style={{ maxWidth: "500px" }}>
                                <input type="text" className="form-control shadow-none" placeholder="Search logs..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {returnMessage.text && (
                        <div className={`alert alert-${returnMessage.type} alert-dismissible fade show`} role="alert">
                            {returnMessage.text}
                            <button type="button" className="btn-close" onClick={() => setReturnMessage({ text: "", type: "" })}></button>
                        </div>
                    )}

                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 text-white p-3 shadow-sm h-100" style={{ background: "linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)", borderRadius: "16px" }}>
                                <small className="text-white-50 text-uppercase fw-bold">Total Books</small>
                                <h2 className="fw-bold my-2">{stats.books}</h2>
                                <small className="text-white-50">Items in Library</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-white p-3 shadow-sm h-100" style={{ borderRadius: "16px" }}>
                                <small className="text-muted text-uppercase fw-bold">Total Users</small>
                                <h2 className="fw-bold my-2 text-dark">{isPrivilegedUser ? stats.users : "—"}</h2>
                                <small className="text-success fw-bold">{isPrivilegedUser ? "Active Members" : "Restricted Access"}</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-white p-3 shadow-sm h-100" style={{ borderRadius: "16px" }}>
                                <small className="text-muted text-uppercase fw-bold">Borrowed</small>
                                <h2 className="fw-bold my-2 text-warning">{stats.borrowed}</h2>
                                <small className="text-muted">{isPrivilegedUser ? "Out for Reading" : "My Active Borrows"}</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-white p-3 shadow-sm h-100" style={{ borderRadius: "16px" }}>
                                <small className="text-muted text-uppercase fw-bold">Overdue</small>
                                <h2 className="fw-bold my-2 text-danger">{stats.overdue}</h2>
                                <small className="text-danger fw-bold">{isPrivilegedUser ? "Action Needed" : "My Overdue Books"}</small>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        <div className="col-lg-4">
                            <div className="card border-0 bg-white p-4 shadow-sm" style={{ borderRadius: "16px" }}>
                                <h5 className="fw-bold text-dark mb-4">Inventory Breakdown</h5>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="position-relative d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{
                                            width: "130px", height: "130px", borderRadius: "50%",
                                            background: `conic-gradient(
                                                #4361ee 0% ${inventory.physical}%, 
                                                #4cc9f0 ${inventory.physical}% ${inventory.physical + inventory.ebook}%, 
                                                #f72585 ${inventory.physical + inventory.ebook}% 100%
                                            )`
                                        }}>
                                        <div className="bg-white rounded-circle d-flex flex-column align-items-center justify-content-center shadow-sm" style={{ width: "90px", height: "90px" }}>
                                            <h5 className="fw-bold mb-0">{inventory.physical}%</h5>
                                            <small className="text-muted" style={{ fontSize: "0.65rem" }}>Books</small>
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column gap-2 flex-grow-1 ms-3">
                                        <div className="d-flex justify-content-between align-items-center"><span className="small text-muted"><span className="badge bg-primary rounded-circle me-1">•</span>Books</span><span className="fw-bold small">{inventory.physical}%</span></div>
                                        <div className="d-flex justify-content-between align-items-center"><span className="small text-muted"><span className="badge bg-info rounded-circle me-1">•</span>eBooks</span><span className="fw-bold small">{inventory.ebook}%</span></div>
                                        <div className="d-flex justify-content-between align-items-center"><span className="small text-muted"><span className="badge bg-danger rounded-circle me-1">•</span>Journals</span><span className="fw-bold small">{inventory.journal}%</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-8">
                            <div className="card border-0 bg-white p-4 shadow-sm h-100" style={{ borderRadius: "16px" }}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fw-bold text-dark mb-0">{isPrivilegedUser ? "Recent Borrowing Activity" : "My Borrowing History"}</h5>
                                    {isPrivilegedUser && <Link to="/borrowing-log" className="btn btn-sm btn-outline-secondary rounded-pill px-3">View All</Link>}
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th style={{ minWidth: "150px" }}>User</th>
                                                <th style={{ minWidth: "250px" }}>Book</th>
                                                <th style={{ minWidth: "120px" }}>Borrow Date</th>
                                                <th style={{ minWidth: "130px" }}>Status</th>
                                                <th style={{ minWidth: "100px" }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredLogs.length > 0 ? (
                                                filteredLogs.map(log => {
                                                    const isCurrentlyOverdue = !log.returnDate && ((new Date() - new Date(log.borrowDate)) / (1000 * 60 * 60 * 24)) > 14;

                                                    return (
                                                        <tr key={log.id}>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <div className="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "30px", height: "30px", fontSize: "0.8rem" }}>
                                                                        {log.username ? log.username.charAt(0).toUpperCase() : "U"}
                                                                    </div>
                                                                    <span className="text-truncate fw-semibold text-dark" style={{ maxWidth: "120px" }}>
                                                                        {log.username}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td>{log.bookTitle}</td>
                                                            <td>{new Date(log.borrowDate).toLocaleDateString()}</td>
                                                            <td>
                                                                {log.returnDate ? (
                                                                    <span className={`badge ${log.isOverdue ? "bg-danger" : "bg-secondary"}`}>
                                                                        {log.isOverdue ? "Returned Late" : "Returned"}
                                                                    </span>
                                                                ) : isCurrentlyOverdue ? (
                                                                    <span className="badge bg-danger shadow-sm">Overdue</span>
                                                                ) : (
                                                                    <span className="badge bg-success">Active</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {!log.returnDate ? (
                                                                    <button
                                                                        onClick={() => handleReturn(log.bookId, log.username)}
                                                                        disabled={processingId === log.bookId}
                                                                        className={`btn btn-sm fw-bold ${isCurrentlyOverdue ? 'btn-danger' : 'btn-outline-primary'}`}
                                                                    >
                                                                        {processingId === log.bookId ? "..." : "Return"}
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-muted small">—</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr><td colSpan="5" className="text-center text-muted py-4">No borrowing activity found.</td></tr>
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