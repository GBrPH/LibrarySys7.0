import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import DetailsBook from "./DetailsBook";
import "bootstrap/dist/css/bootstrap.min.css";

function Books() {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [borrowMessage, setBorrowMessage] = useState("");
    const [borrowingId, setBorrowingId] = useState(null);
    const [viewMode, setViewMode] = useState("grid");
    const [selectedBook, setSelectedBook] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [filters, setFilters] = useState({
        status: "All",
        author: "",
        copies: "All",
        search: "",
        az: "None",
        type: "All"
    });

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 9;

    const roleString = (localStorage.getItem("role") || sessionStorage.getItem("role"))?.toUpperCase() || "";
    const usernameString = (localStorage.getItem("username") || sessionStorage.getItem("username"))?.toUpperCase() || "";
    const isPrivilegedUser = roleString.includes("LIBRARIAN") || roleString.includes("ADMIN") || usernameString === "HMIR";

    const fetchBooks = useCallback(() => {
        const token = (localStorage.getItem("token") || sessionStorage.getItem("token"))?.trim();
        if (!token) {
            navigate("/login");
            return;
        }

        axios.get(`${process.env.REACT_APP_API_URL}/api/Book/GetAllBooks`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                const rawData = Array.isArray(res.data) ? res.data : (res.data?.$values || res.data?.books || res.data?.data || []);
                setBooks(rawData);
            })
            .catch(err => console.error("Error fetching books:", err));
    }, [navigate]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const handleOpenDetails = (book) => {
        setSelectedBook(book);
        setShowDetailsModal(true);
    };

    const handleCloseDetails = () => {
        setSelectedBook(null);
        setShowDetailsModal(false);
    };

    const handleBorrow = async (bookId) => {
        setBorrowingId(bookId);
        setBorrowMessage("");

        const token = (localStorage.getItem("token") || sessionStorage.getItem("token"))?.trim();
        const storedUsername = (localStorage.getItem("username") || sessionStorage.getItem("username"))?.trim();

        if (!token || !storedUsername) {
            setBorrowMessage("Session missing. Please log in again.");
            setBorrowingId(null);
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/Borrow/BorrowBook`,
                { bookId: bookId, username: storedUsername },
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );

            setBorrowMessage(response.data.message || "Book borrowed successfully!");
            fetchBooks();
        } catch (err) {
            setBorrowMessage(err.response?.data?.message || "Failed to borrow book.");
        } finally {
            setBorrowingId(null);
        }
    };

    let filteredBooks = books.filter(book => {
        const copies = book.copies ?? book.copiesAvailable ?? book.Copies ?? book.CopiesAvailable ?? 0;
        const copyCount = Number(copies);
        const isAvailable = copyCount > 0;
        const bookType = book.type || book.Type || "Physical Book";
        const bAuthor = String(book.author || book.Author || "");
        const bTitle = String(book.title || book.Title || "");

        if (filters.status === "Available" && !isAvailable) return false;
        if (filters.status === "Borrowed" && isAvailable) return false;
        if (filters.type !== "All" && bookType !== filters.type) return false;

        if (filters.author && !bAuthor.toLowerCase().includes(filters.author.toLowerCase())) return false;

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const titleMatch = bTitle.toLowerCase().includes(searchLower);
            const authorMatch = bAuthor.toLowerCase().includes(searchLower);
            if (!titleMatch && !authorMatch) return false;
        }

        return true;
    });

    if (filters.az === "Title (A–Z)") {
        filteredBooks.sort((a, b) => (a.title || a.Title || "").localeCompare(b.title || b.Title || ""));
    } else if (filters.az === "Title (Z–A)") {
        filteredBooks.sort((a, b) => (b.title || b.Title || "").localeCompare(a.title || a.Title || ""));
    } else if (filters.az === "Author (A–Z)") {
        filteredBooks.sort((a, b) => (a.author || a.Author || "").localeCompare(b.author || b.Author || ""));
    } else if (filters.az === "Author (Z–A)") {
        filteredBooks.sort((a, b) => (b.author || b.Author || "").localeCompare(a.author || a.Author || ""));
    }

    const totalPages = Math.ceil(filteredBooks.length / pageSize);
    const paginatedBooks = filteredBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="p-0 min-vh-100">
            <Navbar activePage="books" />

            <div className="container-fluid py-4 px-4">
                <div className="row g-4 align-items-start">
                    <div className="col-md-3 col-lg-2">
                        <div className="p-4 glass-panel filter-sidebar border-0 shadow">
                            <h5 className="fw-bold mb-3">Book Filters</h5>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">STATUS</label>
                                <select className="form-select shadow-none" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                                    <option>All</option>
                                    <option>Available</option>
                                    <option>Borrowed</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">TYPE</label>
                                <select className="form-select shadow-none" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
                                    <option>All</option>
                                    <option>Physical Book</option>
                                    <option>eBook</option>
                                    <option>Journal</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">AUTHOR</label>
                                <input type="text" className="form-control shadow-none" placeholder="Filter by Author" value={filters.author} onChange={e => setFilters({ ...filters, author: e.target.value })} />
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">SORT ORDER</label>
                                <select className="form-select shadow-none" value={filters.az} onChange={e => setFilters({ ...filters, az: e.target.value })}>
                                    <option>None</option>
                                    <option>Title (A–Z)</option>
                                    <option>Title (Z–A)</option>
                                    <option>Author (A–Z)</option>
                                    <option>Author (Z–A)</option>
                                </select>
                            </div>

                            <button className="btn btn-primary w-100 mt-2" onClick={() => setFilters({ status: "All", author: "", copies: "All", search: "", az: "None", type: "All" })}>
                                Reset Filters
                            </button>
                        </div>
                    </div>

                    <div className="col-md-9 col-lg-10 d-flex flex-column">
                        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                            <div className="d-flex align-items-center flex-grow-1 gap-3">
                                <div style={{ minWidth: "220px" }}>
                                    <h5 className="fw-bold mb-0 text-nowrap text-white">
                                        Books <span className="text-white-50 fw-normal">({filteredBooks.length} total)</span>
                                    </h5>
                                </div>
                                <div className="input-group" style={{ maxWidth: "400px" }}>
                                    <input type="text" className="form-control shadow-none bg-white text-dark border-0" placeholder="Search title or author..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                {isPrivilegedUser && <Link to="/add-book" className="btn btn-success fw-semibold text-nowrap ms-2"> Add Book </Link>}

                                <div className="btn-group" role="group">
                                    <button className={`btn ${viewMode === "grid" ? "btn-light" : "btn-outline-light"}`} onClick={() => setViewMode("grid")} title="Grid View">
                                        <span>&#9632;</span>
                                    </button>
                                    <button className={`btn ${viewMode === "list" ? "btn-light" : "btn-outline-light"}`} onClick={() => setViewMode("list")} title="List View">
                                        <span>&#9776;</span>
                                    </button>
                                </div>

                                <Link to="/Settings" className="btn btn-outline-light" title="Settings">
                                    <span>&#9881;</span>
                                </Link>
                            </div>
                        </div>

                        {borrowMessage && (
                            <div className={`alert ${borrowMessage.includes("successfully") ? "alert-success" : "alert-danger"} alert-dismissible fade show`} role="alert">
                                {borrowMessage}
                                <button type="button" className="btn-close" onClick={() => setBorrowMessage("")}></button>
                            </div>
                        )}

                        {viewMode === "grid" ? (
                            <div className="row g-4">
                                {paginatedBooks.map(book => {
                                    const bookId = book.id || book.Id;
                                    const title = book.title || book.Title;
                                    const author = book.author || book.Author;
                                    const copies = book.copies ?? book.copiesAvailable ?? book.Copies ?? book.CopiesAvailable ?? 0;
                                    const copyCount = Number(copies);
                                    const isBookAvailable = copyCount > 0;
                                    const bookType = book.type || book.Type || "Physical Book";

                                    return (
                                        <div className="col-12 col-md-6 col-xl-4 d-flex" key={bookId}>
                                            <div
                                                className="card h-100 w-100 border-0 shadow-sm p-3 position-relative glass-panel d-flex flex-column justify-content-between"
                                                style={{ borderRadius: "16px", cursor: "pointer" }}
                                                onClick={() => handleOpenDetails(book)}
                                            >
                                                <div>
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <span className={`badge ${bookType === "eBook" ? "bg-info" : bookType === "Journal" ? "bg-danger" : "bg-primary"}`}>
                                                            {bookType}
                                                        </span>
                                                        <span className={`badge ${isBookAvailable ? "bg-success" : "bg-secondary"}`}>
                                                            {isBookAvailable ? "Available" : "Borrowed"}
                                                        </span>
                                                    </div>

                                                    <h5 className="fw-bold text-dark mt-2 mb-1 text-truncate" title={title}>{title}</h5>
                                                    <p className="opacity-75 small mb-3 text-truncate">by {author}</p>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top flex-nowrap gap-2" style={{ borderColor: "rgba(30, 41, 59, 0.15)" }}>
                                                    <span className="fw-semibold small opacity-75 text-nowrap">
                                                        {copyCount} {copyCount === 1 ? "copy" : "copies"} left
                                                    </span>

                                                    <div className="d-flex align-items-center gap-1 flex-nowrap">
                                                        <Link
                                                            to={`/books/details/${bookId}`}
                                                            className="btn btn-outline-primary btn-sm px-2 bg-white text-nowrap"
                                                            style={{ borderRadius: "8px" }}
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            Details
                                                        </Link>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleBorrow(bookId);
                                                            }}
                                                            disabled={borrowingId === bookId || !isBookAvailable}
                                                            className="btn btn-primary btn-sm px-2 text-nowrap"
                                                            style={{ borderRadius: "8px" }}
                                                        >
                                                            {borrowingId === bookId ? "..." : "Borrow"}
                                                        </button>

                                                        {isPrivilegedUser && (
                                                            <div className="d-flex gap-1 flex-nowrap">
                                                                <Link to={`/books/update/${bookId}`} className="btn btn-warning btn-sm" onClick={e => e.stopPropagation()}>✎</Link>
                                                                <Link to={`/books/delete/${bookId}`} className="btn btn-danger btn-sm" onClick={e => e.stopPropagation()}>🗑</Link>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredBooks.length === 0 && <div className="col-12 text-center text-white py-5">No books found.</div>}
                            </div>
                        ) : (
                            <div className="card border-0 shadow glass-panel" style={{ borderRadius: "16px" }}>
                                <div className="card-body p-4">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead>
                                                <tr className="small fw-bold">
                                                    <th>ID</th>
                                                    <th>TITLE</th>
                                                    <th>AUTHOR</th>
                                                    <th>TYPE</th>
                                                    <th>COPIES</th>
                                                    <th>STATUS</th>
                                                    <th>ACTIONS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedBooks.map(book => {
                                                    const bookId = book.id || book.Id;
                                                    const title = book.title || book.Title;
                                                    const author = book.author || book.Author;
                                                    const copies = book.copies ?? book.copiesAvailable ?? book.Copies ?? book.CopiesAvailable ?? 0;
                                                    const copyCount = Number(copies);
                                                    const isBookAvailable = copyCount > 0;
                                                    const bookType = book.type || book.Type || "Physical Book";

                                                    return (
                                                        <tr key={bookId}>
                                                            <td className="fw-semibold">{bookId}</td>
                                                            <td className="fw-bold text-dark">{title}</td>
                                                            <td>{author}</td>
                                                            <td><span className="badge bg-light text-dark border">{bookType}</span></td>
                                                            <td>{copyCount}</td>
                                                            <td>
                                                                <span className={`badge ${isBookAvailable ? "bg-success" : "bg-secondary"}`}>
                                                                    {isBookAvailable ? "Available" : "Out of Stock"}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-1">
                                                                    <Link
                                                                        to={`/books/details/${bookId}`}
                                                                        className="btn btn-outline-primary btn-sm px-3 bg-white"
                                                                        style={{ borderRadius: "8px" }}
                                                                    > Details
                                                                    </Link>

                                                                    <button
                                                                        onClick={() => handleBorrow(bookId)}
                                                                        disabled={borrowingId === bookId || !isBookAvailable}
                                                                        className="btn btn-primary btn-sm"
                                                                    >
                                                                        Borrow
                                                                    </button>
                                                                    {isPrivilegedUser && (
                                                                        <>
                                                                            <Link to={`/books/update/${bookId}`} className="btn btn-warning btn-sm">Update</Link>
                                                                            <Link to={`/books/delete/${bookId}`} className="btn btn-danger btn-sm">Delete</Link>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {filteredBooks.length === 0 && (
                                                    <tr><td colSpan="7" className="text-center text-muted py-4">No records match filters</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

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

            {showDetailsModal && selectedBook && (
                <DetailsBook
                    bookId={selectedBook.id || selectedBook.Id}
                    bookData={selectedBook}
                    show={showDetailsModal}
                    onClose={handleCloseDetails}
                    onBorrow={(bookToBorrow) => {
                        handleCloseDetails();
                        handleBorrow(bookToBorrow.id || bookToBorrow.Id);
                    }}
                />
            )}
        </div>
    );
}

export default Books;