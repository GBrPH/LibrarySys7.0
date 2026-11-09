import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import PrivateRoute from "./components/PrivateRoute";

import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import AddBook from "./pages/AddBook";
import UpdateBook from "./pages/UpdateBook";
import DeleteBook from "./pages/DeleteBook";
import DetailsBook from "./pages/DetailsBook";
import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import UpdateUser from "./pages/UpdateUser";
import DeleteUser from "./pages/DeleteUser";
import BorrowingLog from "./pages/BorrowingLog";
import BorrowBook from "./pages/BorrowBook";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Settings from "./pages/Settings";

function AppContent() {
    const location = useLocation();

    let layoutClass = "layout-default";

    if (location.pathname === '/login' || location.pathname === '/signup') {
        layoutClass = "layout-auth";
    } else if (location.pathname === '/borrowing-log') {
        layoutClass = "layout-logs";
    } else if (location.pathname === '/users') {
        layoutClass = "layout-users";
    } else {
        layoutClass = "layout-default";
    }

    return (
        <div className={`app-wrapper theme-midnight ${layoutClass}`}>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

                <Route path="/books" element={<PrivateRoute><Books /></PrivateRoute>} />
                <Route path="/add-book" element={<PrivateRoute><AddBook /></PrivateRoute>} />
                <Route path="/books/update/:id" element={<PrivateRoute><UpdateBook /></PrivateRoute>} />
                <Route path="/books/delete/:id" element={<PrivateRoute><DeleteBook /></PrivateRoute>} />
                <Route path="/books/details/:id" element={<PrivateRoute><DetailsBook /></PrivateRoute>} />

                <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
                <Route path="/add-user" element={<PrivateRoute><AddUser /></PrivateRoute>} />
                <Route path="/users/update/:id" element={<PrivateRoute><UpdateUser /></PrivateRoute>} />
                <Route path="/users/delete/:id" element={<PrivateRoute><DeleteUser /></PrivateRoute>} />

                <Route path="/borrowing-log" element={<PrivateRoute><BorrowingLog /></PrivateRoute>} />
                <Route path="/borrow" element={<PrivateRoute><BorrowBook /></PrivateRoute>} />

                <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;