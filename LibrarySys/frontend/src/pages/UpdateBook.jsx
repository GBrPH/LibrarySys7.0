import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

function UpdateBook() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bookData, setBookData] = useState({
        title: "",
        author: "",
        copies: "",
        type: "Physical Book"
    });
    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token")?.trim();
        if (!token) return;

        axios.get(`${process.env.REACT_APP_API_URL}/api/Book/GetBookById/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (res.data) {
                    setBookData({
                        title: res.data.title || "",
                        author: res.data.author || "",
                        copies: res.data.copies ?? res.data.copiesAvailable ?? "",
                        type: res.data.type || "Physical Book"
                    });
                }
            })
            .catch(err => {
                console.error("Error fetching book details:", err);
                setMessage({ text: "Failed to load book data.", type: "danger" });
            });
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: "", type: "" });

        const token = localStorage.getItem("token")?.trim();
        if (!token) {
            setMessage({ text: "Authentication token missing.", type: "danger" });
            setLoading(false);
            return;
        }

        try {
            await axios.put(
                `${process.env.REACT_APP_API_URL}/api/Book/UpdateBook/${id}`,
                {
                    id: parseInt(id, 10),
                    title: bookData.title,
                    author: bookData.author,
                    copies: parseInt(bookData.copies, 10),
                    type: bookData.type
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage({ text: "Book updated successfully! Redirecting...", type: "success" });
            setTimeout(() => navigate("/books"), 1500);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || "Failed to update book.", type: "danger" });
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid bg-light min-vh-100 p-0">
            <Navbar activePage="books" />

            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: "16px" }}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="fw-bold text-dark mb-0">Update Book</h3>
                                <Link to="/books" className="btn btn-outline-secondary btn-sm">Back to Books</Link>
                            </div>

                            {message.text && (
                                <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                                    {message.text}
                                    <button type="button" className="btn-close" onClick={() => setMessage({ text: "", type: "" })}></button>
                                </div>
                            )}

                            <form onSubmit={handleUpdate}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">TITLE</label>
                                    <input
                                        type="text"
                                        className="form-control shadow-none"
                                        value={bookData.title}
                                        onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">AUTHOR</label>
                                    <input
                                        type="text"
                                        className="form-control shadow-none"
                                        value={bookData.author}
                                        onChange={(e) => setBookData({ ...bookData, author: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">BOOK TYPE</label>
                                    <select
                                        className="form-select shadow-none"
                                        value={bookData.type}
                                        onChange={(e) => setBookData({ ...bookData, type: e.target.value })}
                                    >
                                        <option value="Physical Book">Physical Book</option>
                                        <option value="eBook">eBook</option>
                                        <option value="Journal">Journal</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold small text-muted">COPIES</label>
                                    <input
                                        type="number"
                                        className="form-control shadow-none"
                                        value={bookData.copies}
                                        onChange={(e) => setBookData({ ...bookData, copies: e.target.value })}
                                        min="0"
                                        required
                                    />
                                </div>

                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary btn-lg fw-bold shadow-sm" disabled={loading}>
                                        {loading ? "Saving Changes..." : "Update Book"}
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

export default UpdateBook;