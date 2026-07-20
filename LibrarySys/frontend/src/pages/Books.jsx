import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Books() {
    const [books, setBooks] = useState([]);
    const [filters, setFilters] = useState({
        status: "All",
        author: "",
        borrower: "",
        copies: "All",
        search: ""
    });

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/Book/GetAllBooks`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(res => setBooks(res.data || []))
            .catch(err => console.error("Error fetching books:", err));
    }, []);

    const filteredBooks = books.filter(book => {
        // Status filter
        if (filters.status === "Available" && !book.isAvailable) return false;
        if (filters.status === "Borrowed" && book.isAvailable) return false;

        // Author filter
        if (filters.author && !book.author.toLowerCase().includes(filters.author.toLowerCase())) return false;

        // Borrower filter
        if (filters.borrower && (!book.borrowerName || !book.borrowerName.toLowerCase().includes(filters.borrower.toLowerCase()))) return false;

        // Copies filter
        if (filters.copies === "Low Stock (≤2)" && book.copiesAvailable > 2) return false;
        if (filters.copies === "In Stock (>2)" && book.copiesAvailable <= 2) return false;

        // Search filter (title or author)
        if (filters.search && !(
            book.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            book.author.toLowerCase().includes(filters.search.toLowerCase())
        )) return false;

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
                            <li className="nav-item"><Link className="nav-link active" to="/books">Books</Link></li>
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

            <div className="row">
                {/* Sidebar */}
                <div className="col-md-3 col-lg-2 bg-light border-end vh-100 p-3">
                    <h5>Filters</h5>

                    {/* Book Status */}
                    <div className="mb-3">
                        <label className="form-label">Status</label>
                        <select
                            className="form-select"
                            value={filters.status}
                            onChange={e => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option>All</option>
                            <option>Available</option>
                            <option>Borrowed</option>
                        </select>
                    </div>

                    {/* Author */}
                    <div className="mb-3">
                        <label className="form-label">Author</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by author"
                            value={filters.author}
                            onChange={e => setFilters({ ...filters, author: e.target.value })}
                        />
                    </div>

                    {/* Borrower */}
                    <div className="mb-3">
                        <label className="form-label">Borrower</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by borrower"
                            value={filters.borrower}
                            onChange={e => setFilters({ ...filters, borrower: e.target.value })}
                        />
                    </div>

                    {/* Copies */}
                    <div className="mb-3">
                        <label className="form-label">Copies Available</label>
                        <select
                            className="form-select"
                            value={filters.copies}
                            onChange={e => setFilters({ ...filters, copies: e.target.value })}
                        >
                            <option>All</option>
                            <option>Low Stock (≤2)</option>
                            <option>In Stock (>2)</option>
                        </select>
                    </div>

                    {/* Reset Filters */}
                    <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => setFilters({ status: "All", author: "", borrower: "", copies: "All", search: "" })}
                    >
                        Reset Filters
                    </button>
                </div>

                {/* Main content */}
                <div className="col-md-9 col-lg-10 p-4">
                    {/* Top bar */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        {/* Left: Title + total count */}
                        <h5 className="mb-0">
                            Books <span className="text-muted">({filteredBooks.length} total)</span>
                        </h5>

                        {/* Center: Search bar */}
                        <div className="input-group w-50">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search books..."
                                value={filters.search}
                                onChange={e => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>

                        {/* Right: icons + add book */}
                        <div className="d-flex align-items-center">
                            <button className="btn btn-outline-secondary me-2">
                                <i className="bi bi-grid"></i>
                            </button>
                            <button className="btn btn-outline-secondary me-2">
                                <i className="bi bi-list"></i>
                            </button>
                            <Link to="/settings" className="btn btn-outline-secondary me-2">
                                <i className="bi bi-three-dots"></i>
                            </Link>
                            <Link to="/books/add" className="btn btn-success">Add Book</Link>
                        </div>
                    </div>

                    {/* Books table */}
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Title</th>
                                        <th>Author</th>
                                        <th>Borrower</th>
                                        <th>Copies</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBooks.map(book => (
                                        <tr key={book.id}>
                                            <td>{book.id}</td>
                                            <td>{book.title}</td>
                                            <td>{book.author}</td>
                                            <td>{book.borrowerName || "-"}</td>
                                            <td>{book.copiesAvailable}</td>
                                            <td>
                                                <span className={`badge ${book.isAvailable ? "bg-success" : "bg-secondary"}`}>
                                                    {book.isAvailable ? "Available" : "Borrowed"}
                                                </span>
                                            </td>
                                            <td>
                                                <Link to={`/books/update/${book.id}`} className="btn btn-warning btn-sm me-2">Update</Link>
                                                <Link to={`/books/delete/${book.id}`} className="btn btn-danger btn-sm">Delete</Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredBooks.length === 0 && (
                                        <tr><td colSpan="7" className="text-center text-muted">No records match filters</td></tr>
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

export default Books;
