import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function BorrowingLog() {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        axios.get(process.env.REACT_APP_API_URL + "/borrowing-log")
            .then(res => setLogs(res.data))
            .catch(err => console.error(err));
    }, []);

    const filteredLogs = logs.filter(log =>
        log.userName.toLowerCase().includes(search.toLowerCase()) ||
        log.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
        log.status.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <h2>Borrowing Log</h2>
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search by user, book, or status..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>User</th><th>Book</th><th>Borrow Date</th><th>Return Date</th><th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLogs.map(log => (
                        <tr key={log.id}>
                            <td>{log.userName}</td>
                            <td>{log.bookTitle}</td>
                            <td>{new Date(log.borrowDate).toLocaleDateString()}</td>
                            <td>{log.returnDate ? new Date(log.returnDate).toLocaleDateString() : "-"}</td>
                            <td>{log.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default BorrowingLog;
