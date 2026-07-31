import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function DeleteBook() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/Book/GetBookById/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(res => setBook(res.data))
            .catch(err => console.error("Error fetching book:", err));
    }, [id]);

    const handleDelete = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/Book/DeleteBook/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setMessage("Book deleted successfully!");
            navigate("/books");
        } catch (err) {
            console.error("Error deleting book:", err);
            setMessage("Failed to delete book.");
        }
    };

    return (
        <div className="container-fluid">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">LibrarySys</Link>
                </div>
            </nav>

            <div className="row">
                <div className="col-md-3 col-lg-2 bg-light border-end vh-100 p-3">
                    <Link to="/books" className="btn btn-secondary w-100">Back to Books</Link>
                </div>
                <div className="col-md-9 col-lg-10 p-4">
                    <h2 className="mb-4">Delete Book</h2>
                    <div className="card shadow-sm">
                        <div className="card-body">
                            {book ? (
                                <>
                                    <p>Are you sure you want to delete <strong>{book.title}</strong> by {book.author}?</p>
                                    <button onClick={handleDelete} className="btn btn-danger">Confirm Delete</button>
                                </>
                            ) : (
                                <p>Loading book details...</p>
                            )}
                            {message && <p className="mt-3 text-info">{message}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeleteBook;