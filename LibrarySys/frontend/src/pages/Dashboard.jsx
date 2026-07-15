import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Dashboard() {
    return (
        <div className="container mt-4">
            <h2>LibrarySys Dashboard</h2>
            <div className="row">
                <div className="col-md-4">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title">Books</h5>
                            <p className="card-text">120</p>
                            <Link to="/books" className="btn btn-primary">View Books</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title">Users</h5>
                            <p className="card-text">45</p>
                            <Link to="/users" className="btn btn-primary">View Users</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title">Borrowed Books</h5>
                            <p className="card-text">18</p>
                            <Link to="/borrowing-log" className="btn btn-primary">View Log</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
