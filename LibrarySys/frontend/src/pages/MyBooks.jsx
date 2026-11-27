import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import "bootstrap/dist/css/bootstrap.min.css";

function MyBooks() {
    const navigate = useNavigate();
    const [myBooks, setMyBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState("");
    const [returningId, setReturningId] = useState(null);
    const [viewMode, setViewMode] = useState("grid");

    const [filters, setFilters] = useState({
        status: "All",
        type: "All",
        author: "",
        search: "",
        sort: "Due Soonest"
    });

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 9;

    const getUserIdFromToken = (token) => {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );
            const decoded = JSON.parse(jsonPayload);
            return (
                decoded.id ||
                decoded.Id ||
                decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
                null
            );
        } catch {
            return null;
        }
    };

    const fetchMyBooks = useCallback(async () => {
        setIsLoading(true);
        const token = (localStorage.getItem("token") || sessionStorage.getItem("token"))?.trim();
        const storedUsername = (localStorage.getItem("username") || sessionStorage.getItem("username"))?.trim();

        if (!token || !storedUsername) {
            navigate("/login");
            return;
        }

        const userId = getUserIdFromToken(token);
        const headers = { Authorization: `Bearer ${token}` };
        const baseUrl = process.env.REACT_APP_API_URL || "";

        try {
            const logsUrl = userId
                ? `${baseUrl}/api/BorrowingLog/LogOfUser/${userId}`
                : `${baseUrl}/api/BorrowingLog/GetAllLog`;

            const [logsRes, booksRes] = await Promise.all([
                axios.get(logsUrl, { headers }),
                axios.get(`${baseUrl}/api/Book/GetAllBooks`, { headers })
            ]);

            const rawLogs = Array.isArray(logsRes.data)
                ? logsRes.data
                : logsRes.data?.$values || [];
            const rawBooks = Array.isArray(booksRes.data)
                ? booksRes.data
                : booksRes.data?.$values || booksRes.data?.books || [];

            const bookMap = {};
            rawBooks.forEach((b) => {
                const id = b.id || b.Id;
                if (id) bookMap[id] = b;
            });

            const now = new Date();

            const activeBorrows = rawLogs
                .filter((log) => {
                    const logUser = (log.username || log.Username || "").toLowerCase();
                    const matchesUser = userId ? true : logUser === storedUsername.toLowerCase();
                    const ret = log.returnDate || log.ReturnDate;
                    const isUnreturned = !ret || String(ret).startsWith("0001-01-01");
                    return matchesUser && isUnreturned;
                })
                .map((log) => {
                    const bookId = log.bookId || log.BookId;
                    const bookInfo = bookMap[bookId] || {};

                    const borrowRaw = log.borrowDate || log.BorrowDate;
                    const borrowDate = borrowRaw ? new Date(borrowRaw) : new Date();

                    const dueRaw = log.dueDate || log.DueDate;
                    const hasValidDue = dueRaw && !String(dueRaw).startsWith("0001-01-01");
                    const dueDate = hasValidDue
                        ? new Date(dueRaw)
                        : new Date(borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000);

                    const diffMs = dueDate.getTime() - now.getTime();
                    const daysDiff = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                    const isOverdue = Boolean(log.isOverdue || log.IsOverdue) || daysDiff < 0;

                    return {
                        logId: log.id || log.Id,
                        bookId,
                        title: log.bookTitle || log.BookTitle || bookInfo.title || bookInfo.Title || "Untitled",
                        author: bookInfo.author || bookInfo.Author || "Unknown Author",
                        type: bookInfo.type || bookInfo.Type || "Physical Book",
                        borrowDate,
                        dueDate,
                        daysDiff,
                        isOverdue
                    };
                });

            setMyBooks(activeBorrows);
        } catch (err) {
            console.error("Error fetching borrowed books:", err);
            setActionMessage("Failed to load your borrowed books.");
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchMyBooks();
    }, [fetchMyBooks]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const handleReturn = async (bookId) => {
        setReturningId(bookId);
        setActionMessage("");

        const token = (localStorage.getItem("token") || sessionStorage.getItem("token"))?.trim();
        const storedUsername = (localStorage.getItem("username") || sessionStorage.getItem("username"))?.trim();

        if (!token || !storedUsername) {
            setActionMessage("Session missing. Please log in again.");
            setReturningId(null);
            return;
        }

        try {
            const baseUrl = process.env.REACT_APP_API_URL || "";
            const res = await axios.post(
                `${baseUrl}/api/Borrow/ReturnBook`,
                { bookId, username: storedUsername },
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );

            setActionMessage(res.data?.message || "Book returned successfully!");
            fetchMyBooks();
        } catch (err) {
            setActionMessage(err.response?.data?.message || "Failed to return book.");
        } finally {
            setReturningId(null);
        }
    };

    const formatDate = (dateObj) =>
        dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    let filteredBooks = myBooks.filter((item) => {
        if (filters.status === "Borrowed" && item.isOverdue) return false;
        if (filters.status === "Overdue" && !item.isOverdue) return false;
        if (filters.type !== "All" && item.type !== filters.type) return false;
        if (filters.author && !item.author.toLowerCase().includes(filters.author.toLowerCase())) return false;

        if (filters.search) {
            const q = filters.search.toLowerCase();
            if (!item.title.toLowerCase().includes(q) && !item.author.toLowerCase().includes(q)) {
                return false;
            }
        }
        return true;
    });

    if (filters.sort === "Due Soonest") {
        filteredBooks.sort((a, b) => a.dueDate - b.dueDate);
    } else if (filters.sort === "Recently Borrowed") {
        filteredBooks.sort((a, b) => b.borrowDate - a.borrowDate);
    } else if (filters.sort === "Title (A–Z)") {
        filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sort === "Title (Z–A)") {
        filteredBooks.sort((a, b) => b.title.localeCompare(a.title));
    }

    const totalPages = Math.ceil(filteredBooks.length / pageSize);
    const paginatedBooks = filteredBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="p-0 min-vh-100">
            <Navbar activePage="my-books" />

            <div className="container-fluid py-4 px-4">
                <div className="row g-4 align-items-start">
                    {/* Left Filter Sidebar */}
                    <div className="col-md-3 col-lg-2">
                        <div className="p-4 glass-panel filter-sidebar border-0 shadow">
                            <h5 className="fw-bold mb-3">My Book Filters</h5>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">STATUS</label>
                                <select
                                    className="form-select shadow-none"
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                >
                                    <option>All</option>
                                    <option>Borrowed</option>
                                    <option>Overdue</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">TYPE</label>
                                <select
                                    className="form-select shadow-none"
                                    value={filters.type}
                                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                >
                                    <option>All</option>
                                    <option>Physical Book</option>
                                    <option>eBook</option>
                                    <option>Journal</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">AUTHOR</label>
                                <input
                                    type="text"
                                    className="form-control shadow-none"
                                    placeholder="Filter by Author"
                                    value={filters.author}
                                    onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">SORT ORDER</label>
                                <select
                                    className="form-select shadow-none"
                                    value={filters.sort}
                                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                                >
                                    <option>Due Soonest</option>
                                    <option>Recently Borrowed</option>
                                    <option>Title (A–Z)</option>
                                    <option>Title (Z–A)</option>
                                </select>
                            </div>

                            <button
                                className="btn btn-primary w-100 mt-2"
                                onClick={() =>
                                    setFilters({
                                        status: "All",
                                        type: "All",
                                        author: "",
                                        search: "",
                                        sort: "Due Soonest"
                                    })
                                }
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9 col-lg-10 d-flex flex-column">
                        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                            <div className="d-flex align-items-center flex-grow-1 gap-3">
                                <div style={{ minWidth: "220px" }}>
                                    <h5 className="fw-bold mb-0 text-nowrap text-white">
                                        My Books{" "}
                                        <span className="text-white-50 fw-normal">
                                            ({myBooks.length} / 5 borrowed)
                                        </span>
                                    </h5>
                                </div>
                                <div className="input-group" style={{ maxWidth: "400px" }}>
                                    <input
                                        type="text"
                                        className="form-control shadow-none bg-white text-dark border-0"
                                        placeholder="Search title or author..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                <div className="btn-group" role="group">
                                    <button
                                        className={`btn ${viewMode === "grid" ? "btn-light" : "btn-outline-light"}`}
                                        onClick={() => setViewMode("grid")}
                                        title="Grid View"
                                    >
                                        <span>&#9632;</span>
                                    </button>
                                    <button
                                        className={`btn ${viewMode === "list" ? "btn-light" : "btn-outline-light"}`}
                                        onClick={() => setViewMode("list")}
                                        title="List View"
                                    >
                                        <span>&#9776;</span>
                                    </button>
                                </div>

                                <Link to="/settings" className="btn btn-outline-light" title="Settings">
                                    <span>&#9881;</span>
                                </Link>
                            </div>
                        </div>

                        {actionMessage && (
                            <div
                                className={`alert ${actionMessage.toLowerCase().includes("successfully") ||
                                        actionMessage.toLowerCase().includes("returned")
                                        ? "alert-success"
                                        : "alert-danger"
                                    } alert-dismissible fade show`}
                                role="alert"
                            >
                                {actionMessage}
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setActionMessage("")}
                                ></button>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="card border-0 shadow glass-panel" style={{ borderRadius: "16px" }}>
                                <div className="card-body p-5 d-flex justify-content-center">
                                    <LoadingSpinner />
                                </div>
                            </div>
                        ) : viewMode === "grid" ? (
                            <div className="row g-4">
                                {paginatedBooks.map((item) => {
                                    const overdueDays = Math.abs(item.daysDiff);
                                    const dueText = item.isOverdue
                                        ? `${overdueDays} ${overdueDays === 1 ? "day" : "days"} overdue`
                                        : item.daysDiff === 0
                                            ? "Due today"
                                            : `${item.daysDiff} ${item.daysDiff === 1 ? "day" : "days"} left`;

                                    return (
                                        <div className="col-12 col-md-6 col-xl-4 d-flex" key={item.logId}>
                                            <div
                                                className="card h-100 w-100 border-0 shadow-sm p-3 position-relative glass-panel d-flex flex-column justify-content-between"
                                                style={{ borderRadius: "16px", cursor: "pointer" }}
                                                onClick={() => navigate(`/books/details/${item.bookId}`)}
                                            >
                                                <div>
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <span
                                                            className={`badge ${item.type === "eBook"
                                                                    ? "bg-info"
                                                                    : item.type === "Journal"
                                                                        ? "bg-danger"
                                                                        : "bg-primary"
                                                                }`}
                                                        >
                                                            {item.type}
                                                        </span>
                                                        <span
                                                            className={`badge ${item.isOverdue ? "bg-danger" : "bg-success"
                                                                }`}
                                                        >
                                                            {item.isOverdue ? "Overdue" : "Borrowed"}
                                                        </span>
                                                    </div>

                                                    <h5
                                                        className="fw-bold text-dark mt-2 mb-1 text-truncate"
                                                        title={item.title}
                                                    >
                                                        {item.title}
                                                    </h5>
                                                    <p className="opacity-75 small mb-3 text-truncate">
                                                        by {item.author}
                                                    </p>

                                                    <div className="small text-dark opacity-75 mb-3">
                                                        <div>Borrowed on: {formatDate(item.borrowDate)}</div>
                                                        <div>
                                                            Due on: {formatDate(item.dueDate)}{" "}
                                                            <span
                                                                className={
                                                                    item.isOverdue
                                                                        ? "text-danger fw-semibold"
                                                                        : "fw-semibold"
                                                                }
                                                            >
                                                                ({dueText})
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div
                                                    className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top flex-nowrap gap-2"
                                                    style={{ borderColor: "rgba(30, 41, 59, 0.15)" }}
                                                >
                                                    <span
                                                        className={`fw-semibold small text-nowrap ${item.isOverdue ? "text-danger" : "opacity-75"
                                                            }`}
                                                    >
                                                        {dueText}
                                                    </span>

                                                    <div className="d-flex align-items-center gap-1 flex-nowrap">
                                                        <Link
                                                            to={`/books/details/${item.bookId}`}
                                                            className="btn btn-outline-primary btn-sm px-2 bg-white text-nowrap"
                                                            style={{ borderRadius: "8px" }}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            Details
                                                        </Link>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleReturn(item.bookId);
                                                            }}
                                                            disabled={returningId === item.bookId}
                                                            className="btn btn-primary btn-sm px-2 text-nowrap"
                                                            style={{ borderRadius: "8px" }}
                                                        >
                                                            {returningId === item.bookId ? "..." : "Return"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredBooks.length === 0 && (
                                    <div className="col-12 text-center text-white py-5">
                                        <p className="mb-3">
                                            {myBooks.length === 0
                                                ? "You haven't borrowed any books yet."
                                                : "No borrowed books match your filters."}
                                        </p>
                                        {myBooks.length === 0 && (
                                            <Link to="/books" className="btn btn-primary px-4">
                                                Browse Books
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="card border-0 shadow glass-panel" style={{ borderRadius: "16px" }}>
                                <div className="card-body p-4">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead>
                                                <tr className="small fw-bold">
                                                    <th>TITLE</th>
                                                    <th>AUTHOR</th>
                                                    <th>TYPE</th>
                                                    <th>BORROWED</th>
                                                    <th>DUE DATE</th>
                                                    <th>STATUS</th>
                                                    <th>ACTIONS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedBooks.map((item) => (
                                                    <tr key={item.logId}>
                                                        <td className="fw-bold text-dark">{item.title}</td>
                                                        <td>{item.author}</td>
                                                        <td>
                                                            <span className="badge bg-light text-dark border">
                                                                {item.type}
                                                            </span>
                                                        </td>
                                                        <td>{formatDate(item.borrowDate)}</td>
                                                        <td>{formatDate(item.dueDate)}</td>
                                                        <td>
                                                            <span
                                                                className={`badge ${item.isOverdue ? "bg-danger" : "bg-success"
                                                                    }`}
                                                            >
                                                                {item.isOverdue ? "Overdue" : "Borrowed"}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center gap-1">
                                                                <Link
                                                                    to={`/books/details/${item.bookId}`}
                                                                    className="btn btn-outline-primary btn-sm px-3 bg-white"
                                                                    style={{ borderRadius: "8px" }}
                                                                >
                                                                    Details
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleReturn(item.bookId)}
                                                                    disabled={returningId === item.bookId}
                                                                    className="btn btn-primary btn-sm"
                                                                    style={{ borderRadius: "8px" }}
                                                                >
                                                                    {returningId === item.bookId ? "..." : "Return"}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filteredBooks.length === 0 && (
                                                    <tr>
                                                        <td colSpan="7" className="text-center text-muted py-4">
                                                            No borrowed books found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isLoading && totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-4 mb-2">
                                <nav>
                                    <ul className="pagination shadow-sm mb-0">
                                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                            <button
                                                className="page-link bg-white text-dark border-0 shadow-sm"
                                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                                                onClick={() =>
                                                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                                }
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

export default MyBooks;