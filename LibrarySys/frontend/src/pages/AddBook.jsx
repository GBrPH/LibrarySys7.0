import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function AddBook() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [copies, setCopies] = useState(1);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/Book/CreateBook`, {
                id: 0,
                title: title,
                author: author,
                borrowerName: "",                   // Fixes non-nullable string validation
                copiesAvailable: parseInt(copies),  // Matches BookDto property name
                copies: parseInt(copies),           // Matches Book model property name (covers both!)
                isAvailable: true,
                borrowedByUserId: null,
                borrowedDate: null,
                dueDate: null
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setMessage("Book added successfully!");
            navigate("/books");
        } catch (err) {
            console.error("Error adding book:", err);
            setMessage("Failed to add book.");
        }
    };

    return (
        <div className="container-fluid p-0 bg-light min-vh-100">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm px-3">
                <div className="container-fluid">
                    <Link className="navbar-brand fw-bold" to="/">LibrarySys</Link>
                </div>
            </nav>

            <div className="row g-0">
                <div className="col-md-3 col-lg-2 bg-white border-end vh-100 p-3 shadow-sm">
                    <Link to="/books" className="btn btn-secondary w-100">Back to Books</Link>
                </div>

                <div className="col-md-9 col-lg-10 p-4">
                    <h2 className="fw-bold mb-4">Add Book</h2>
                    <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">TITLE</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">AUTHOR</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={author}
                                        onChange={e => setAuthor(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">COPIES AVAILABLE</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={copies}
                                        onChange={e => setCopies(e.target.value)}
                                        min="1"
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-success fw-semibold">Save Book</button>
                            </form>
                            {message && <p className="mt-3 text-info">{message}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddBook;