import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function BorrowingLog() {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedLog, setSelectedLog] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetchLogs(); }, []);

    const fetchLogs = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/BorrowingLog/GetAllLog`)
            .then(res => setLogs(res.data))
            .catch(err => console.error("Error fetching logs:", err));
    };

    const handleSave = () => {
        if (selectedLog.id) {
            axios.put(`${process.env.REACT_APP_API_URL}/BorrowingLog/Update/${selectedLog.id}`, selectedLog)
                .then(fetchLogs);
        } else {
            axios.post(`${process.env.REACT_APP_API_URL}/BorrowingLog/Create`, selectedLog)
                .then(fetchLogs);
        }
        setShowModal(false);
    };

    const handleDelete = id => {
        axios.delete(`${process.env.REACT_APP_API_URL}/BorrowingLog/Delete/${id}`)
            .then(fetchLogs);
    };

    const filteredLogs = logs.filter(log =>
        log.username?.toLowerCase().includes(search.toLowerCase()) ||
        log.bookTitle?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <h2>Borrowing Log</h2>
            <div className="d-flex mb-3">
                <input className="form-control me-2" placeholder="Search by user or book..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                <button className="btn btn-success" onClick={() => { setSelectedLog({}); setShowModal(true); }}>
                    Add Log
                </button>
            </div>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>User</th><th>Book</th><th>Borrow Date</th><th>Return Date</th><th>Status</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLogs.map(log => (
                        <tr key={log.id}>
                            <td>{log.username}</td>
                            <td>{log.bookTitle}</td>
                            <td>{new Date(log.borrowDate).toLocaleDateString()}</td>
                            <td>{log.returnDate ? new Date(log.returnDate).toLocaleDateString() : "-"}</td>
                            <td>{log.isOverdue ? "Overdue" : "Active"}</td>
                            <td>
                                <button className="btn btn-sm btn-primary me-2"
                                    onClick={() => { setSelectedLog(log); setShowModal(true); }}>Edit</button>
                                <button className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(log.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal show d-block">
                    <div className="modal-dialog"><div className="modal-content">
                        <div className="modal-header">
                            <h5>{selectedLog.id ? "Edit Log" : "Add Log"}</h5>
                            <button className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <input className="form-control mb-2" placeholder="User"
                                value={selectedLog.username || ""}
                                onChange={e => setSelectedLog({ ...selectedLog, username: e.target.value })} />
                            <input className="form-control mb-2" placeholder="Book"
                                value={selectedLog.bookTitle || ""}
                                onChange={e => setSelectedLog({ ...selectedLog, bookTitle: e.target.value })} />
                            <input className="form-control mb-2" type="date" placeholder="Borrow Date"
                                value={selectedLog.borrowDate ? selectedLog.borrowDate.split("T")[0] : ""}
                                onChange={e => setSelectedLog({ ...selectedLog, borrowDate: e.target.value })} />
                            <input className="form-control mb-2" type="date" placeholder="Return Date"
                                value={selectedLog.returnDate ? selectedLog.returnDate.split("T")[0] : ""}
                                onChange={e => setSelectedLog({ ...selectedLog, returnDate: e.target.value })} />
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input"
                                    checked={selectedLog.isOverdue || false}
                                    onChange={e => setSelectedLog({ ...selectedLog, isOverdue: e.target.checked })} />
                                <label className="form-check-label">Overdue</label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Save</button>
                        </div>
                    </div></div>
                </div>
            )}
        </div>
    );
}

export default BorrowingLog;
