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
    const [isFetching, setIsFetching] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        setIsFetching(true);
        const token = localStorage.getItem("token")?.trim();
        if (!token) {
            setIsFetching(false);
            return;
        }

        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/Book/GetAllBooks`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("RAW API RESPONSE:", res.data);

            // Extract the array, whatever shape it takes
            const rawData = Array.isArray(res.data) ? res.data : (res.data?.$values || res.data?.books || res.data?.data || []);

            console.log("EXTRACTED ARRAY:", rawData);

            // BYPASS ALL FILTERS FOR NOW to prove data loads
            setBooks(rawData);

        } catch (err) {
            console.error("Error fetching books:", err);
        } finally {
            setIsFetching(false);
        }
    };

    // --- FIX: Safely extract strings before calling toLowerCase() ---
    const filteredDropdownBooks = books.filter(b => {
        const title = String(b.title || b.Title || "").toLowerCase();
        const author = String(b.author || b.Author || "").toLowerCase();
        const search = searchTerm.toLowerCase();
        return title.includes(search) || author.includes(search);
    });

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
            // FIX: Safely grab ID regardless of casing
            const bookId = selectedBook.id || selectedBook.Id;

            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/Borrow/BorrowBook`,
                {
                    bookId: bookId,
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
        <div className="p-0 min-vh-100">
            <Navbar activePage="borrow" />

            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="card shadow-sm border-0 p-5 glass-panel" style={{ borderRadius: "16px" }}>
                            <div className="text-center mb-4">
                                <h3 className="fw-bold text-dark">Borrowing Form</h3>
                                <p className="opacity-75 small text-dark">Select an available book to check out</p>
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
                                        className="form-control mb-2 shadow-none bg-white text-dark border-0"
                                        placeholder="Search by title or author..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />

                                    <select
                                        className="form-select form-select-lg shadow-none bg-white text-dark border-0"
                                        size="5"
                                        value={selectedBook ? (selectedBook.id || selectedBook.Id) : ""}
                                        onChange={(e) => {
                                            const selectedId = parseInt(e.target.value);
                                            const book = books.find(b => (b.id || b.Id) === selectedId);
                                            setSelectedBook(book || null);
                                        }}
                                        required
                                    >
                                        <option value="" disabled>-- Click to choose a book --</option>
                                        {/* FIX: Safely extract Title, Author, and Copies */}
                                        {filteredDropdownBooks.map((book) => {
                                            const bId = book.id || book.Id;
                                            const bTitle = book.title || book.Title;
                                            const bAuthor = book.author || book.Author;
                                            const bCopies = book.copies ?? book.copiesAvailable ?? book.Copies ?? book.CopiesAvailable;

                                            return (
                                                <option key={bId} value={bId} className="py-2 px-2 border-bottom">
                                                    {bTitle} (by {bAuthor}) - {bCopies} left
                                                </option>
                                            );
                                        })}
                                        {filteredDropdownBooks.length === 0 && (
                                            <option disabled>No matching books found</option>
                                        )}
                                    </select>
                                </div>

                                <div className="row mb-4">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label className="form-label fw-semibold text-dark small opacity-75">AUTHOR</label>
                                        {/* FIX: Safely extract Author */}
                                        <input type="text" className="form-control bg-white text-dark border-0" value={selectedBook ? (selectedBook.author || selectedBook.Author) : ""} disabled />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold text-dark small opacity-75">STOCK REMAINING</label>
                                        {/* FIX: Safely extract Copies */}
                                        <input type="text" className="form-control bg-white fw-bold text-primary border-0" value={selectedBook ? (selectedBook.copies ?? selectedBook.copiesAvailable ?? selectedBook.Copies ?? selectedBook.CopiesAvailable) : ""} disabled />
                                    </div>
                                </div>

                                <hr className="mb-4" style={{ borderColor: "rgba(30, 41, 59, 0.15)" }} />

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