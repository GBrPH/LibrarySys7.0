import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Books() {
    const [books, setBooks] = useState([]);
    const [filters, setFilters] = useState({ status: "All" });

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/Book/GetAllBooks`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(res => setBooks(res.data || []))
            .catch(err => console.error("Error fetching books:", err));
    }, []);

    const filteredBooks = books.filter(book => {
        if (filters.status === "Available" && !book.isAvailable) return false;
        if (filters.status === "Borrowed" && book.isAvailable) return false;
        return true;
    });

    return (
        <div className="container-fluid">
            {/* Top Navbar (same as Dashboard) */}
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
                {/* Sidebar filter */}
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
                            <option>Available</option>
                            <option>Borrowed</option>
                        </select>
                    </div>
                </div>

                {/* Main content */}
                <div className="col-md-9 col-lg-10 p-4">
                    <h2 className="mb-4">Books</h2>

                    {/* Manage Books section */}
                    <div className="mb-4">
                        <h5>Manage Books</h5>
                        <div className="d-flex gap-2">
                            <button className="btn btn-primary">Add Book</button>
                            <button className="btn btn-warning">Update Book</button>
                            <button className="btn btn-danger">Delete Book</button>
                        </div>
                    </div>

                    {/* All Books table */}
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5>All Books</h5>
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th><th>Title</th><th>Author</th><th>Copies</th><th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBooks.map(book => (
                                        <tr key={book.id}>
                                            <td>{book.id}</td>
                                            <td>{book.title}</td>
                                            <td>{book.author}</td>
                                            <td>{book.copiesAvailable}</td>
                                            <td>
                                                <span className={`badge ${book.isAvailable ? "bg-success" : "bg-secondary"}`}>
                                                    {book.isAvailable ? "Available" : "Borrowed"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredBooks.length === 0 && (
                                        <tr><td colSpan="5" className="text-center text-muted">No records match filters</td></tr>
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
