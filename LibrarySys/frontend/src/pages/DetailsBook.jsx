import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

function DetailsBook({ bookId, bookData, show = true, onClose, onBorrow }) {
    const [book, setBook] = useState(bookData || null);
    const [loading, setLoading] = useState(!bookData && !!bookId);
    const [error, setError] = useState(null);

    useEffect(() => {
        // If book data is passed directly via props, use it
        if (bookData) {
            setBook(bookData);
            setLoading(false);
            return;
        }

        // Otherwise, fetch extended details using the bookId
        if (bookId) {
            setLoading(true);
            axios
                .get(`/api/Books/${bookId}`)
                .then((response) => {
                    setBook(response.data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Failed to load book details:", err);
                    setError("Failed to load book details. Please try again.");
                    setLoading(false);
                });
        }
    }, [bookId, bookData]);

    if (!show) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="modal-backdrop fade show"
                style={{ zIndex: 1050 }}
                onClick={onClose}
            ></div>

            {/* Modal Dialog */}
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                role="dialog"
                aria-modal="true"
                style={{ zIndex: 1055 }}
            >
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">
                                {loading ? "Loading Book Details..." : book?.title || "Book Details"}
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                aria-label="Close"
                                onClick={onClose}
                            ></button>
                        </div>

                        <div className="modal-body p-4">
                            {loading && (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="alert alert-danger mb-0" role="alert">
                                    {error}
                                </div>
                            )}

                            {!loading && !error && book && (
                                <div className="row g-3">
                                    {book.coverImageUrl && (
                                        <div className="col-md-4 text-center">
                                            <img
                                                src={book.coverImageUrl}
                                                alt={book.title}
                                                className="img-fluid rounded shadow-sm"
                                                style={{ maxHeight: "250px", objectFit: "cover" }}
                                            />
                                        </div>
                                    )}

                                    <div className={book.coverImageUrl ? "col-md-8" : "col-12"}>
                                        <h4 className="fw-bold mb-1">{book.title}</h4>
                                        <p className="text-muted mb-3">
                                            By <span className="fw-semibold">{book.author || "Unknown Author"}</span>
                                        </p>

                                        <div className="row mb-3">
                                            <div className="col-sm-6">
                                                <strong>Genre / Category:</strong>{" "}
                                                <span className="text-secondary">{book.genre || book.category || "N/A"}</span>
                                            </div>
                                            <div className="col-sm-6">
                                                <strong>Publication Date:</strong>{" "}
                                                <span className="text-secondary">
                                                    {book.publicationDate
                                                        ? new Date(book.publicationDate).toLocaleDateString()
                                                        : book.publishedYear || "N/A"}
                                                </span>
                                            </div>
                                            <div className="col-sm-6 mt-2">
                                                <strong>ISBN:</strong>{" "}
                                                <span className="text-secondary">{book.isbn || "N/A"}</span>
                                            </div>
                                            <div className="col-sm-6 mt-2">
                                                <strong>Available Copies:</strong>{" "}
                                                <span
                                                    className={`badge ${(book.availableCopies ?? 1) > 0 ? "bg-success" : "bg-danger"
                                                        }`}
                                                >
                                                    {(book.availableCopies ?? 1) > 0
                                                        ? `${book.availableCopies ?? 1} Available`
                                                        : "Out of Stock"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <h6 className="fw-bold">Synopsis / Description</h6>
                                            <p className="text-secondary" style={{ whiteSpace: "pre-line" }}>
                                                {book.synopsis || book.description || "No synopsis available for this book."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer bg-light">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Close
                            </button>
                            {onBorrow && (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    disabled={loading || (book && book.availableCopies === 0)}
                                    onClick={() => onBorrow(book)}
                                >
                                    Borrow Book
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DetailsBook;