import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import "bootstrap/dist/css/bootstrap.min.css";

function Dashboard() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ books: 0, users: 0, borrowed: 0, overdue: 0 });
    const [recentLogs, setRecentLogs] = useState([]);
    const [filters, setFilters] = useState({ status: "All", search: "" });
    const [returnMessage, setReturnMessage] = useState({ text: "", type: "" });
    const [processingId, setProcessingId] = useState(null);
    const [allBooks, setAllBooks] = useState([]);

    const [inventory, setInventory] = useState({ physical: 0, ebook: 0, journal: 0 });
    const [borrowData, setBorrowData] = useState({ activeBorrows: 0, maxLimit: 5 });

    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 5;

    const currentUsername = (localStorage.getItem("username") || sessionStorage.getItem("username"))?.trim() || "";
    const roleString = (localStorage.getItem("role") || sessionStorage.getItem("role"))?.toUpperCase() || "";
    const isPrivilegedUser = roleString.includes("LIBRARIAN") || roleString.includes("ADMIN") || currentUsername.toUpperCase() === "HMIR";

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        const token = (localStorage.getItem("token") || sessionStorage.getItem("token"))?.trim();
        if (!token) {
            navigate("/login");
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        let books = [];
        let users = [];
        let logs = [];

        try {
            const booksRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/Book/GetAllBooks`, { headers });
            books = Array.isArray(booksRes.data) ? booksRes.data : (booksRes.data?.$values || booksRes.data?.books || booksRes.data?.data || []);
            setAllBooks(books);

            let pCount = 0; let eCount = 0; let jCount = 0;
            books.forEach(b => {
                const bType = b.type || b.Type || "Physical Book";
                if (bType === "eBook") eCount++;
                else if (bType === "Journal") jCount++;
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
                users = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.$values || usersRes.data?.users || usersRes.data?.data || []);
            } catch (err) { console.warn("Users fetch restricted."); }
        }

        try {
            const logsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/BorrowingLog/GetAllLog`, { headers });
            let fetchedLogs = Array.isArray(logsRes.data) ? logsRes.data : (logsRes.data?.$values || logsRes.data?.logs || logsRes.data?.data || []);

            if (!isPrivilegedUser) {
                fetchedLogs = fetchedLogs.filter(log => {
                    const uName = log.username || log.Username || "";
                    return uName.toLowerCase() === currentUsername.toLowerCase();
                });
            }

            logs = [...fetchedLogs].sort((a, b) => {
                const dateA = new Date(a.borrowDate || a.BorrowDate || Date.now());
                const dateB = new Date(b.borrowDate || b.BorrowDate || Date.now());
                return dateB - dateA;
            });
        } catch (err) { console.error("Logs fetch failed:", err); }

        const calculateActiveOverdue = (log) => {
            const retDate = log.returnDate || log.ReturnDate;
            const isOvr = log.isOverdue ?? log.IsOverdue ?? false;
            if (retDate && !String(retDate).startsWith("0001")) return isOvr;
            const bDate = log.borrowDate || log.BorrowDate;
            if (!bDate) return false;
            const daysBorrowed = (new Date() - new Date(bDate)) / (1000 * 60 * 60 * 24);
            return daysBorrowed > 14;
        };

        setStats({
            books: books.length,
            users: users.length,
            borrowed: logs.filter(l => {
                const retDate = l.returnDate || l.ReturnDate;
                return !retDate || String(retDate).startsWith("0001");
            }).length,
            overdue: logs.filter(l => calculateActiveOverdue(l)).length
        });

        setRecentLogs(logs.slice(0, 15));

        if (!isPrivilegedUser && currentUsername) {
            try {
                const countRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/Borrow/ActiveCount/${currentUsername}`, { headers });
                setBorrowData(countRes.data);
            } catch (err) {
                console.error("Failed to fetch borrow count", err);
            }
        }

        setIsLoading(false);
    }, [currentUsername, isPrivilegedUser, navigate]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const handleReturn = async (log) => {
        const bId = log.bookId || log.BookId;
        const bTitle = log.bookTitle || log.BookTitle;
        const targetBookId = bId || allBooks.find(b => (b.title || b.Title) === bTitle)?.id;
        const uName = log.username || log.Username;

        setProcessingId(log.id || log.Id);
        setReturnMessage({ text: "", type: "" });

        const token = (localStorage.getItem("token") || sessionStorage.getItem("token"))?.trim();
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/Borrow/ReturnBook`,
                { bookId: targetBookId, username: uName },
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
        const bDate = log.borrowDate || log.BorrowDate;
        const retDate = log.returnDate || log.ReturnDate;
        const isOvr = log.isOverdue ?? log.IsOverdue ?? false;

        const isReturned = retDate && !String(retDate).startsWith("0001");
        const isCurrentlyOverdue = !isReturned && bDate && ((new Date() - new Date(bDate)) / (1000 * 60 * 60 * 24)) > 14;

        if (filters.status === "Active" && isReturned) return false;
        if (filters.status === "Returned" && !isReturned) return false;
        if (filters.status === "Overdue" && !isOvr && !isCurrentlyOverdue) return false;

        const uName = String(log.username || log.Username || "");
        const bTitle = String(log.bookTitle || log.BookTitle || "");

        if (filters.search && !(
            uName.toLowerCase().includes(filters.search.toLowerCase()) ||
            bTitle.toLowerCase().includes(filters.search.toLowerCase())
        )) return false;

        return true;
    });

    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

    const progressPercentage = (borrowData.activeBorrows / borrowData.maxLimit) * 100;

    return (
        <div className="p-0 min-vh-100">
            <Navbar activePage="dashboard" />

            <div className="container-fluid py-4 px-4">
                <div className="row g-4 align-items-start">
                    <div className="col-md-3 col-lg-2">
                        <div className="p-4 glass-panel filter-sidebar border-0 shadow">
                            <h5 className="fw-bold mb-3">Filters</h5>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">STATUS</label>
                                <select className="form-select shadow-none" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                                    <option>All</option>
                                    <option>Active</option>
                                    <option>Returned</option>
                                    <option>Overdue</option>
                                </select>
                            </div>
                            <button className="btn btn-primary w-100 mt-2" onClick={() => setFilters({ status: "All", search: "" })}>
                                Reset Filters
                            </button>

                            {!isPrivilegedUser && (
                                <div className="mt-4 pt-4 border-top" style={{ borderColor: "rgba(30, 41, 59, 0.15)" }}>
                                    <h6 className="fw-bold mb-3 small">MY BORROWING LIMIT</h6>
                                    <div className="d-flex justify-content-between align-items-end mb-2">
                                        <h3 className="fw-bold mb-0 text-primary">
                                            {borrowData.activeBorrows} <span className="fs-6 opacity-75">/ {borrowData.maxLimit}</span>
                                        </h3>
                                    </div>
                                    <div className="progress mt-2" style={{ height: "6px", borderRadius: "10px", backgroundColor: "rgba(0,0,0,0.1)" }}>
                                        <div
                                            className={`progress-bar ${progressPercentage >= 100 ? 'bg-danger' : 'bg-primary'}`}
                                            role="progressbar"
                                            style={{ width: `${progressPercentage}%` }}
                                            aria-valuenow={borrowData.activeBorrows}
                                            aria-valuemin="0"
                                            aria-valuemax={borrowData.maxLimit}
                                        ></div>
                                    </div>
                                    {progressPercentage >= 100 && (
                                        <small className="text-danger mt-2 d-block fw-semibold" style={{ fontSize: "0.75rem" }}>
                                            Limit reached. Return a book to borrow again.
                                        </small>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-9 col-lg-10 d-flex flex-column">
                        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                            <div className="d-flex align-items-center flex-grow-1 gap-3">
                                <div style={{ minWidth: "220px" }}>
                                    <h2 className="fw-bold mb-0 text-white">{isPrivilegedUser ? "Dashboard" : "My Dashboard"}</h2>
                                </div>
                                <div className="input-group" style={{ maxWidth: "400px" }}>
                                    <input type="text" className="form-control shadow-none bg-white text-dark border-0" placeholder="Search logs..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
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
                                <div className="card border-0 p-3 shadow-sm h-100 glass-panel" style={{ borderRadius: "16px" }}>
                                    <small className="text-uppercase fw-bold opacity-75">Total Users</small>
                                    <h2 className="fw-bold my-2 text-dark">{isPrivilegedUser ? stats.users : "—"}</h2>
                                    <small className="text-success fw-bold">{isPrivilegedUser ? "Active Members" : "Restricted Access"}</small>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 p-3 shadow-sm h-100 glass-panel" style={{ borderRadius: "16px" }}>
                                    <small className="text-uppercase fw-bold opacity-75">Borrowed</small>
                                    <h2 className="fw-bold my-2 text-warning">{stats.borrowed}</h2>
                                    <small className="opacity-75">{isPrivilegedUser ? "Out for Reading" : "My Active Borrows"}</small>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 p-3 shadow-sm h-100 glass-panel" style={{ borderRadius: "16px" }}>
                                    <small className="text-uppercase fw-bold opacity-75">Overdue</small>
                                    <h2 className="fw-bold my-2 text-danger">{stats.overdue}</h2>
                                    <small className="text-danger fw-bold">{isPrivilegedUser ? "Action Needed" : "My Overdue Books"}</small>
                                </div>
                            </div>
                        </div>

                        <div className="row g-4 align-items-start">
                            <div className="col-lg-4">
                                <div className="card border-0 p-4 shadow-sm glass-panel" style={{ borderRadius: "16px" }}>
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
                                                <h5 className="fw-bold mb-0 text-dark">{inventory.physical}%</h5>
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
                                <div className="card border-0 p-4 shadow-sm h-100 glass-panel" style={{ borderRadius: "16px" }}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="fw-bold text-dark mb-0">{isPrivilegedUser ? "Recent Borrowing Activity" : "My Borrowing History"}</h5>
                                        {isPrivilegedUser && <Link to="/borrowing-log" className="btn btn-sm btn-outline-secondary rounded-pill px-3">View All</Link>}
                                    </div>

                                    <div className="table-responsive">
                                        {isLoading ? (
                                            <LoadingSpinner />
                                        ) : (
                                                <table className="table table-hover align-middle mb-0">
                                                    <thead>
                                                        <tr className="small fw-bold">
                                                        <th style={{ minWidth: "130px" }}>User</th>
                                                        <th style={{ minWidth: "200px" }}>Book</th>
                                                        <th style={{ minWidth: "110px" }}>Borrow Date</th>
                                                        <th style={{ minWidth: "110px" }}>Due Date</th>
                                                        <th style={{ minWidth: "110px" }}>Status</th>
                                                        <th style={{ minWidth: "90px" }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedLogs.length > 0 ? (
                                                        paginatedLogs.map(log => {
                                                            const logId = log.id || log.Id;
                                                            const username = log.username || log.Username;
                                                            const bookTitle = log.bookTitle || log.BookTitle;
                                                            const borrowDate = log.borrowDate || log.BorrowDate;
                                                            const dueDate = log.dueDate || log.DueDate;
                                                            const returnDate = log.returnDate || log.ReturnDate;
                                                            const isOvr = log.isOverdue ?? log.IsOverdue ?? false;

                                                            let dueDateObj = null;
                                                            if (dueDate && !String(dueDate).startsWith("0001")) {
                                                                dueDateObj = new Date(dueDate);
                                                            } else if (borrowDate) {
                                                                dueDateObj = new Date(borrowDate);
                                                                dueDateObj.setDate(dueDateObj.getDate() + 14);
                                                            }

                                                            const isReturned = returnDate && !String(returnDate).startsWith("0001");
                                                            const today = new Date().setHours(0, 0, 0, 0);
                                                            const dueTime = dueDateObj ? new Date(dueDateObj).setHours(0, 0, 0, 0) : null;
                                                            const isCurrentlyOverdue = dueTime && today > dueTime && !isReturned;

                                                            const daysUntilDue = dueTime ? Math.ceil((dueTime - today) / (1000 * 60 * 60 * 24)) : null;
                                                            const isDueSoon = !isReturned && !isCurrentlyOverdue && daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0;

                                                            return (
                                                                <tr key={logId}>
                                                                    <td>
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <div className="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "30px", height: "30px", fontSize: "0.8rem" }}>
                                                                                {username ? username.charAt(0).toUpperCase() : "U"}
                                                                            </div>
                                                                            <span className="text-truncate fw-semibold text-dark" style={{ maxWidth: "120px" }}>
                                                                                {username}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="text-truncate" style={{ maxWidth: "180px" }} title={bookTitle}>{bookTitle}</td>
                                                                    <td>{borrowDate ? new Date(borrowDate).toLocaleDateString() : "N/A"}</td>
                                                                    <td>
                                                                        <span className={`fw-semibold ${isCurrentlyOverdue ? "text-danger" : isDueSoon ? "text-warning" : ""}`}>
                                                                            {dueDateObj ? dueDateObj.toLocaleDateString() : "N/A"}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        {isReturned ? (
                                                                            <span className={`badge ${isOvr ? "bg-danger" : "bg-secondary"}`}>
                                                                                {isOvr ? "Returned Late" : "Returned"}
                                                                            </span>
                                                                        ) : (
                                                                            isCurrentlyOverdue ? (
                                                                                <span className="badge bg-danger shadow-sm">Overdue</span>
                                                                            ) : isDueSoon ? (
                                                                                <span className="badge bg-warning text-dark shadow-sm">Due Soon</span>
                                                                            ) : (
                                                                                <span className="badge bg-success">Active</span>
                                                                            )
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {!isReturned ? (
                                                                            <button
                                                                                onClick={() => handleReturn(log)}
                                                                                disabled={processingId === logId}
                                                                                className={`btn btn-sm fw-bold ${isCurrentlyOverdue ? 'btn-danger' : 'btn-outline-primary'}`}
                                                                            >
                                                                                {processingId === logId ? "..." : "Return"}
                                                                            </button>
                                                                        ) : (
                                                                            <span className="text-muted small">—</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr><td colSpan="6" className="text-center text-muted py-4">No borrowing activity found.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>

                                    {!isLoading && totalPages > 1 && (
                                        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top" style={{ borderColor: "rgba(30, 41, 59, 0.15)" }}>
                                            <span className="small text-muted fw-semibold">
                                                Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, filteredLogs.length)} of {filteredLogs.length} recent logs
                                            </span>
                                            <div className="btn-group shadow-sm">
                                                <button
                                                    className="btn btn-outline-primary btn-sm px-3 bg-white"
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </button>
                                                <button className="btn btn-primary btn-sm px-4 fw-bold" disabled>
                                                    {currentPage} / {totalPages}
                                                </button>
                                                <button
                                                    className="btn btn-outline-primary btn-sm px-3 bg-white"
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    )}
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