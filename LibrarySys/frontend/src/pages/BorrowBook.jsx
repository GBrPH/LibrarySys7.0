import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

function BorrowBook() {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);

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
            // Filter only available books immediately
            const availableOnly = (res.data || []).filter(b => Number(b.copies ?? b.copiesAvailable ?? 0) > 0);
            setBooks(availableOnly);
        } catch (err) {
            console.error("Error fetching books:", err);
        }
    };

    const handleBorrowSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBook) {
            setMessage("Please select a book from the list.");
            setIsError(true);
            return;
        }

        setLoading(true);
        setMessage("");
        setIsError(false);

        const token = localStorage.getItem("token")?.trim(); // Added trim() to prevent hidden spaces
        if (!token) {
            setMessage("Session expired. Please log in again.");
            setIsError(true);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/Borrow/BorrowBook`,
                { bookId: selectedBook.id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            setMessage(response.data.message || "Book successfully checked out!");
            setIsError(false);
            setSelectedBook(null);
            fetchBooks();
        } catch (err) {
            console.error("Borrow error:", err);

            // Show the EXACT error from the C# backend
            let errorMsg = "Failed to process the loan.";

            if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (typeof err.response?.data === "string" && err.response.data !== "") {
                errorMsg = err.response.data;
            } else if (err.response?.status === 401) {
                errorMsg = "Unauthorized 401: Token is missing, expired, or invalid.";
            } else if (err.response?.status === 403) {
                errorMsg = "Forbidden 403: You do not have permission to borrow books.";
            }

            setMessage(errorMsg);
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
                                    <select
                                        className="form-select form-select-lg shadow-none"
                                        value={selectedBook ? selectedBook.id : ""}
                                        onChange={(e) => {
                                            const selectedId = parseInt(e.target.value);
                                            const book = books.find(b => b.id === selectedId);
                                            setSelectedBook(book || null);
                                        }}
                                        required
                                    >
                                        <option value="" disabled>-- Click to choose a book --</option>
                                        {books.map((book) => {
                                            const copyCount = Number(book.copies ?? book.copiesAvailable ?? 0);
                                            return (
                                                <option key={book.id} value={book.id}>
                                                    {book.title} (by {book.author}) - {copyCount} left
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                {/* Read-only fields to mimic a detailed form */}
                                <div className="row mb-4">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label className="form-label fw-semibold text-secondary small">AUTHOR</label>
                                        <input
                                            type="text"
                                            className="form-control bg-light"
                                            value={selectedBook ? selectedBook.author : ""}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold text-secondary small">STOCK REMAINING</label>
                                        <input
                                            type="text"
                                            className="form-control bg-light fw-bold text-primary"
                                            value={selectedBook ? Number(selectedBook.copies ?? selectedBook.copiesAvailable ?? 0) : ""}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                </div>

                                <hr className="text-muted mb-4" />

                                <div className="d-grid gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg fw-bold shadow-sm"
                                        disabled={loading || !selectedBook}
                                    >
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