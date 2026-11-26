import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

function DeleteBook() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [activeBorrowers, setActiveBorrowers] = useState([]);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    const getToken = () => (localStorage.getItem("token") || sessionStorage.getItem("token"))?.trim();

    useEffect(() => {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };

        Promise.all([
            axios.get(`${process.env.REACT_APP_API_URL}/api/Book/GetBookById/${id}`, { headers }),
            axios.get(`${process.env.REACT_APP_API_URL}/api/BorrowingLog/ActiveBorrowers/${id}`, { headers })
                .catch(() => ({ data: [] }))
        ])
            .then(([bookRes, borrowersRes]) => {
                setBook(bookRes.data);
                const rawBorrowers = Array.isArray(borrowersRes.data)
                    ? borrowersRes.data
                    : (borrowersRes.data?.$values || []);
                setActiveBorrowers(rawBorrowers);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching book:", err);
                setLoading(false);
            });
    }, [id]);

    const hasActiveBorrowers = activeBorrowers.length > 0;

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const handleDelete = async () => {
        setDeleting(true);
        setMessage("");
        setIsError(false);

        const token = getToken();
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/Book/DeleteBook/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Book deleted successfully!");
            setTimeout(() => navigate("/books"), 1000);
        } catch (err) {
            console.error("Error deleting book:", err);
            setIsError(true);
            const serverMsg = err.response?.data?.message || err.response?.data || "Failed to delete book.";
            setMessage(typeof serverMsg === "string" ? serverMsg : "Failed to delete book.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="container-fluid p-0 bg-light min-vh-100">
            <Navbar activePage="books" />

            <div className="row g-0">
                <div className="col-md-3 col-lg-2 bg-white border-end p-3 shadow-sm" style={{ minHeight: "calc(100vh - 56px)" }}>
                    <Link to="/books" className="btn btn-outline-secondary w-100 fw-semibold">&larr; Back to Books</Link>
                </div>

                <div className="col-md-9 col-lg-10 p-4">
                    <h3 className="fw-bold mb-4 text-danger">Delete Book</h3>

                    <div className="card border-0 shadow-sm p-4 rounded-4" style={{ maxWidth: "650px" }}>
                        {loading ? (
                            <p className="text-muted mb-0">Loading book details...</p>
                        ) : book ? (
                            <>
                                {hasActiveBorrowers && (
                                    <div className="alert alert-warning mb-3" role="alert">
                                        <strong>Cannot delete:</strong> {activeBorrowers.length} active{" "}
                                        {activeBorrowers.length === 1 ? "borrower currently holds" : "borrowers currently hold"} a copy of this book. All copies must be returned first.
                                    </div>
                                )}

                                <p className="fs-5">
                                    Are you sure you want to delete <strong>{book.title || book.Title}</strong> by {book.author || book.Author}?
                                </p>

                                {hasActiveBorrowers && (
                                    <div className="table-responsive my-3">
                                        <table className="table table-sm table-bordered align-middle mb-0">
                                            <thead className="table-light">
                                                <tr className="small">
                                                    <th>Borrower</th>
                                                    <th>Borrowed</th>
                                                    <th>Due Date</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeBorrowers.map(b => (
                                                    <tr key={b.borrowingLogId || b.BorrowingLogId}>
                                                        <td className="fw-semibold">{b.username || b.Username}</td>
                                                        <td>{formatDate(b.borrowDate || b.BorrowDate)}</td>
                                                        <td>{formatDate(b.dueDate || b.DueDate)}</td>
                                                        <td>
                                                            {(b.isOverdue || b.IsOverdue) ? (
                                                                <span className="badge bg-danger">Overdue</span>
                                                            ) : (
                                                                <span className="badge bg-primary">Active</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <div className="d-flex gap-2 mt-3">
                                    <button
                                        onClick={handleDelete}
                                        disabled={hasActiveBorrowers || deleting}
                                        className="btn btn-danger fw-semibold px-4"
                                    >
                                        {deleting ? "Deleting..." : "Confirm Delete"}
                                    </button>
                                    <Link to="/books" className="btn btn-outline-secondary fw-semibold px-4">Cancel</Link>
                                </div>
                            </>
                        ) : (
                            <p className="text-danger mb-0">Book record not found.</p>
                        )}

                        {message && (
                            <div className={`alert ${isError ? "alert-danger" : "alert-success"} mt-3 mb-0`} role="alert">
                                {message}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeleteBook;