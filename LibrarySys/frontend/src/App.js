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
import BorrowBook from "./pages/BorrowBook";
import Login from "./pages/Login";
import Signup from "./pages/Signup";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />

                {/* Books Routes */}
                <Route path="/books" element={<Books />} />
                <Route path="/add-book" element={<AddBook />} />
                <Route path="/books/update/:id" element={<UpdateBook />} />
                <Route path="/books/delete/:id" element={<DeleteBook />} />

                {/* Users Routes */}
                <Route path="/users" element={<Users />} />
                <Route path="/add-user" element={<AddUser />} />
                <Route path="/users/update/:id" element={<UpdateUser />} />
                <Route path="/users/delete/:id" element={<DeleteUser />} />

                {/* Borrowing Routes */}
                <Route path="/borrowing-log" element={<BorrowingLog />} />
                <Route path="/borrow" element={<BorrowBook />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Routes>
        </Router>
    );
}

export default App;