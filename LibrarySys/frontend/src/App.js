import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import AddBook from "./pages/AddBook";
import UpdateBook from "./pages/UpdateBook";
import DeleteBook from "./pages/DeleteBook";
import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import UpdateUser from "./pages/UpdateUser";
import DeleteUser from "./pages/DeleteUser";
import BorrowingLog from "./pages/BorrowingLog";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/books" element={<Books />} />
                <Route path="/add-book" element={<AddBook />} />
                <Route path="/update-book/:id" element={<UpdateBook />} />
                <Route path="/delete-book/:id" element={<DeleteBook />} />
                <Route path="/users" element={<Users />} />
                <Route path="/add-user" element={<AddUser />} />
                <Route path="/update-user/:id" element={<UpdateUser />} />
                <Route path="/delete-user/:id" element={<DeleteUser />} />
                <Route path="/borrowing-log" element={<BorrowingLog />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Routes>
        </Router>
    );
}

export default App;