import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

function Books() {
    const [books, setBooks] = useState([]);
    const [borrowMessage, setBorrowMessage] = useState("");
    const [borrowingId, setBorrowingId] = useState(null);
    const [viewMode, setViewMode] = useState("grid");
    const [filters, setFilters] = useState({
        status: "All",
        author: "",
        copies: "All",
        search: "",
        az: "None",
        type: "All"
    });

    const roleString = localStorage.getItem("role")?.toUpperCase() || "";
    const usernameString = localStorage.getItem("username")?.toUpperCase() || "";
    const isPrivilegedUser = roleString.includes("LIBRARIAN") || roleString.includes("ADMIN") || usernameString === "HMIR";

    const fetchBooks = () => {
        const token = localStorage.getItem("token")?.trim();
        if (!token) return;

        axios.get(`${process.env.REACT_APP_API_URL}/api/Book/GetAllBooks`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setBooks(res.data || []))
            .catch(err => console.error("Error fetching books:", err));
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleBorrow = async (bookId) => {
        setBorrowingId(bookId);
        setBorrowMessage("");

        const token = localStorage.getItem("token")?.trim();
        const storedUsername = localStorage.getItem("username")?.trim();

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
        const copyCount = Number(book.copies ?? book.copiesAvailable ?? 0);
        const isAvailable = copyCount > 0;

        const bookType = book.type || "Physical Book";

        if (filters.status === "Available" && !isAvailable) return false;
        if (filters.status === "Borrowed" && isAvailable) return false;

        if (filters.type !== "All" && bookType !== filters.type) return false;

        if (filters.author && !book.author.toLowerCase().includes(filters.author.toLowerCase())) return false;
        if (filters.copies === "Low Stock (1–9)" && (copyCount < 1 || copyCount > 9)) return false;
        if (filters.copies === "High Stock (≥10)" && copyCount < 10) return false;
        if (filters.copies === "Out of Stock (0)" && copyCount !== 0) return false;

        if (filters.search && !(
            book.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            book.author.toLowerCase().includes(filters.search.toLowerCase())
        )) return false;

        return true;
    });

    if (filters.az === "Title (A–Z)") filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
    if (filters.az === "Title (Z–A)") filteredBooks.sort((a, b) => b.title.localeCompare(a.title));
    if (filters.az === "Author (A–Z)") filteredBooks.sort((a, b) => a.author.localeCompare(b.author));
    if (filters.az === "Author (Z–A)") filteredBooks.sort((a, b) => b.author.localeCompare(a.author));

    return (
        <div className="container-fluid p-0 bg-light min-vh-100">
            <Navbar activePage="books" />

            <div className="row g-0">
                <div className="col-md-3 col-lg-2 bg-white border-end vh-100 p-3 shadow-sm">
                    <h5 className="fw-bold mb-3">Book Filters</h5>

                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">STATUS</label>
                        <select className="form-select shadow-none" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                            <option>All</option>
                            <option>Available</option>
                            <option>Borrowed</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">TYPE</label>
                        <select className="form-select shadow-none" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
                            <option>All</option>
                            <option>Physical Book</option>
                            <option>eBook</option>
                            <option>Journal</option>
                        </select>
                    </div>



                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">AUTHOR</label>
                        <input type="text" className="form-control shadow-none" placeholder="Filter by Author" value={filters.author} onChange={e => setFilters({ ...filters, author: e.target.value })} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">SORT ORDER</label>
                        <select className="form-select shadow-none" value={filters.az} onChange={e => setFilters({ ...filters, az: e.target.value })}>
                            <option>None</option>
                            <option>Title (A–Z)</option>
                            <option>Title (Z–A)</option>
                            <option>Author (A–Z)</option>
                            <option>Author (Z–A)</option>
                        </select>
                    </div>

                    <button className="btn btn-outline-secondary w-100 mt-2" onClick={() => setFilters({ status: "All", author: "", copies: "All", search: "", az: "None", type: "All" })}>
                        Reset Filters
                    </button>
                </div>

                <div className="col-md-9 col-lg-10 p-4">
                    <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                        <div className="d-flex align-items-center flex-grow-1 gap-3">
                            <h5 className="fw-bold mb-0 text-nowrap">
                                Books <span className="text-muted fw-normal">({filteredBooks.length} total)</span>
                            </h5>
                            <input type="text" className="form-control shadow-none" style={{ maxWidth: "400px" }} placeholder="Search title or author..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            {isPrivilegedUser && <Link to="/add-book" className="btn btn-success fw-semibold text-nowrap ms-2"> Add Book </Link>}

                            <div className="btn-group" role="group">
                                <button className={`btn ${viewMode === "grid" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setViewMode("grid")} title="Grid View">
                                    <span>&#9632;</span>
                                </button>
                                <button className={`btn ${viewMode === "list" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setViewMode("list")} title="List View">
                                    <span>&#9776;</span>
                                </button>
                            </div>

                            {/* Restored Settings Icon */}
                            <Link to="/Settings" className="btn btn-outline-secondary" title="Settings">
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
                            {filteredBooks.map(book => {
                                const copyCount = Number(book.copies ?? book.copiesAvailable ?? 0);
                                const isBookAvailable = copyCount > 0;
                                const bookType = book.type || "Physical Book";

                                return (
                                    <div className="col-12 col-md-6 col-xl-4" key={book.id}>
                                        <div className="card h-100 border-0 shadow-sm p-3" style={{ borderRadius: "16px" }}>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <span className={`badge ${bookType === "eBook" ? "bg-info" : bookType === "Journal" ? "bg-danger" : "bg-primary"}`}>
                                                    {bookType}
                                                </span>
                                                <span className={`badge ${isBookAvailable ? "bg-success" : "bg-secondary"}`}>
                                                    {isBookAvailable ? "Available" : "Borrowed"}
                                                </span>
                                            </div>

                                            <h5 className="fw-bold text-dark mt-2 mb-1 text-truncate" title={book.title}>{book.title}</h5>
                                            <p className="text-muted small mb-3">by {book.author}</p>

                                            <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                                                <span className="fw-semibold text-secondary small">
                                                    {copyCount} {copyCount === 1 ? "copy" : "copies"} left
                                                </span>
                                                <div className="d-flex gap-1">
                                                    <button onClick={() => handleBorrow(book.id)} disabled={borrowingId === book.id || !isBookAvailable} className="btn btn-primary btn-sm">
                                                        {borrowingId === book.id ? "..." : "Borrow"}
                                                    </button>

                                                    {isPrivilegedUser && (
                                                        <>
                                                            <Link to={`/books/update/${book.id}`} className="btn btn-warning btn-sm">✎</Link>
                                                            <Link to={`/books/delete/${book.id}`} className="btn btn-danger btn-sm">🗑</Link>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredBooks.length === 0 && <div className="col-12 text-center text-muted py-5">No books found.</div>}
                        </div>
                    ) : (
                        <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
                            <div className="card-body p-4">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead>
                                            <tr className="text-muted small">
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
                                            {filteredBooks.map(book => {
                                                const copyCount = Number(book.copies ?? book.copiesAvailable ?? 0);
                                                const isBookAvailable = copyCount > 0;
                                                const bookType = book.type || "Physical Book";

                                                return (
                                                    <tr key={book.id}>
                                                        <td className="fw-semibold">{book.id}</td>
                                                        <td className="fw-bold text-dark">{book.title}</td>
                                                        <td>{book.author}</td>
                                                        <td><span className="badge bg-light text-dark border">{bookType}</span></td>
                                                        <td>{copyCount}</td>
                                                        <td>
                                                            <span className={`badge ${isBookAvailable ? "bg-success" : "bg-secondary"}`}>
                                                                {isBookAvailable ? "Available" : "Out of Stock"}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center gap-1">
                                                                <button onClick={() => handleBorrow(book.id)} disabled={borrowingId === book.id || !isBookAvailable} className="btn btn-primary btn-sm">
                                                                    Borrow
                                                                </button>
                                                                {isPrivilegedUser && (
                                                                    <>
                                                                        <Link to={`/books/update/${book.id}`} className="btn btn-warning btn-sm">Update</Link>
                                                                        <Link to={`/books/delete/${book.id}`} className="btn btn-danger btn-sm">Delete</Link>
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
                </div>
            </div>
        </div>
    );
}

export default Books;