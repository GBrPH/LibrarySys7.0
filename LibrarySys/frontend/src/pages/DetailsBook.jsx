import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

function DetailsBook() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [borrowMessage, setBorrowMessage] = useState("");
    const [borrowing, setBorrowing] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token")?.trim();
        setLoading(true);

        axios.get(`${process.env.REACT_APP_API_URL}/api/Book/GetBookById/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
            .then(res => {
                setBook(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching book details:", err);
                setError("Could not load book details. Please try again.");
                setLoading(false);
            });
    }, [id]);

    const handleBorrow = async () => {
        setBorrowing(true);
        setBorrowMessage("");

        const token = localStorage.getItem("token")?.trim();
        const storedUsername = localStorage.getItem("username")?.trim();

        if (!token || !storedUsername) {
            setBorrowMessage("Session missing. Please log in again.");
            setBorrowing(false);
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/Borrow/BorrowBook`,
                { bookId: Number(id), username: storedUsername },
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );

            setBorrowMessage(response.data.message || "Book borrowed successfully!");
            // Refresh copies
            if (book) {
                const currentCopies = Number(book.copies ?? book.copiesAvailable ?? 1);
                setBook({ ...book, copies: Math.max(0, currentCopies - 1) });
            }
        } catch (err) {
            setBorrowMessage(err.response?.data?.message || "Failed to borrow book.");
        } finally {
            setBorrowing(false);
        }
    };

    if (loading) {
        return (
            <div className="container-fluid p-0 bg-light min-vh-100">
                <Navbar activePage="books" />
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="container-fluid p-0 bg-light min-vh-100">
                <Navbar activePage="books" />
                <div className="container py-5 text-center">
                    <div className="alert alert-danger">{error || "Book not found."}</div>
                    <button className="btn btn-secondary mt-3" onClick={() => navigate("/books")}>
                        Back to Books
                    </button>
                </div>
            </div>
        );
    }

    const copyCount = Number(book.copies ?? book.copiesAvailable ?? 0);
    const isAvailable = copyCount > 0;

    return (
        <div className="container-fluid p-0 bg-light min-vh-100">
            <Navbar activePage="books" />

            <div className="container py-5">
                {/* Back button */}
                <button
                    className="btn btn-outline-secondary mb-4 px-3"
                    onClick={() => navigate("/books")}
                    style={{ borderRadius: "8px" }}
                >
                    &larr; Back to Catalog
                </button>

                {borrowMessage && (
                    <div className={`alert ${borrowMessage.includes("successfully") ? "alert-success" : "alert-danger"} alert-dismissible fade show mb-4`} role="alert">
                        {borrowMessage}
                        <button type="button" className="btn-close" onClick={() => setBorrowMessage("")}></button>
                    </div>
                )}

                <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: "20px" }}>
                    <div className="row g-5 align-items-start">
                        {/* Left: Book Cover / Placeholder */}
                        <div className="col-12 col-md-5 d-flex justify-content-center">
                            <div
                                className="d-flex flex-column align-items-center justify-content-center shadow-sm rounded-3 text-secondary p-3 w-100"
                                style={{
                                    maxWidth: "320px",
                                    aspectRatio: "2/3",
                                    background: "linear-gradient(145deg, #f8f9fa, #e9ecef)",
                                    border: "1px solid #dee2e6"
                                }}
                            >
                                {book.coverImageUrl ? (
                                    <img
                                        src={book.coverImageUrl}
                                        alt={book.title}
                                        className="img-fluid rounded h-100 w-100"
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : (
                                    <>
                                        <svg
                                            width="72"
                                            height="72"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="mb-3 text-muted"
                                        >
                                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                                            <path d="M6 6h10" />
                                            <path d="M6 10h10" />
                                        </svg>
                                        <span className="small fw-semibold text-muted">No Image Available</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right: Book Details */}
                        <div className="col-12 col-md-7">
                            <h2 className="fw-bold text-dark mb-3">{book.title}</h2>

                            {/* Author Badge */}
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <div
                                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                                    style={{ width: "40px", height: "40px", fontSize: "0.95rem" }}
                                >
                                    {book.author ? book.author.charAt(0).toUpperCase() : "A"}
                                </div>
                                <div>
                                    <span className="text-muted small d-block">Author</span>
                                    <span className="fw-semibold text-dark">{book.author || "Unknown"}</span>
                                </div>
                            </div>

                            {/* Synopsis */}
                            <h6 className="fw-bold text-dark mb-2">About this book</h6>
                            <p className="text-secondary mb-4" style={{ lineHeight: "1.7", whiteSpace: "pre-line" }}>
                                {book.synopsis || book.description || "No synopsis available for this book."}
                            </p>

                            <hr className="my-4 text-muted" />

                            {/* Metadata Specs Table */}
                            <div className="row g-3 mb-4">
                                <div className="col-6 col-sm-4">
                                    <span className="text-muted small fw-bold text-uppercase d-block">Format</span>
                                    <span className="fw-semibold text-dark">{book.type || "Physical Book"}</span>
                                </div>
                                <div className="col-6 col-sm-4">
                                    <span className="text-muted small fw-bold text-uppercase d-block">First Publish</span>
                                    <span className="fw-semibold text-dark">
                                        {book.publicationDate
                                            ? new Date(book.publicationDate).toLocaleDateString()
                                            : book.publishedYear || "N/A"}
                                    </span>
                                </div>
                                <div className="col-6 col-sm-4">
                                    <span className="text-muted small fw-bold text-uppercase d-block">ISBN</span>
                                    <span className="fw-semibold text-dark">{book.isbn || "N/A"}</span>
                                </div>
                                <div className="col-6 col-sm-4">
                                    <span className="text-muted small fw-bold text-uppercase d-block">Copies Left</span>
                                    <span className={`badge mt-1 ${isAvailable ? "bg-success" : "bg-danger"}`}>
                                        {copyCount} available
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex gap-3 pt-2">
                                <button
                                    className="btn btn-primary fw-semibold px-4 py-2"
                                    disabled={borrowing || !isAvailable}
                                    onClick={handleBorrow}
                                    style={{ borderRadius: "8px" }}
                                >
                                    {borrowing ? "Processing..." : isAvailable ? "Borrow" : "Out of Stock"}
                                </button>
                                <button
                                    className="btn btn-outline-secondary px-4 py-2"
                                    onClick={() => navigate("/books")}
                                    style={{ borderRadius: "8px" }}
                                >
                                    Back to Books
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailsBook;