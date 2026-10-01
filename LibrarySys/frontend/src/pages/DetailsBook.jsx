import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function DetailsBook({ book, show, onClose, onBorrow }) {
    if (!show || !book) return null;

    const copyCount = Number(book.copies ?? book.copiesAvailable ?? 0);
    const isAvailable = copyCount > 0;

    return (
        <>
            {/* Backdrop */}
            <div
                className="modal-backdrop fade show"
                style={{ zIndex: 1050, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                role="dialog"
                aria-modal="true"
                style={{ zIndex: 1055 }}
            >
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>

                        {/* Header with Close Button */}
                        <div className="modal-header border-0 pb-0 justify-content-end">
                            <button
                                type="button"
                                className="btn-close shadow-none"
                                aria-label="Close"
                                onClick={onClose}
                            ></button>
                        </div>

                        <div className="modal-body px-4 px-md-5 pb-5 pt-2">
                            <div className="row g-4 align-items-start">

                                {/* Left: Book Cover / Placeholder */}
                                <div className="col-12 col-md-5 d-flex justify-content-center">
                                    <div
                                        className="d-flex flex-column align-items-center justify-content-center shadow rounded-3 text-secondary p-3 w-100"
                                        style={{
                                            maxWidth: "280px",
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
                                                    width="64"
                                                    height="64"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="mb-2 text-muted"
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

                                {/* Right: Book Information */}
                                <div className="col-12 col-md-7">
                                    <h3 className="fw-bold text-dark mb-3 lh-sm">{book.title}</h3>

                                    {/* Author Pill */}
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <div
                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                                            style={{ width: "36px", height: "36px", fontSize: "0.85rem" }}
                                        >
                                            {book.author ? book.author.charAt(0).toUpperCase() : "A"}
                                        </div>
                                        <div>
                                            <span className="text-muted small d-block">Author</span>
                                            <span className="fw-semibold text-dark">{book.author || "Unknown"}</span>
                                        </div>
                                    </div>

                                    {/* Synopsis */}
                                    <p className="text-secondary small mb-4" style={{ lineHeight: "1.6", whiteSpace: "pre-line" }}>
                                        {book.synopsis || book.description || "No synopsis available for this book."}
                                    </p>

                                    {/* Metadata Spec Table */}
                                    <div className="small mb-4">
                                        <div className="row py-1">
                                            <div className="col-5 text-uppercase fw-bold text-muted">Format</div>
                                            <div className="col-7 text-dark fw-semibold">{book.type || "Physical Book"}</div>
                                        </div>
                                        <div className="row py-1">
                                            <div className="col-5 text-uppercase fw-bold text-muted">First Publish</div>
                                            <div className="col-7 text-dark fw-semibold">
                                                {book.publicationDate
                                                    ? new Date(book.publicationDate).toLocaleDateString()
                                                    : book.publishedYear || "N/A"}
                                            </div>
                                        </div>
                                        <div className="row py-1">
                                            <div className="col-5 text-uppercase fw-bold text-muted">ISBN</div>
                                            <div className="col-7 text-dark fw-semibold">{book.isbn || "N/A"}</div>
                                        </div>
                                        <div className="row py-1">
                                            <div className="col-5 text-uppercase fw-bold text-muted">Copies Left</div>
                                            <div className="col-7">
                                                <span className={`badge ${isAvailable ? "bg-success" : "bg-danger"}`}>
                                                    {copyCount} available
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-flex gap-2">
                                        {onBorrow && (
                                            <button
                                                className="btn btn-primary fw-semibold px-4 py-2"
                                                disabled={!isAvailable}
                                                onClick={() => onBorrow(book.id)}
                                            >
                                                {isAvailable ? "Borrow Book" : "Out of Stock"}
                                            </button>
                                        )}
                                        <button className="btn btn-outline-secondary px-4 py-2" onClick={onClose}>
                                            Close
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}

export default DetailsBook;