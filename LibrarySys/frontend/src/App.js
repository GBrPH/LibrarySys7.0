import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
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
// import SignUp from "./pages/SignUp";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />

                <Route path="/books" element={<Books />} />
                <Route path="/books/add" element={<AddBook />} />
                <Route path="/books/update/:id" element={<UpdateBook />} />
                <Route path="/books/delete/:id" element={<DeleteBook />} />

                <Route path="/users" element={<Users />} />
                <Route path="/users/add" element={<AddUser />} />
                <Route path="/users/update/:id" element={<UpdateUser />} />
                <Route path="/users/delete/:id" element={<DeleteUser />} />

                <Route path="/borrowing-log" element={<BorrowingLog />} />

                <Route path="/login" element={<Login />} />
                {/* <Route path="/signup" element={<SignUp />} /> */}
            </Routes>
        </Router>
    );
}

export default App;
