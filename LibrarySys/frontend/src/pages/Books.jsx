import React, { useEffect, useState } from "react";

function Books() {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/Book/GetAllBooks`)
            .then(response => response.json())
            .then(data => {
                console.log("Books from API:", data); // debug
                setBooks(data);
            })
            .catch(error => console.error("Error fetching books:", error));
    }, []);


    return (
        <div className="container mt-4">
            <h2>Books</h2>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Copies</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map(book => (
                        <tr key={book.id}>
                            <td>{book.id}</td>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.copiesAvailable}</td>
                            <td>
                                <span className={`badge ${book.isAvailable ? "bg-success" : "bg-danger"}`}>
                                    {book.isAvailable ? "Available" : "Borrowed"}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Books;
