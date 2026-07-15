import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Books() {
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/Book/GetAllBooks`)
            .then(res => setBooks(res.data))
            .catch(err => console.error("Error fetching books:", err));
    }, []);

    const filteredBooks = books.filter(b =>
        b.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.author?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <h2>Books</h2>
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search by title or author..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Copies Available</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBooks.map(book => (
                        <tr key={book.id}>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.copiesAvailable}</td>
                            <td>{book.isAvailable ? "Available" : "Borrowed"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Books;