import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function UpdateBook() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [copies, setCopies] = useState(1);
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/Book/GetBookById/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(res => {
                setTitle(res.data.title);
                setAuthor(res.data.author);
                setCopies(res.data.copiesAvailable);
            })
            .catch(err => console.error("Error fetching book:", err));
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/Book/UpdateBook/${id}`, {
                id,
                title,
                author,
                copiesAvailable: copies
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setMessage("Book updated successfully!");
            navigate("/books");
        } catch (err) {
            console.error("Error updating book:", err);
            setMessage("Failed to update book.");
        }
    };

    return (
        <div className="container-fluid">
            {/* Navbar */}
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
                    <h2 className="mb-4">Update Book</h2>
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Title</label>
                                    <input type="text" className="form-control" value={title}
                                        onChange={e => setTitle(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Author</label>
                                    <input type="text" className="form-control" value={author}
                                        onChange={e => setAuthor(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Copies Available</label>
                                    <input type="number" className="form-control" value={copies}
                                        onChange={e => setCopies(parseInt(e.target.value))} min="1" required />
                                </div>
                                <button type="submit" className="btn btn-warning">Update</button>
                            </form>
                            {message && <p className="mt-3 text-info">{message}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UpdateBook;
