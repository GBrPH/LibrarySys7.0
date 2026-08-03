import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

function AddBook() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [copies, setCopies] = useState(1);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/Book/CreateBook`, {
                id: 0,
                title: title,
                author: author,
                borrowerName: "",
                copiesAvailable: parseInt(copies),
                copies: parseInt(copies),
                isAvailable: true,
                borrowedByUserId: null,
                borrowedDate: null,
                dueDate: null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage("Book added successfully!");
            setTimeout(() => navigate("/books"), 1000);
        } catch (err) {
            console.error("Error adding book:", err);
            setMessage("Failed to add book.");
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
                    <h3 className="fw-bold mb-4">Add Book</h3>

                    <div className="card border-0 shadow-sm p-4 rounded-4" style={{ maxWidth: "600px" }}>
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
                                    maxLength={100}  /* <-- Add this */
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label text-muted small fw-bold">NUMBER OF COPIES</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={copies}
                                    onChange={e => setCopies(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-success fw-semibold px-4">Save Book</button>
                        </form>

                        {message && <p className="mt-3 text-info mb-0">{message}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddBook;