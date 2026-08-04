import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

function BorrowBook() {
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBook, setSelectedBook] = useState(null);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        const token = localStorage.getItem("token")?.trim();
        if (!token) return;

        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/Book/GetAllBooks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const availableOnly = (res.data || []).filter(b => Number(b.copies ?? b.copiesAvailable ?? 0) > 0);
            setBooks(availableOnly);
        } catch (err) {
            console.error("Error fetching books:", err);
        }
    };

    const filteredDropdownBooks = books.filter(b =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBorrowSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBook) return;

        setLoading(true);
        setMessage("");
        setIsError(false);

        const token = localStorage.getItem("token")?.trim();
        const username = localStorage.getItem("username")?.trim();

        if (!token || !username) {
            setMessage("Session missing username or token. Please log in again.");
            setIsError(true);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/Borrow/BorrowBook`,
                {
                    bookId: selectedBook.id,
                    username: username
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage(response.data.message || "Book successfully checked out and logged!");
            setIsError(false);
            setSelectedBook(null);
            setSearchTerm("");
            fetchBooks();

        } catch (err) {
            console.error("Borrow error:", err);

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/login");
                return;
            }

            setMessage(err.response?.data?.message || "Failed to process the loan.");
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid p-0 bg-light min-vh-100">
            <Navbar activePage="borrow" />

            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="card shadow-sm border-0 p-5" style={{ borderRadius: "16px" }}>
                            <div className="text-center mb-4">
                                <h3 className="fw-bold" style={{ color: "#2575fc" }}>Borrowing Form</h3>
                                <p className="text-muted small">Select an available book to check out</p>
                            </div>

                            {message && (
                                <div className={`alert ${isError ? "alert-danger" : "alert-success"} alert-dismissible fade show`} role="alert">
                                    {message}
                                    <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
                                </div>
                            )}

                            <form onSubmit={handleBorrowSubmit}>
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark">Select Book <span className="text-danger">*</span></label>

                                    <input
                                        type="text"
                                        className="form-control mb-2 shadow-none"
                                        placeholder="Search by title or author..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />

                                    <select
                                        className="form-select form-select-lg shadow-none"
                                        size="5"
                                        value={selectedBook ? selectedBook.id : ""}
                                        onChange={(e) => {
                                            const book = books.find(b => b.id === parseInt(e.target.value));
                                            setSelectedBook(book || null);
                                        }}
                                        required
                                    >
                                        <option value="" disabled>-- Click to choose a book --</option>
                                        {filteredDropdownBooks.map((book) => (
                                            <option key={book.id} value={book.id} className="py-2 px-2 border-bottom">
                                                {book.title} (by {book.author}) - {book.copies ?? book.copiesAvailable} left
                                            </option>
                                        ))}
                                        {filteredDropdownBooks.length === 0 && (
                                            <option disabled>No matching books found</option>
                                        )}
                                    </select>
                                </div>

                                <div className="row mb-4">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label className="form-label fw-semibold text-secondary small">AUTHOR</label>
                                        <input type="text" className="form-control bg-light" value={selectedBook ? selectedBook.author : ""} disabled />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold text-secondary small">STOCK REMAINING</label>
                                        <input type="text" className="form-control bg-light fw-bold text-primary" value={selectedBook ? (selectedBook.copies ?? selectedBook.copiesAvailable) : ""} disabled />
                                    </div>
                                </div>

                                <hr className="text-muted mb-4" />

                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary btn-lg fw-bold shadow-sm" disabled={loading || !selectedBook}>
                                        {loading ? "Processing..." : "Submit Borrow Request"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BorrowBook;